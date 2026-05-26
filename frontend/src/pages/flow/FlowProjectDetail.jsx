import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FlowShell from "./FlowShell";
import { flowAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Loader2, ArrowLeft, ChevronRight, Building2, Globe, Calendar, User, ArrowRight, X, History } from "lucide-react";

const STAGES = {
  1: "Prospect", 2: "Qualified & Assigned", 3: "Discovery Scheduled",
  4: "Package Building", 5: "Package Sent", 6: "Pricing & Proposal",
  7: "Approved by Exec", 8: "Sent to Client", 9: "Contract Drafting",
  10: "Contract Signed", 11: "In Delivery", 12: "Completed",
};

export default function FlowProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [loseReason, setLoseReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await flowAPI.getProject(id);
      setProject(data);
    } catch {
      toast.error("Project not found");
      navigate("/flow/projects");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const advance = async (target) => {
    setTransitioning(true);
    try {
      const note = window.prompt(`Move to Stage ${target} (${STAGES[target]}). Add a note (optional):`) || "";
      await flowAPI.transitionStage(id, target, note);
      toast.success(`Moved to Stage ${target}: ${STAGES[target]}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Transition failed");
    } finally { setTransitioning(false); }
  };

  const submitLose = async () => {
    try {
      await flowAPI.loseProject(id, loseReason);
      toast.success("Project marked as lost");
      setShowLose(false);
      load();
    } catch (e) {
      toast.error("Failed to mark lost");
    }
  };

  if (loading) return <FlowShell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" /></div></FlowShell>;
  if (!project) return null;

  const stage = project.stage;
  const isLost = project.status === "lost";

  return (
    <FlowShell
      action={
        <Link to="/flow/projects">
          <Button variant="ghost" size="sm" data-testid="back-btn"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        </Link>
      }
    >
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" data-testid="project-detail">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] font-mono text-gray-400 mb-1">{project.project_id_display}</p>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{project.client_name_snapshot}</span>
              {project.website && <a href={project.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#1B4332] hover:underline"><Globe className="w-3.5 h-3.5" />{project.website}</a>}
              {project.delivery_owner_name && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{project.delivery_owner_name}</span>}
            </div>
          </div>
          {isLost ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">LOST</span>
          ) : (
            <span className="px-3 py-1 bg-[#1B4332] text-white text-xs font-semibold rounded-full" data-testid="current-stage">Stage {stage} — {STAGES[stage]}</span>
          )}
        </div>

        {project.description && <p className="text-sm text-gray-600 my-4 leading-relaxed">{project.description}</p>}

        {/* Stage progression */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs uppercase text-gray-400 mb-3 font-semibold tracking-widest">Stage progression</p>
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(STAGES).map(([k, label]) => {
              const sk = parseInt(k);
              const done = sk < stage;
              const cur = sk === stage;
              return (
                <div key={k} className="flex items-center">
                  <button
                    disabled={transitioning || isLost || cur}
                    onClick={() => advance(sk)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      cur ? "bg-[#1B4332] text-white" :
                      done ? "bg-green-100 text-green-800 hover:bg-green-200" :
                      "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    } ${transitioning || isLost ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    data-testid={`stage-btn-${sk}`}
                    title={label}
                  >
                    <span className="font-mono">{sk}</span>
                    <span className="hidden md:inline">{label}</span>
                  </button>
                  {sk < 12 && <ChevronRight className="w-3 h-3 text-gray-300 mx-0.5" />}
                </div>
              );
            })}
          </div>
          {!isLost && stage < 12 && (
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={() => advance(stage + 1)} disabled={transitioning} className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white" data-testid="advance-btn">
                {transitioning ? "Moving..." : <>Advance to Stage {stage + 1} <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
              {stage >= 6 && stage <= 8 && (
                <Button variant="outline" onClick={() => setShowLose(true)} className="text-red-600 hover:bg-red-50" data-testid="lose-btn">
                  Mark Lost
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stage History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><History className="w-4 h-4" />Stage history</h3>
        {(project.stage_history || []).length === 0 ? (
          <p className="text-sm text-gray-400">No transitions yet.</p>
        ) : (
          <ol className="space-y-2">
            {project.stage_history.map((h, i) => (
              <li key={i} className="flex items-center gap-3 text-sm" data-testid={`history-${i}`}>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">Stage {h.stage}</span>
                <span className="text-gray-700">{h.by_name}</span>
                <span className="text-xs text-gray-400">{new Date(h.at).toLocaleString()}</span>
                {h.note && <span className="text-gray-500 italic">— {h.note}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
        {(project.milestones || []).length === 0 ? (
          <p className="text-sm text-gray-400">No milestones yet. Add them once we're in delivery.</p>
        ) : (
          <ul className="space-y-2">
            {project.milestones.map((m) => (
              <li key={m.milestone_id} className="flex items-center justify-between text-sm border-b border-gray-50 py-2">
                <span>{m.milestone_name}</span>
                <span className="text-xs text-gray-500">{m.target_date || "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tickets */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Engineering tickets</h3>
        {(project.tickets || []).length === 0 ? (
          <p className="text-sm text-gray-400">No tickets yet.</p>
        ) : (
          <ul className="space-y-2">
            {project.tickets.map((t) => (
              <li key={t.ticket_id} className="flex items-center justify-between text-sm border-b border-gray-50 py-2">
                <span>{t.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lost modal */}
      {showLose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" data-testid="lose-modal">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Mark project as lost</h3>
              <button onClick={() => setShowLose(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <textarea rows={3} value={loseReason} onChange={(e) => setLoseReason(e.target.value)} placeholder="Reason / learnings..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLose(false)}>Cancel</Button>
              <Button onClick={submitLose} className="bg-red-600 hover:bg-red-700 text-white" data-testid="lose-confirm">Mark Lost</Button>
            </div>
          </div>
        </div>
      )}
    </FlowShell>
  );
}
