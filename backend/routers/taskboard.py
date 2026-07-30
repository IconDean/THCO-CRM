"""
Task Board router — Trello-like boards and cards.

A board is a Trello "list" (a column). A card is a task inside a board.
Boards and cards live in two collections so a card move never rewrites a
whole board document, and the board view stays a single round-trip.

  GET    /api/tasks/boards                 list boards (each with cards embedded)
  POST   /api/tasks/boards                 create a board
  PATCH  /api/tasks/boards/{id}            rename a board
  DELETE /api/tasks/boards/{id}            delete a board (+ its cards)
  POST   /api/tasks/boards/{id}/cards      add a card to a board
  PATCH  /api/tasks/cards/{id}             edit a card (title/desc/labels/...)
  DELETE /api/tasks/cards/{id}             delete a card
  POST   /api/tasks/reorder                persist a new layout after a drag

Any authenticated user can manage boards (the /tasks page has no unit gate).
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import re

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Will be set from server.py
db = None


def set_db(database):
    global db
    db = database


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class BoardCreate(BaseModel):
    title: str


class BoardUpdate(BaseModel):
    title: Optional[str] = None


class LabelRef(BaseModel):
    """A label attached to a card. Persisted as a rich object (id + name + color)
    so cards render correctly even if a label is later renamed/deleted."""
    label_id: str
    name: str
    color: str = "#1B4332"


class AssigneeRef(BaseModel):
    """An assignee attached to a card. Persisted as a rich object snapshot
    (id + name + email + picture + role) for fast rendering."""
    user_id: str
    name: str = ""
    email: str = ""
    picture: Optional[str] = None
    role: str = ""


class CardCreate(BaseModel):
    title: str
    description: str = ""
    labels: List[LabelRef] = []
    assignees: List[AssigneeRef] = []
    due_date: Optional[str] = None


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    labels: Optional[List[LabelRef]] = None
    assignees: Optional[List[AssigneeRef]] = None
    due_date: Optional[str] = None


class CardPosition(BaseModel):
    card_id: str
    board_id: str
    position: int


class ReorderRequest(BaseModel):
    board_order: List[str] = []
    cards: List[CardPosition] = []


# ---------------------------------------------------------------------------
# Labels — persistent, reusable across all tasks/boards
# ---------------------------------------------------------------------------
class LabelCreate(BaseModel):
    name: str
    color: str = "#1B4332"



class LabelUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


async def _next_board_position() -> int:
    """Position a new board after the last existing one."""
    last = await db.task_boards.find_one(sort=[("position", -1)])
    return (last.get("position", -1) + 1) if last else 0


async def _next_card_position(board_id: str) -> int:
    last = await db.task_cards.find_one({"board_id": board_id}, sort=[("position", -1)])
    return (last.get("position", -1) + 1) if last else 0

# Cycle through a set of predefined colors for new labels
LABEL_COLORS = [
    "#1B4332", "#4C5B6B", "#8F7340", "#A94E5B", "#6B4C5B", "#4C6B5B", "#5B4C6B", "#73408F",
    "#C6A15B", "#D6BC8A", "#2D6A4F", "#1FB58A", "#F7F6F3", "#EAE7E0", "#F0EEE9", "#FBFAF7",
]
async def _next_label_color() -> str:
    current_labels_count = await db.task_labels.count_documents({})
    return LABEL_COLORS[current_labels_count % len(LABEL_COLORS)]


# ---------------------------------------------------------------------------
# Team Members — public list for populating assignee dropdowns
# ---------------------------------------------------------------------------
@router.get("/team-members")
async def list_team_members(request: Request):
    await _current(request) # Ensure authenticated
    members = await db.users.find(
        {"role": {"$in": ["team_member", "mini_admin", "super_admin"]}},
        {"_id": 0, "user_id": 1, "name": 1, "email": 1, "picture": 1, "role": 1}
    ).to_list(length=1000)
    return members


# ---------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------
@router.get("/labels")
async def list_labels(request: Request):
    await _current(request)
    labels = await db.task_labels.find({}, {"_id": 0}).sort("name", 1).to_list(length=1000)
    return labels

@router.post("/labels")
async def create_label(data: LabelCreate, request: Request):
    await _current(request)
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Label name cannot be empty")
    
    # Check for existing label with the same name (case-insensitive)
    existing = await db.task_labels.find_one({"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=409, detail="Label with this name already exists")

    label = {
        "label_id": f"label_{uuid.uuid4().hex[:12]}",
        "name": name,
        "color": data.color if data.color else await _next_label_color(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.task_labels.insert_one(label)
    return serialize(label)

@router.patch("/labels/{label_id}")
async def update_label(label_id: str, data: LabelUpdate, request: Request):
    await _current(request)
    existing = await db.task_labels.find_one({"label_id": label_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Label not found")

    update = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if "name" in update and not update["name"].strip():
        raise HTTPException(status_code=400, detail="Label name cannot be empty")
    
    if "name" in update and update["name"].lower() != existing["name"].lower():
        # Check for conflicts with other labels if name is being changed
        conflict = await db.task_labels.find_one(
            {"label_id": {"$ne": label_id}, "name": {"$regex": f"^{re.escape(update['name'])}$", "$options": "i"}}
        )
        if conflict:
            raise HTTPException(status_code=409, detail="Another label with this name already exists")

    update["updated_at"] = now_iso()
    await db.task_labels.update_one({"label_id": label_id}, {"$set": update})
    label = await db.task_labels.find_one({"label_id": label_id}, {"_id": 0})
    return serialize(label)

@router.delete("/labels/{label_id}")
async def delete_label(label_id: str, request: Request):
    await _current(request)
    res = await db.task_labels.delete_one({"label_id": label_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Label not found")
    
    # Also remove this label from any tasks that use it (labels are rich objects)
    await db.task_cards.update_many(
        {"labels.label_id": label_id},
        {"$pull": {"labels": {"label_id": label_id}}}
    )
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


async def _next_board_position() -> int:
    """Position a new board after the last existing one."""
    last = await db.task_boards.find_one(sort=[("position", -1)])
    return (last.get("position", -1) + 1) if last else 0


async def _next_card_position(board_id: str) -> int:
    last = await db.task_cards.find_one({"board_id": board_id}, sort=[("position", -1)])
    return (last.get("position", -1) + 1) if last else 0


# ---------------------------------------------------------------------------
# Boards
# ---------------------------------------------------------------------------
@router.get("/boards")
async def list_boards(request: Request):
    """Return all boards with their cards embedded, sorted by position."""
    await _current(request)
    boards = []
    async for b in db.task_boards.find({}, {"_id": 0}).sort("position", 1):
        b = dict(b)
        cards = (
            await db.task_cards.find({"board_id": b["board_id"]}, {"_id": 0})
            .sort("position", 1)
            .to_list(length=10000)
        )
        b["cards"] = cards
        boards.append(b)
    return boards


@router.post("/boards")
async def create_board(data: BoardCreate, request: Request):
    user = await _current(request)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Board title cannot be empty")
    board = {
        "board_id": f"board_{uuid.uuid4().hex[:12]}",
        "title": title,
        "owner_id": user.get("user_id"),
        "position": await _next_board_position(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.task_boards.insert_one(board)
    board["cards"] = []
    return serialize(board)


@router.patch("/boards/{board_id}")
async def update_board(board_id: str, data: BoardUpdate, request: Request):
    await _current(request)
    existing = await db.task_boards.find_one({"board_id": board_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Board not found")

    update = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if "title" in update and not update["title"].strip():
        raise HTTPException(status_code=400, detail="Board title cannot be empty")
    update["updated_at"] = now_iso()
    await db.task_boards.update_one({"board_id": board_id}, {"$set": update})
    board = await db.task_boards.find_one({"board_id": board_id}, {"_id": 0})
    return serialize(board)


@router.delete("/boards/{board_id}")
async def delete_board(board_id: str, request: Request):
    await _current(request)
    res = await db.task_boards.delete_one({"board_id": board_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Board not found")
    # cascade: delete the board's cards too
    await db.task_cards.delete_many({"board_id": board_id})
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------
@router.post("/boards/{board_id}/cards")
async def create_card(board_id: str, data: CardCreate, request: Request):
    user = await _current(request)
    board = await db.task_boards.find_one({"board_id": board_id}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Card title cannot be empty")

    card = {
        "card_id": f"card_{uuid.uuid4().hex[:12]}",
        "board_id": board_id,
        "owner_id": user.get("user_id"),
        "title": title,
        "description": data.description,
        "labels": [l.dict() for l in data.labels],
        "assignees": [a.dict() for a in data.assignees],
        "due_date": data.due_date,
        "position": await _next_card_position(board_id),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.task_cards.insert_one(card)
    return serialize(card)


@router.patch("/cards/{card_id}")
async def update_card(card_id: str, data: CardUpdate, request: Request):
    await _current(request)
    existing = await db.task_cards.find_one({"card_id": card_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Card not found")

    update = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    if "title" in update and not update["title"].strip():
        raise HTTPException(status_code=400, detail="Card title cannot be empty")
    # Convert nested label/assignee model objects to plain dicts for Mongo
    if "labels" in update:
        update["labels"] = [l if isinstance(l, dict) else l.dict() for l in update["labels"]]
    if "assignees" in update:
        update["assignees"] = [a if isinstance(a, dict) else a.dict() for a in update["assignees"]]
    update["updated_at"] = now_iso()
    await db.task_cards.update_one({"card_id": card_id}, {"$set": update})
    card = await db.task_cards.find_one({"card_id": card_id}, {"_id": 0})
    return serialize(card)


@router.delete("/cards/{card_id}")
async def delete_card(card_id: str, request: Request):
    await _current(request)
    res = await db.task_cards.delete_one({"card_id": card_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"deleted": True}


# ---------------------------------------------------------------------------
# Reorder — persist a full board/card layout after a drag
# ---------------------------------------------------------------------------
@router.post("/reorder")
async def reorder(data: ReorderRequest, request: Request):
    await _current(request)
    now = now_iso()

    # 1. Reorder boards
    for index, board_id in enumerate(data.board_order):
        await db.task_boards.update_one(
            {"board_id": board_id}, {"$set": {"position": index, "updated_at": now}}
        )

    # 2. Reorder/move cards
    for item in data.cards:
        await db.task_cards.update_one(
            {"card_id": item.card_id},
            {"$set": {"board_id": item.board_id, "position": item.position, "updated_at": now}},
        )

    return {"ok": True, "boards": len(data.board_order), "cards": len(data.cards)}


# ---------------------------------------------------------------------------
# Internal
# ---------------------------------------------------------------------------
async def _current(request: Request) -> dict:
    from server import get_current_user
    return await get_current_user(request)
