import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FlowShell from "./FlowShell";
import { flowAPI } from "../../lib/api";
import { Briefcase, ClipboardCheck, FileText, Scale, Calendar, AlertCircle, Target, Ticket, Loader2 } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, link, testId }) => {
  const inner = (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition ${link ? "cursor-pointer" : ""}`} data-testid={testId}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
};

export default function FlowDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flowAPI.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <FlowShell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" /></div></FlowShell>;
  }
  if (!data) {
    return <FlowShell><p className="text-gray-500">Could not load dashboard.</p></FlowShell>;
  }

  const pipeline = data.pipeline_counts || {};
  const stages = data.stages_meta || {};

  return (
    <FlowShell title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard testId="stat-active" icon={Briefcase} label="My active projects" value={data.my_active_projects} color="bg-[#1B4332]" link="/flow/projects" />
        <StatCard testId="stat-approval" icon={ClipboardCheck} label="Awaiting executive approval" value={data.approval_queue} color="bg-amber-500" link="/flow/projects?stage=6" />
        <StatCard testId="stat-proposals" icon={FileText} label="Pending proposals" value={data.pending_proposals} color="bg-indigo-600" link="/flow/projects?stage=5" />
        <StatCard testId="stat-contracts" icon={Scale} label="Pending contracts" value={data.pending_contracts} color="bg-purple-600" link="/flow/projects?stage=9" />
        <StatCard testId="stat-events" icon={Calendar} label="Events next 7 days" value={data.upcoming_events_7d} color="bg-pink-500" link="/flow/calendar" />
        <StatCard testId="stat-invoices" icon={AlertCircle} label="Overdue invoices" value={data.overdue_invoices} color="bg-red-500" />
        <StatCard testId="stat-tickets" icon={Ticket} label="My tickets" value={data.my_tickets} color="bg-cyan-600" link="/flow/tickets" />
        <StatCard testId="stat-prospects" icon={Target} label="Prospects total" value={Object.values(data.prospect_counts || {}).reduce((a, b) => a + b, 0)} color="bg-emerald-600" link="/flow/prospects" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pipeline by stage</h3>
          <div className="space-y-2">
            {Object.entries(stages).map(([k, v]) => {
              const count = pipeline[k] || 0;
              const max = Math.max(...Object.values(pipeline), 1);
              return (
                <Link key={k} to={`/flow/projects?stage=${k}`} className="flex items-center gap-3 group" data-testid={`pipeline-row-${k}`}>
                  <span className="text-xs text-gray-400 w-6">{k}</span>
                  <span className="text-sm text-gray-700 w-44 truncate group-hover:text-[#1B4332]">{v.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B4332] rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming events</h3>
            <Link to="/flow/calendar" className="text-xs text-[#1B4332] hover:underline">View all</Link>
          </div>
          {(data.events || []).length === 0 ? (
            <p className="text-sm text-gray-400">No events in the next 7 days.</p>
          ) : (
            <ul className="space-y-2">
              {data.events.map((e) => (
                <li key={e.event_id} className="flex items-center justify-between text-sm" data-testid={`event-${e.event_id}`}>
                  <div>
                    <p className="text-gray-900 font-medium">{e.contact_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{e.event_type}</p>
                  </div>
                  <span className="text-xs text-[#1B4332] font-semibold">{e.days_until === 0 ? "Today" : `${e.days_until}d`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </FlowShell>
  );
}
