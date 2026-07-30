import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { tasksAPI } from "../../lib/api";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import AddBoard from "./AddBoard";

/**
 * Top-level Trello-like board.
 *
 * State: boards[] where each board holds its own cards[] in display order.
 * Drag operations (reorder card within a board, move card between boards,
 * reorder boards) update local state optimistically, then persist the whole
 * layout to the backend in a single /tasks/reorder call.
 */
export default function TaskBoard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null); // card being dragged (for overlay)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    try {
      const data = await tasksAPI.listBoards();
      setBoards(
        (data || []).map((b) => ({
          board_id: b.board_id,
          title: b.title,
          position: b.position,
          cards: b.cards || [],
        }))
      );
    } catch {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---- find which board contains a given card id (or the board id itself) ----
  const findContainer = (id) => {
    if (boards.some((b) => b.board_id === id)) return id; // it's a board
    const board = boards.find((b) => b.cards.some((c) => c.card_id === id));
    return board ? board.board_id : null;
  };

  // ---- persist the current layout (board order + card positions) ----
  const persist = async (nextBoards) => {
    try {
      await tasksAPI.reorder(
        nextBoards.map((b) => b.board_id),
        nextBoards.flatMap((b) =>
          b.cards.map((c, i) => ({
            card_id: c.card_id,
            board_id: b.board_id,
            position: i,
          }))
        )
      );
    } catch {
      toast.error("Couldn't save the new order — reordering may reset on refresh");
    }
  };

  // ===================== Drag handlers =====================
  const onDragStart = ({ active }) => {
    if (active.data.current?.type === "card") {
      const board = boards.find((b) => b.cards.some((c) => c.card_id === active.id));
      setActiveCard(board?.cards.find((c) => c.card_id === active.id) || null);
    }
  };

  const onDragOver = ({ active, over }) => {
    setActiveCard((c) => c); // keep overlay
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Only cards cross containers; board reordering is finalized on drop.
    if (active.data.current?.type !== "card") return;

    const activeContainer = findContainer(activeId);
    const overContainer =
      over.data.current?.type === "board" ? overId : findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setBoards((prev) => {
      const activeBoard = prev.find((b) => b.board_id === activeContainer);
      const overBoard = prev.find((b) => b.board_id === overContainer);
      if (!activeBoard || !overBoard) return prev;
      const card = activeBoard.cards.find((c) => c.card_id === activeId);
      if (!card) return prev;

      return prev.map((b) => {
        if (b.board_id === activeContainer) {
          return { ...b, cards: b.cards.filter((c) => c.card_id !== activeId) };
        }
        if (b.board_id === overContainer) {
          const overIndex =
            overId === overContainer
              ? b.cards.length
              : b.cards.findIndex((c) => c.card_id === overId);
          const insertAt = overIndex === -1 ? b.cards.length : overIndex;
          const newCards = [...b.cards];
          newCards.splice(insertAt, 0, { ...card, board_id: overContainer });
          return { ...b, cards: newCards };
        }
        return b;
      });
    });
  };

  const onDragEnd = ({ active, over }) => {
    setActiveCard(null);
    if (!over) return;

    // ---- Reorder a whole board ----
    if (active.data.current?.type === "board") {
      if (active.id === over.id) return;
      setBoards((prev) => {
        const oldIndex = prev.findIndex((b) => b.board_id === active.id);
        const newIndex = prev.findIndex((b) => b.board_id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        persist(next);
        return next;
      });
      return;
    }

    // ---- Reorder / drop a card ----
    if (active.data.current?.type === "card") {
      const container = findContainer(active.id);
      if (!container) return;
      setBoards((prev) => {
        const board = prev.find((b) => b.board_id === container);
        if (!board) return prev;
        // if dropped over the container itself, nothing to reorder
        if (over.id === container) {
          persist(prev);
          return prev;
        }
        const oldIndex = board.cards.findIndex((c) => c.card_id === active.id);
        const newIndex = board.cards.findIndex((c) => c.card_id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          persist(prev);
          return prev;
        }
        const newCards = arrayMove(board.cards, oldIndex, newIndex);
        const next = prev.map((b) =>
          b.board_id === container ? { ...b, cards: newCards } : b
        );
        persist(next);
        return next;
      });
    }
  };

  // ===================== Mutations =====================
  const createBoard = async (title) => {
    try {
      const board = await tasksAPI.createBoard(title);
      setBoards((prev) => [
        ...prev,
        { board_id: board.board_id, title: board.title, position: board.position, cards: [] },
      ]);
      toast.success(`Board "${title}" created`);
    } catch {
      toast.error("Failed to create board");
    }
  };

  const renameBoard = async (boardId, title) => {
    const prev = boards;
    setBoards((bs) => bs.map((b) => (b.board_id === boardId ? { ...b, title } : b)));
    try {
      await tasksAPI.updateBoard(boardId, { title });
    } catch {
      setBoards(prev);
      toast.error("Failed to rename board");
    }
  };

  const deleteBoard = async (boardId) => {
    const prev = boards;
    const board = boards.find((b) => b.board_id === boardId);
    setBoards((bs) => bs.filter((b) => b.board_id !== boardId));
    try {
      await tasksAPI.deleteBoard(boardId);
      toast.success(`Deleted board "${board?.title || ""}"`);
    } catch {
      setBoards(prev);
      toast.error("Failed to delete board");
    }
  };

  const addCard = async (boardId, data) => {
    try {
      const card = await tasksAPI.createCard(boardId, data);
      setBoards((bs) =>
        bs.map((b) =>
          b.board_id === boardId ? { ...b, cards: [...b.cards, card] } : b
        )
      );
    } catch {
      toast.error("Failed to add task");
    }
  };

  const renameCard = async (cardId, title) => {
    const prev = boards;
    setBoards((bs) =>
      bs.map((b) => ({
        ...b,
        cards: b.cards.map((c) => (c.card_id === cardId ? { ...c, title } : c)),
      }))
    );
    try {
      await tasksAPI.updateCard(cardId, { title });
    } catch {
      setBoards(prev);
      toast.error("Failed to rename task");
    }
  };

  const editCard = async (cardId, data) => {
    const prev = boards;
    setBoards((bs) =>
      bs.map((b) => ({
        ...b,
        cards: b.cards.map((c) => (c.card_id === cardId ? { ...c, ...data } : c)),
      }))
    );
    try {
      await tasksAPI.updateCard(cardId, data);
      toast.success("Task updated");
    } catch {
      setBoards(prev);
      toast.error("Failed to update task");
    }
  };

  const deleteCard = async (cardId) => {
    const prev = boards;
    setBoards((bs) =>
      bs.map((b) => ({ ...b, cards: b.cards.filter((c) => c.card_id !== cardId) }))
    );
    try {
      await tasksAPI.deleteCard(cardId);
      toast.success("Task deleted");
    } catch {
      setBoards(prev);
      toast.error("Failed to delete task");
    }
  };

  // ===================== Render =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" />
      </div>
    );
  }

  if (boards.length === 0) {
    return <EmptyState onAdd={() => createBoard("New Board").then(() => {})} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      data-testid="task-dnd-context"
    >
      <div
        className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:thin]"
        data-testid="task-board-scroll"
      >
        <SortableContext
          items={boards.map((b) => b.board_id)}
          strategy={horizontalListSortingStrategy}
        >
          {boards.map((board) => (
            <BoardColumn
              key={board.board_id}
              board={board}
              onRenameBoard={renameBoard}
              onDeleteBoard={deleteBoard}
              onRenameCard={renameCard}
              onEditCard={editCard}
              onDeleteCard={deleteCard}
              onAddCard={addCard}
            />
          ))}
        </SortableContext>

        <AddBoard onCreate={createBoard} />
      </div>

      {/* Drag overlay — elevated preview so the source slot can stay as placeholder (no flicker) */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeCard ? (
          <TaskCard card={activeCard} boardId="" isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
