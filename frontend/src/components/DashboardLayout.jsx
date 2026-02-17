import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Megaphone, 
  Briefcase, 
  Code, 
  Building2, 
  GraduationCap, 
  Truck, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Search, 
  ChevronDown,
  LogOut,
  User,
  FileText,
  UserCog,
  FolderKanban,
  Wrench
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authAPI } from "../lib/api";
import { toast } from "sonner";
import { AnalyticsProvider, useAnalytics } from "../context/AnalyticsContext";

const UNITS = [
  { name: "Talent & Human Capital", slug: "talent", icon: Users, path: "/talent", active: true },
  { name: "THCO HR", slug: "thco-hr", icon: UserCog, path: "/thco-hr", active: true },
  { name: "Project Management", slug: "project-management", icon: FolderKanban, path: "/project-management", active: true },
  { name: "IT & THCO Tools", slug: "it-tools", icon: Wrench, path: "/it-tools", active: true },
  { name: "Sales & Business Dev", slug: "sales", icon: TrendingUp, path: "/sales", active: true },
  { name: "Marketing & Brand", slug: "marketing", icon: Megaphone, path: "/marketing", active: true },
  { name: "Advisory & Consulting", slug: "advisory", icon: Briefcase, path: "/advisory", active: true },
  { name: "Technology & Build", slug: "technology", icon: Code, path: "/technology", active: true },
  { name: "Operations & Finance", slug: "operations", icon: Building2, path: "/operations", active: true },
  { name: "Academy & Learning", slug: "academy", icon: GraduationCap, path: "/academy", active: true },
  { name: "Client Delivery", slug: "client-delivery", icon: Truck, path: "/client-delivery", active: true },
];

const DashboardLayoutInner = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { trackAction } = useAnalytics();

  const handleLogout = async () => {
    try {
      trackAction("click", "logout_button", { method: "user_dropdown" });
      await authAPI.logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/settings") return "Settings";
    if (path === "/proposals") return "Proposals";
    if (path.startsWith("/talent")) {
      if (path === "/talent") return "Talent & Human Capital";
      if (path === "/talent/sourcing") return "AI Candidate Sourcing";
      if (path === "/talent/database-search") return "Database Search";
    }
    if (path === "/thco-hr") return "THCO HR";
    if (path === "/project-management") return "Project Management";
    if (path === "/it-tools") return "IT & THCO Tools";
    const unit = UNITS.find(u => path.startsWith(u.path));
    return unit?.name || "Dashboard";
  };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const hasUnitAccess = (slug) => {
    if (user?.role === "super_admin") return true;
    return user?.accessible_units?.includes(slug);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Light Gray */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#f8f9fb] border-r border-gray-200 transition-all duration-300 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_internal-thco/artifacts/bvr2l293_THCO%20Logo_Navy%20soft%20purple.png" 
              alt="THCO" 
              className={`${sidebarOpen ? 'h-8' : 'h-7'} transition-all`}
            />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            data-testid="nav-dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all
              ${isActive("/dashboard") 
                ? "bg-gray-200/70 text-gray-900 font-medium" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span className="text-sm">Dashboard</span>}
          </Link>

          {/* Proposals */}
          <Link
            to="/proposals"
            data-testid="nav-proposals"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all
              ${isActive("/proposals") 
                ? "bg-gray-200/70 text-gray-900 font-medium" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <FileText size={20} />
            {sidebarOpen && <span className="text-sm">Proposals</span>}
          </Link>

          {/* Units Section */}
          {sidebarOpen && (
            <div className="mt-6 mb-3 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Units</span>
            </div>
          )}

          <div className="space-y-1">
            {UNITS.map((unit) => {
              const Icon = unit.icon;
              const hasAccess = hasUnitAccess(unit.slug);
              
              return (
                <Link
                  key={unit.slug}
                  to={unit.path}
                  data-testid={`nav-unit-${unit.slug}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive(unit.path) 
                      ? "bg-gray-200/70 text-gray-900 font-medium" 
                      : hasAccess 
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                        : "text-gray-400 hover:bg-gray-100 cursor-pointer"}`}
                >
                  <Icon size={20} className={!hasAccess ? "opacity-50" : ""} />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm ${!hasAccess ? "opacity-50" : ""}`}>
                        {unit.name}
                      </span>
                      {!unit.active && hasAccess && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                          SOON
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings - Super Admin Only */}
          {user?.role === "super_admin" && (
            <>
              {sidebarOpen && (
                <div className="mt-6 mb-3 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Admin</span>
                </div>
              )}
              <Link
                to="/settings"
                data-testid="nav-settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive("/settings") 
                    ? "bg-gray-200/70 text-gray-900 font-medium" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              >
                <Settings size={20} />
                {sidebarOpen && <span className="text-sm">Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-gray-200">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${sidebarOpen ? "" : "justify-center"}`}>
            <Avatar className="w-9 h-9 border border-gray-200">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              data-testid="mobile-menu-toggle"
            >
              <Menu size={24} />
            </button>
            
            {/* Sidebar Toggle (Desktop) */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              data-testid="sidebar-toggle"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search tools..." 
                className="w-64 pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 rounded-full"
                data-testid="search-input"
              />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              data-testid="notifications-btn"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-2"
                  data-testid="user-dropdown-trigger"
                >
                  <Avatar className="w-8 h-8 border border-gray-200">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={16} className="text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-lg rounded-xl">
                <DropdownMenuItem className="text-gray-700 focus:bg-gray-50 focus:text-gray-900 cursor-pointer rounded-lg">
                  <User size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-lg"
                  data-testid="logout-btn"
                >
                  <LogOut size={16} className="mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

// Wrapper component that provides analytics context
const DashboardLayout = ({ children, user }) => {
  return (
    <AnalyticsProvider user={user}>
      <DashboardLayoutInner user={user}>
        {children}
      </DashboardLayoutInner>
    </AnalyticsProvider>
  );
};

export default DashboardLayout;
