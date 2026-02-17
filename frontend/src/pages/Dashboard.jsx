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
  Sparkles,
  UserCog,
  FolderKanban
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { dashboardAPI, activityAPI, authAPI } from "../lib/api";
import { useAnalytics } from "../context/AnalyticsContext";

const UNITS = [
  { 
    name: "Talent & Human Capital", 
    slug: "talent", 
    icon: Users, 
    path: "/talent", 
    active: true,
    description: "AI-powered recruiting, sourcing, and talent operations",
    toolCount: 2,
    gradient: "bg-gradient-to-br from-[#B855E8] to-[#DA67E4]"
  },
  { 
    name: "THCO HR", 
    slug: "thco-hr", 
    icon: UserCog, 
    path: "/thco-hr", 
    active: false,
    description: "Internal HR management, employee records, and HR operations",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]"
  },
  { 
    name: "Project Management", 
    slug: "project-management", 
    icon: FolderKanban, 
    path: "/project-management", 
    active: false,
    description: "Project tracking, task management, and team collaboration",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF]"
  },
  { 
    name: "Sales & Business Development", 
    slug: "sales", 
    icon: TrendingUp, 
    path: "/sales", 
    active: false,
    description: "Pipeline management, proposals, and client engagement",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#38D190] to-[#53E1A3]"
  },
  { 
    name: "Marketing & Brand", 
    slug: "marketing", 
    icon: Megaphone, 
    path: "/marketing", 
    active: false,
    description: "Content creation, campaigns, and brand management",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#FF3D8D] to-[#FF7F7F]"
  },
  { 
    name: "Advisory & Consulting", 
    slug: "advisory", 
    icon: Briefcase, 
    path: "/advisory", 
    active: false,
    description: "Project delivery, research, and client advisory tools",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#3B82F6] to-[#60A5FA]"
  },
  { 
    name: "Technology & Build", 
    slug: "technology", 
    icon: Code, 
    path: "/technology", 
    active: false,
    description: "Product development, engineering, and AI tools",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#06B6D4] to-[#22D3EE]"
  },
  { 
    name: "Operations & Finance", 
    slug: "operations", 
    icon: Building2, 
    path: "/operations", 
    active: false,
    description: "Internal operations, HR, finance, and admin tools",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#F97316] to-[#FB923C]"
  },
  { 
    name: "Academy & Learning", 
    slug: "academy", 
    icon: GraduationCap, 
    path: "/academy", 
    active: false,
    description: "Training programs, assessments, and learning management",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]"
  },
  { 
    name: "Client Delivery", 
    slug: "client-delivery", 
    icon: Truck, 
    path: "/client-delivery", 
    active: false,
    description: "Managed services, SLA tracking, and delivery management",
    toolCount: 0,
    gradient: "bg-gradient-to-br from-[#EF4444] to-[#F87171]"
  },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_tools: 0, pending_requests: 0, recent_activity: 0 });
  const [activities, setActivities] = useState([]);
  const [accessModal, setAccessModal] = useState({ open: false, unitName: "" });
  const [loading, setLoading] = useState(true);
  const { trackAction } = useAnalytics();

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
    trackAction("click", "unit_card", { unit_slug: unit.slug, unit_name: unit.name, has_access: hasUnitAccess(unit.slug) });
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
      super_admin: "bg-gray-100 text-gray-600",
      mini_admin: "bg-emerald-100 text-emerald-700",
      team_member: "bg-gray-100 text-gray-600",
    };
    const labels = {
      super_admin: "SUPER ADMIN",
      mini_admin: "MINI ADMIN",
      team_member: "TEAM MEMBER",
    };
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${styles[role] || styles.team_member}`}>
        {labels[role] || "MEMBER"}
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
        <div className="h-32 bg-gray-100 rounded-2xl"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Section */}
      <div>
        <p className="text-gray-500 text-sm mb-1">{getCurrentDate()}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            {getRoleBadge(user?.role)}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm">AI-powered tools at your fingertips</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_tools}</p>
              <p className="text-sm text-gray-500">Tools Available</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pending_requests}</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.recent_activity}</p>
              <p className="text-sm text-gray-500">Recent Activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Business Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {UNITS.map((unit) => {
            const Icon = unit.icon;
            const hasAccess = hasUnitAccess(unit.slug);
            
            return (
              <Link
                key={unit.slug}
                to={unit.path}
                onClick={(e) => handleUnitClick(unit, e)}
                className={`group rounded-2xl transition-all duration-300 overflow-hidden shadow-md ${
                  hasAccess 
                    ? "hover:scale-[1.02] hover:shadow-xl" 
                    : "opacity-60 cursor-pointer"
                } ${unit.gradient}`}
                data-testid={`unit-card-${unit.slug}`}
              >
                <div className="p-6 h-full flex flex-col min-h-[200px]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {hasAccess ? (
                      unit.active ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded bg-white/25 text-white">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded bg-black/20 text-white/90">
                          COMING SOON
                        </span>
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-white/50" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {unit.name}
                  </h3>
                  <p className="text-sm text-white/80 mb-4 flex-grow">
                    {unit.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-xs text-white/70">
                      {unit.toolCount} tool{unit.toolCount !== 1 ? 's' : ''}
                    </span>
                    {hasAccess && (
                      <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
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
