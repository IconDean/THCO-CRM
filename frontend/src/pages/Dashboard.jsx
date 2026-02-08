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
  ChevronRight,
  Sparkles
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
    toolCount: 2,
    gradient: "from-purple-500 to-indigo-600"
  },
  { 
    name: "Sales & Business Development", 
    slug: "sales", 
    icon: TrendingUp, 
    path: "/sales", 
    active: false,
    description: "Pipeline management, proposals, and client engagement",
    toolCount: 0,
    gradient: "from-emerald-500 to-teal-600"
  },
  { 
    name: "Marketing & Brand", 
    slug: "marketing", 
    icon: Megaphone, 
    path: "/marketing", 
    active: false,
    description: "Content creation, campaigns, and brand management",
    toolCount: 0,
    gradient: "from-pink-500 to-rose-600"
  },
  { 
    name: "Advisory & Consulting", 
    slug: "advisory", 
    icon: Briefcase, 
    path: "/advisory", 
    active: false,
    description: "Project delivery, research, and client advisory tools",
    toolCount: 0,
    gradient: "from-blue-500 to-cyan-600"
  },
  { 
    name: "Technology & Build", 
    slug: "technology", 
    icon: Code, 
    path: "/technology", 
    active: false,
    description: "Product development, engineering, and AI tools",
    toolCount: 0,
    gradient: "from-violet-500 to-purple-600"
  },
  { 
    name: "Operations & Finance", 
    slug: "operations", 
    icon: Building2, 
    path: "/operations", 
    active: false,
    description: "Internal operations, HR, finance, and admin tools",
    toolCount: 0,
    gradient: "from-amber-500 to-orange-600"
  },
  { 
    name: "Academy & Learning", 
    slug: "academy", 
    icon: GraduationCap, 
    path: "/academy", 
    active: false,
    description: "Training programs, assessments, and learning management",
    toolCount: 0,
    gradient: "from-cyan-500 to-blue-600"
  },
  { 
    name: "Client Delivery", 
    slug: "client-delivery", 
    icon: Truck, 
    path: "/client-delivery", 
    active: false,
    description: "Managed services, SLA tracking, and delivery management",
    toolCount: 0,
    gradient: "from-red-500 to-rose-600"
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
      super_admin: "bg-purple-100 text-purple-700 border-purple-200",
      mini_admin: "bg-emerald-100 text-emerald-700 border-emerald-200",
      team_member: "bg-gray-100 text-gray-600 border-gray-200",
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
        <div className="h-32 bg-white rounded-2xl border border-gray-100"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">{getCurrentDate()}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-3">
              {getRoleBadge(user?.role)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">AI-powered tools at your fingertips</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total_tools}</p>
                <p className="text-xs text-gray-500">Tools Available</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
                <p className="text-xs text-gray-500">Pending Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.recent_activity}</p>
                <p className="text-xs text-gray-500">Recent Activity</p>
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
                className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  hasAccess 
                    ? "border-gray-100 hover:border-gray-200 hover:shadow-lg" 
                    : "border-gray-100 opacity-60 cursor-pointer"
                }`}
                data-testid={`unit-card-${unit.slug}`}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${unit.gradient}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${unit.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {hasAccess ? (
                      unit.active ? (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          COMING SOON
                        </span>
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {unit.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {unit.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {unit.toolCount} tool{unit.toolCount !== 1 ? 's' : ''}
                    </span>
                    {hasAccess && (
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="thco-section-label mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activities.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {activities.map((activity, index) => (
                <div key={activity.log_id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user_name}</span>
                        {" "}{activity.action}
                      </p>
                      {activity.unit_slug && (
                        <p className="text-xs text-gray-500 mt-1">
                          in {UNITS.find(u => u.slug === activity.unit_slug)?.name || activity.unit_slug}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Access Restricted Modal */}
      <Dialog open={accessModal.open} onOpenChange={(open) => setAccessModal({ ...accessModal, open })}>
        <DialogContent className="bg-white border-gray-200 max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              Access Restricted
            </DialogTitle>
            <DialogDescription className="text-gray-500 pt-4">
              You don't have access to <span className="text-gray-900 font-medium">{accessModal.unitName}</span>. 
              Contact your administrator to request access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setAccessModal({ open: false, unitName: "" })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
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
