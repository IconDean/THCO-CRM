import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  Megaphone, 
  Briefcase, 
  Code, 
  Building2, 
  GraduationCap, 
  Truck,
  Wrench,
  Activity,
  Clock,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { dashboardAPI, activityAPI, authAPI } from "../lib/api";

const UNITS = [
  { 
    name: "Talent & Human Capital", 
    slug: "talent", 
    icon: Users, 
    path: "/talent", 
    active: true,
    description: "AI-powered recruiting, sourcing, and talent operations",
    toolCount: 2
  },
  { 
    name: "Sales & Business Development", 
    slug: "sales", 
    icon: TrendingUp, 
    path: "/sales", 
    active: false,
    description: "Pipeline management, proposals, and client engagement",
    toolCount: 0
  },
  { 
    name: "Marketing & Brand", 
    slug: "marketing", 
    icon: Megaphone, 
    path: "/marketing", 
    active: false,
    description: "Content creation, campaigns, and brand management",
    toolCount: 0
  },
  { 
    name: "Advisory & Consulting", 
    slug: "advisory", 
    icon: Briefcase, 
    path: "/advisory", 
    active: false,
    description: "Project delivery, research, and client advisory tools",
    toolCount: 0
  },
  { 
    name: "Technology & Build", 
    slug: "technology", 
    icon: Code, 
    path: "/technology", 
    active: false,
    description: "Product development, engineering, and AI tools",
    toolCount: 0
  },
  { 
    name: "Operations & Finance", 
    slug: "operations", 
    icon: Building2, 
    path: "/operations", 
    active: false,
    description: "Internal operations, HR, finance, and admin tools",
    toolCount: 0
  },
  { 
    name: "Academy & Learning", 
    slug: "academy", 
    icon: GraduationCap, 
    path: "/academy", 
    active: false,
    description: "Training programs, assessments, and learning management",
    toolCount: 0
  },
  { 
    name: "Client Delivery", 
    slug: "client-delivery", 
    icon: Truck, 
    path: "/client-delivery", 
    active: false,
    description: "Managed services, SLA tracking, and delivery management",
    toolCount: 0
  },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_tools: 0, pending_requests: 0, recent_activity: 0 });
  const [activities, setActivities] = useState([]);
  const [accessModal, setAccessModal] = useState({ open: false, unitName: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, statsData, activityData] = await Promise.all([
          authAPI.getMe(),
          dashboardAPI.getStats(),
          activityAPI.getLogs({ limit: 10 })
        ]);
        setUser(userData);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasUnitAccess = (slug) => {
    if (user?.role === "super_admin") return true;
    return user?.accessible_units?.includes(slug);
  };

  const handleUnitClick = (unit, e) => {
    if (!hasUnitAccess(unit.slug)) {
      e.preventDefault();
      setAccessModal({ open: true, unitName: unit.name });
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-[#7C64FF]/20 text-[#9B85FF] border-[#7C64FF]/30",
      mini_admin: "bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30",
      team_member: "bg-white/10 text-[#8B8AA0] border-white/10",
    };
    const labels = {
      super_admin: "Super Admin",
      mini_admin: "Mini Admin",
      team_member: "Team Member",
    };
    return (
      <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${styles[role] || styles.team_member}`}>
        {labels[role] || "Member"}
      </span>
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-[#151828] rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-[#151828] rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Section */}
      <div className="thco-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[#8B8AA0] text-sm mb-1">{getCurrentDate()}</p>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-3">
              {getRoleBadge(user?.role)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-[#1C2035] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7C64FF]/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#7C64FF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total_tools}</p>
                <p className="text-xs text-[#8B8AA0]">Tools Available</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C2035] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending_requests}</p>
                <p className="text-xs text-[#8B8AA0]">Pending Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1C2035] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.recent_activity}</p>
                <p className="text-xs text-[#8B8AA0]">Recent Activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div>
        <h2 className="thco-section-label mb-4">Business Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {UNITS.map((unit) => {
            const Icon = unit.icon;
            const hasAccess = hasUnitAccess(unit.slug);
            
            return (
              <Link
                key={unit.slug}
                to={unit.path}
                onClick={(e) => handleUnitClick(unit, e)}
                className={`thco-card p-6 group transition-all duration-300 ${
                  hasAccess 
                    ? "hover:border-[#7C64FF]/50 hover:shadow-[0_0_30px_-10px_rgba(124,100,255,0.2)]" 
                    : "opacity-40 cursor-pointer"
                }`}
                data-testid={`unit-card-${unit.slug}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    unit.active ? "bg-[#7C64FF]/10" : "bg-white/5"
                  }`}>
                    <Icon className={`w-6 h-6 ${unit.active ? "text-[#7C64FF]" : "text-[#5A596E]"}`} />
                  </div>
                  {hasAccess ? (
                    unit.active ? (
                      <span className="badge-active text-[10px] font-mono px-2 py-1 rounded">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="badge-coming-soon text-[10px] font-mono px-2 py-1 rounded">
                        COMING SOON
                      </span>
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-[#5A596E]" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#9B85FF] transition-colors">
                  {unit.name}
                </h3>
                <p className="text-sm text-[#8B8AA0] mb-4 line-clamp-2">
                  {unit.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-[#5A596E]">
                    {unit.toolCount} tool{unit.toolCount !== 1 ? 's' : ''}
                  </span>
                  {hasAccess && (
                    <ChevronRight className="w-4 h-4 text-[#5A596E] group-hover:text-[#7C64FF] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="thco-section-label mb-4">Recent Activity</h2>
        <div className="thco-card overflow-hidden">
          {activities.length > 0 ? (
            <div className="divide-y divide-white/5">
              {activities.map((activity, index) => (
                <div key={activity.log_id || index} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#7C64FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-[#7C64FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E6F0]">
                        <span className="font-medium">{activity.user_name}</span>
                        {" "}{activity.action}
                      </p>
                      {activity.unit_slug && (
                        <p className="text-xs text-[#8B8AA0] mt-1">
                          in {UNITS.find(u => u.slug === activity.unit_slug)?.name || activity.unit_slug}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[#5A596E] whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-[#5A596E] mx-auto mb-3" />
              <p className="text-[#8B8AA0]">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Access Restricted Modal */}
      <Dialog open={accessModal.open} onOpenChange={(open) => setAccessModal({ ...accessModal, open })}>
        <DialogContent className="bg-[#151828] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F87171]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#F87171]" />
              </div>
              Access Restricted
            </DialogTitle>
            <DialogDescription className="text-[#8B8AA0] pt-4">
              You don't have access to <span className="text-white font-medium">{accessModal.unitName}</span>. 
              Contact your administrator to request access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setAccessModal({ open: false, unitName: "" })}
              className="bg-[#1C2035] hover:bg-white/10 text-white border border-white/10"
              data-testid="access-modal-dismiss-btn"
            >
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
