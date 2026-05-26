import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FlowShell from "./FlowShell";
import { flowAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Loader2, Plus, Building2 } from "lucide-react";

const STAGE_COLORS = {
  1: "border-gray-300", 2: "border-blue-300", 3: "border-blue-400", 4: "border-cyan-400",
  5: "border-indigo-400", 6: "border-amber-400", 7: "border-amber-500", 8: "border-orange-400",
  9: "border-purple-400", 10: "border-green-400", 11: "border-emerald-500", 12: "border-gray-400",
};

export default function FlowBoard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flowAPI.getBoard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <FlowShell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" /></div></FlowShell>;
  }
  if (!data) return <FlowShell><p className="text-gray-500">No data.</p></FlowShell>;

  return (
    <FlowShell
      title="Pipeline (Kanban)"
      action={
        <Link to="/flow/projects/new">
          <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white" data-testid="board-new-btn">
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        </Link>
      }
    >
      <div className="overflow-x-auto pb-2" data-testid="kanban-board">
        <div className="flex gap-3 min-w-min">
          {data.stages.map((s) => {
            const cards = data.board[s.stage] || [];
            return (
              <div key={s.stage} className={`min-w-[260px] w-[260px] bg-gray-50 rounded-xl border-t-4 ${STAGE_COLORS[s.stage]} p-3`} data-testid={`column-stage-${s.stage}`}>
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
                    <Link
                      key={c.id}
                      to={`/flow/projects/${c.id}`}
                      className="block bg-white rounded-lg p-3 border border-gray-100 hover:border-[#1B4332] hover:shadow-sm transition"
                      data-testid={`card-${c.id}`}
                    >
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
                  ))}
                  {cards.length === 0 && (
                    <p className="text-xs text-gray-300 italic text-center py-4">No projects</p>
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
