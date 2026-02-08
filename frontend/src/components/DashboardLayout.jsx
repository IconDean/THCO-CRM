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
  User
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

const UNITS = [
  { name: "Talent & Human Capital", slug: "talent", icon: Users, path: "/talent", active: true },
  { name: "Sales & Business Dev", slug: "sales", icon: TrendingUp, path: "/sales", active: false },
  { name: "Marketing & Brand", slug: "marketing", icon: Megaphone, path: "/marketing", active: false },
  { name: "Advisory & Consulting", slug: "advisory", icon: Briefcase, path: "/advisory", active: false },
  { name: "Technology & Build", slug: "technology", icon: Code, path: "/technology", active: false },
  { name: "Operations & Finance", slug: "operations", icon: Building2, path: "/operations", active: false },
  { name: "Academy & Learning", slug: "academy", icon: GraduationCap, path: "/academy", active: false },
  { name: "Client Delivery", slug: "client-delivery", icon: Truck, path: "/client-delivery", active: false },
];

const DashboardLayout = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
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
    if (path.startsWith("/talent")) {
      if (path === "/talent") return "Talent & Human Capital";
      if (path === "/talent/sourcing") return "AI Candidate Sourcing";
      if (path === "/talent/database-search") return "Database Search";
    }
    const unit = UNITS.find(u => path.startsWith(u.path));
    return unit?.name || "Dashboard";
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
      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${styles[role] || styles.team_member}`}>
        {labels[role] || "Member"}
      </span>
    );
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
    <div className="min-h-screen bg-[#0D0F1A] flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0D0F1A] border-r border-white/5 transition-all duration-300 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7C64FF] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            {sidebarOpen && (
              <span className="font-mono text-lg font-bold text-white tracking-tight">THCO</span>
            )}
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-[#8B8AA0] hover:text-white"
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 transition-colors
              ${isActive("/dashboard") 
                ? "bg-[#7C64FF]/10 text-white border-l-[3px] border-[#7C64FF] -ml-[3px]" 
                : "text-[#8B8AA0] hover:text-white hover:bg-white/5"}`}
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
          </Link>

          {/* Units Section */}
          {sidebarOpen && (
            <div className="mt-6 mb-3 px-3">
              <span className="thco-section-label">Units</span>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive(unit.path) 
                      ? "bg-[#7C64FF]/10 text-white border-l-[3px] border-[#7C64FF] -ml-[3px]" 
                      : hasAccess 
                        ? "text-[#8B8AA0] hover:text-white hover:bg-white/5" 
                        : "text-[#5A596E] hover:bg-white/5 cursor-pointer"}`}
                >
                  <Icon size={20} className={!hasAccess ? "opacity-50" : ""} />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm font-medium ${!hasAccess ? "opacity-50" : ""}`}>
                        {unit.name}
                      </span>
                      {!unit.active && hasAccess && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#FBBF24]/10 text-[#FBBF24] rounded">
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
                  <span className="thco-section-label">Admin</span>
                </div>
              )}
              <Link
                to="/settings"
                data-testid="nav-settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive("/settings") 
                    ? "bg-[#7C64FF]/10 text-white border-l-[3px] border-[#7C64FF] -ml-[3px]" 
                    : "text-[#8B8AA0] hover:text-white hover:bg-white/5"}`}
              >
                <Settings size={20} />
                {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${sidebarOpen ? "" : "justify-center"}`}>
            <Avatar className="w-9 h-9 border border-white/10">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="bg-[#1C2035] text-[#7C64FF] text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                {getRoleBadge(user?.role)}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 glass-header flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#8B8AA0] hover:text-white"
              data-testid="mobile-menu-toggle"
            >
              <Menu size={24} />
            </button>
            
            {/* Sidebar Toggle (Desktop) */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 text-[#8B8AA0] hover:text-white rounded-lg hover:bg-white/5"
              data-testid="sidebar-toggle"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A596E]" size={18} />
              <Input 
                placeholder="Search tools..." 
                className="w-64 pl-10 bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E] focus:border-[#7C64FF]"
                data-testid="search-input"
              />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-[#8B8AA0] hover:text-white hover:bg-white/5"
              data-testid="notifications-btn"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F87171] rounded-full"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-[#8B8AA0] hover:text-white hover:bg-white/5"
                  data-testid="user-dropdown-trigger"
                >
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="bg-[#1C2035] text-[#7C64FF] text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#151828] border-white/10">
                <DropdownMenuItem className="text-[#E8E6F0] focus:bg-white/5 focus:text-white cursor-pointer">
                  <User size={16} className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-[#F87171] focus:bg-[#F87171]/10 focus:text-[#F87171] cursor-pointer"
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
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
