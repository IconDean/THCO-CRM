import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FlowShell from "./FlowShell";
import { flowAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Loader2, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

const STAGE_COLORS = {
  1: "border-gray-300", 2: "border-blue-300", 3: "border-blue-400", 4: "border-cyan-400",
  5: "border-indigo-400", 6: "border-amber-400", 7: "border-amber-500", 8: "border-orange-400",
  9: "border-purple-400", 10: "border-green-400", 11: "border-emerald-500", 12: "border-gray-400",
};

export default function FlowBoard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(null); // { project, fromStage }
  const [hoverStage, setHoverStage] = useState(null);
  const [moving, setMoving] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await flowAPI.getBoard();
    setData(d);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onDragStart = (e, project, fromStage) => {
    setDragging({ project, fromStage });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", project.id);
  };

  const onDragOver = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (hoverStage !== stage) setHoverStage(stage);
  };

  const onDragLeave = () => setHoverStage(null);

  const onDrop = async (e, targetStage) => {
    e.preventDefault();
    setHoverStage(null);
    if (!dragging) return;
    const { project, fromStage } = dragging;
    setDragging(null);
    if (fromStage === targetStage) return;

    // Optimistic update
    setData(prev => {
      const board = { ...prev.board };
      board[fromStage] = (board[fromStage] || []).filter(p => p.id !== project.id);
      const updated = { ...project, stage: targetStage };
      board[targetStage] = [updated, ...(board[targetStage] || [])];
      return { ...prev, board };
    });

    setMoving(true);
    try {
      await flowAPI.transitionStage(project.id, targetStage, "Moved via Kanban drag-drop");
      toast.success(`Moved to Stage ${targetStage}`);
      load(); // re-sync stage_history + audit
    } catch (err) {
      toast.error(err.response?.data?.detail || "Move failed — reverting");
      load(); // revert from server
    } finally { setMoving(false); }
  };

  if (loading) {
    return <FlowShell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" /></div></FlowShell>;
  }
  if (!data) return <FlowShell><p className="text-gray-500">No data.</p></FlowShell>;

  return (
    <FlowShell
      title={`Pipeline (Kanban)${moving ? " — saving…" : ""}`}
      action={
        <Link to="/flow/projects/new">
          <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white" data-testid="board-new-btn">
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </Link>
      }
    >
      <p className="text-xs text-gray-400 mb-3">Drag a card to a different column to advance or revert its stage. Stage transitions trigger automated emails to the role next-in-line.</p>

      <div className="overflow-x-auto pb-2" data-testid="kanban-board">
        <div className="flex gap-3 min-w-min">
          {data.stages.map((s) => {
            const cards = data.board[s.stage] || [];
            const isHover = hoverStage === s.stage;
            return (
              <div
                key={s.stage}
                onDragOver={(e) => onDragOver(e, s.stage)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, s.stage)}
                className={`min-w-[260px] w-[260px] bg-gray-50 rounded-xl border-t-4 ${STAGE_COLORS[s.stage]} p-3 transition ${
                  isHover ? "ring-2 ring-[#1B4332] bg-[#1B4332]/5" : ""
                }`}
                data-testid={`column-stage-${s.stage}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-gray-400">STAGE {s.stage}</p>
                    <h3 className="text-sm font-semibold text-gray-900">{s.label}</h3>
                  </div>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 font-medium">
                    {cards.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      draggable={!moving}
                      onDragStart={(e) => onDragStart(e, c, s.stage)}
                      className={`bg-white rounded-lg p-3 border border-gray-100 hover:border-[#1B4332] hover:shadow-sm transition cursor-move active:opacity-50 ${
                        dragging?.project.id === c.id ? "opacity-40" : ""
                      }`}
                      data-testid={`card-${c.id}`}
                    >
                      <Link to={`/flow/projects/${c.id}`} onClick={(e) => e.stopPropagation()} className="block">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{c.name}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{c.client_name_snapshot}</span>
                        </div>
                        {c.project_id_display && (
                          <p className="text-[10px] font-mono text-gray-400 mt-1">{c.project_id_display}</p>
                        )}
                        {c.delivery_owner_name && (
                          <p className="text-[10px] text-gray-500 mt-1">Owner: <span className="font-medium">{c.delivery_owner_name}</span></p>
                        )}
                      </Link>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <p className="text-xs text-gray-300 italic text-center py-4">
                      {isHover ? "Drop here →" : "No projects"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FlowShell>
  );
}
