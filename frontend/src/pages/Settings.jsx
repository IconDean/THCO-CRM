import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Webhook, 
  Users, 
  Activity, 
  Plus, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Shield,
  ShieldOff,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Lock,
  Unlock,
  Eye,
  AlertTriangle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { settingsAPI, usersAPI, activityAPI, authAPI, loginRecordsAPI } from "../lib/api";
import { toast } from "sonner";

const ALL_UNITS = [
  { slug: "talent", name: "Talent & Human Capital" },
  { slug: "sales", name: "Sales & Business Development" },
  { slug: "marketing", name: "Marketing & Brand" },
  { slug: "advisory", name: "Advisory & Consulting" },
  { slug: "technology", name: "Technology & Build" },
  { slug: "operations", name: "Operations & Finance" },
  { slug: "academy", name: "Academy & Learning" },
  { slug: "client-delivery", name: "Client Delivery" },
];

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [webhooks, setWebhooks] = useState({ sourcing_webhook_url: "", database_search_webhook_url: "" });
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loginRecords, setLoginRecords] = useState([]);
  const [loginStats, setLoginStats] = useState({ total: 0, successful: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [savingWebhooks, setSavingWebhooks] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(null);
  const [userModal, setUserModal] = useState({ open: false, user: null, isEdit: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [loginDetailModal, setLoginDetailModal] = useState({ open: false, records: [], userName: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "team_member", accessible_units: [] });
  const [savingUser, setSavingUser] = useState(false);
  const [deviceAction, setDeviceAction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authAPI.getMe();
        setCurrentUser(userData);
        
        if (userData.role !== "super_admin") {
          toast.error("Access denied. Super Admin only.");
          navigate("/dashboard");
          return;
        }
        
        const [webhooksData, usersData, activitiesData, loginRecordsData, loginStatsData] = await Promise.all([
          settingsAPI.getWebhooks(),
          usersAPI.getAll(),
          activityAPI.getLogs({ limit: 50 }),
          loginRecordsAPI.getAll({ limit: 100 }),
          loginRecordsAPI.getCount()
        ]);
        
        setWebhooks(webhooksData);
        setUsers(usersData);
        setActivities(activitiesData);
        setLoginRecords(loginRecordsData);
        setLoginStats(loginStatsData);
      } catch (error) {
        console.error("Failed to fetch settings data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleSaveWebhooks = async () => {
    setSavingWebhooks(true);
    try {
      await settingsAPI.updateWebhooks(webhooks);
      toast.success("Webhook settings saved successfully");
    } catch (error) {
      toast.error("Failed to save webhook settings");
    } finally {
      setSavingWebhooks(false);
    }
  };

  const handleTestWebhook = async (type, url) => {
    if (!url) {
      toast.error("Please enter a webhook URL first");
      return;
    }
    
    setTestingWebhook(type);
    try {
      const result = await settingsAPI.testWebhook(type, url);
      if (result.success) {
        toast.success(`Webhook test successful (Status: ${result.status_code})`);
      } else {
        toast.error(`Webhook test failed: ${result.error || `Status ${result.status_code}`}`);
      }
    } catch (error) {
      toast.error("Failed to test webhook");
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setNewUser({
        name: user.name,
        email: user.email,
        role: user.role,
        accessible_units: user.accessible_units || []
      });
      setUserModal({ open: true, user, isEdit: true });
    } else {
      setNewUser({ name: "", email: "", role: "team_member", accessible_units: [] });
      setUserModal({ open: true, user: null, isEdit: false });
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Name and email are required");
      return;
    }
    
    setSavingUser(true);
    try {
      if (userModal.isEdit) {
        await usersAPI.update(userModal.user.user_id, {
          name: newUser.name,
          role: newUser.role,
          accessible_units: newUser.accessible_units
        });
        toast.success("User updated successfully");
      } else {
        const result = await usersAPI.create(newUser);
        toast.success(`User created successfully. Temporary password: ${result.temp_password}`);
      }
      
      const updatedUsers = await usersAPI.getAll();
      setUsers(updatedUsers);
      setUserModal({ open: false, user: null, isEdit: false });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save user");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    
    try {
      await usersAPI.delete(deleteModal.user.user_id);
      toast.success("User deleted successfully");
      const updatedUsers = await usersAPI.getAll();
      setUsers(updatedUsers);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete user");
    } finally {
      setDeleteModal({ open: false, user: null });
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "disabled" : "active";
      await usersAPI.update(user.user_id, { status: newStatus });
      toast.success(`User ${newStatus === "active" ? "enabled" : "disabled"} successfully`);
      const updatedUsers = await usersAPI.getAll();
      setUsers(updatedUsers);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeviceLock = async (user, action) => {
    setDeviceAction(`${user.user_id}-${action}`);
    try {
      if (action === "lock") {
        await usersAPI.lockDevice(user.user_id);
        toast.success(`Device lock enabled for ${user.name}`);
      } else if (action === "unlock") {
        await usersAPI.unlockDevice(user.user_id);
        toast.success(`Device lock disabled for ${user.name}`);
      } else if (action === "update") {
        await usersAPI.updateDevice(user.user_id);
        toast.success(`Allowed device updated for ${user.name}`);
      }
      const updatedUsers = await usersAPI.getAll();
      setUsers(updatedUsers);
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${action} device`);
    } finally {
      setDeviceAction(null);
    }
  };

  const handleViewUserLogins = async (user) => {
    try {
      const records = await loginRecordsAPI.getByUser(user.user_id, 50);
      setLoginDetailModal({ open: true, records, userName: user.name });
    } catch (error) {
      toast.error("Failed to fetch login records");
    }
  };

  const handleUnitToggle = (slug, checked) => {
    if (checked) {
      setNewUser(prev => ({ ...prev, accessible_units: [...prev.accessible_units, slug] }));
    } else {
      setNewUser(prev => ({ ...prev, accessible_units: prev.accessible_units.filter(u => u !== slug) }));
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-purple-50 text-purple-700 border-purple-200",
      mini_admin: "bg-emerald-50 text-emerald-700 border-emerald-200",
      team_member: "bg-gray-50 text-gray-600 border-gray-200",
    };
    const labels = {
      super_admin: "Super Admin",
      mini_admin: "Mini Admin",
      team_member: "Team Member",
    };
    return (
      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[role] || styles.team_member}`}>
        {labels[role] || "Member"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
        Active
      </span>
    ) : (
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
        Disabled
      </span>
    );
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "tablet": return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage webhooks, users, and view activity logs</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-xl">
          <TabsTrigger 
            value="webhooks" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-lg"
            data-testid="webhooks-tab"
          >
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-lg"
            data-testid="users-tab"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="login-records" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-lg"
            data-testid="login-records-tab"
          >
            <Shield className="w-4 h-4 mr-2" />
            Login Records
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 rounded-lg"
            data-testid="activity-tab"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6 space-y-6">
          {/* AI Candidate Sourcing Webhook */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Candidate Sourcing</h3>
                <p className="text-sm text-gray-500">Connected to n8n sourcing workflow</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={webhooks.sourcing_webhook_url}
                onChange={(e) => setWebhooks({ ...webhooks, sourcing_webhook_url: e.target.value })}
                placeholder="https://your-n8n.app.n8n.cloud/webhook/thco-sourcing"
                className="flex-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
                data-testid="sourcing-webhook-input"
              />
              <Button
                variant="outline"
                onClick={() => handleTestWebhook("sourcing", webhooks.sourcing_webhook_url)}
                disabled={testingWebhook === "sourcing"}
                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                data-testid="test-sourcing-webhook-btn"
              >
                {testingWebhook === "sourcing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
          </div>

          {/* Database Search Webhook */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Database Search</h3>
                <p className="text-sm text-gray-500">Connected to n8n talent match workflow</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={webhooks.database_search_webhook_url}
                onChange={(e) => setWebhooks({ ...webhooks, database_search_webhook_url: e.target.value })}
                placeholder="https://your-n8n.app.n8n.cloud/webhook/thco-talent-match"
                className="flex-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
                data-testid="database-search-webhook-input"
              />
              <Button
                variant="outline"
                onClick={() => handleTestWebhook("database", webhooks.database_search_webhook_url)}
                disabled={testingWebhook === "database"}
                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                data-testid="test-database-webhook-btn"
              >
                {testingWebhook === "database" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-purple-700">
              <span className="font-medium">Note:</span> More webhooks will be added as new tools are built.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveWebhooks}
              disabled={savingWebhooks}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-xl"
              data-testid="save-webhooks-btn"
            >
              {savingWebhooks ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Webhooks"
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">All Users</h3>
            <Button
              onClick={() => handleOpenUserModal()}
              className="bg-[#7C64FF] hover:bg-[#6B54E8] text-white"
              data-testid="add-user-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="thco-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Name</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Email</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Role</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Device Lock</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Status</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-[#E8E6F0] font-medium">{user.name}</TableCell>
                    <TableCell className="text-[#8B8AA0]">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.device_lock_enabled ? (
                        <span className="flex items-center gap-1 text-[#FBBF24] text-xs">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#5A596E] text-xs">
                          <Unlock className="w-3 h-3" /> Unlocked
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewUserLogins(user)}
                          className="text-[#8B8AA0] hover:text-white hover:bg-white/5 h-8 w-8"
                          title="View login history"
                          data-testid={`view-logins-${user.user_id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUserModal(user)}
                          className="text-[#8B8AA0] hover:text-white hover:bg-white/5 h-8 w-8"
                          disabled={user.user_id === currentUser?.user_id}
                          data-testid={`edit-user-${user.user_id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.device_lock_enabled ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeviceLock(user, "unlock")}
                              className="text-[#FBBF24] hover:text-[#FBBF24] hover:bg-white/5 h-8 w-8"
                              disabled={deviceAction === `${user.user_id}-unlock`}
                              title="Unlock device"
                              data-testid={`unlock-device-${user.user_id}`}
                            >
                              {deviceAction === `${user.user_id}-unlock` ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeviceLock(user, "update")}
                              className="text-[#7C64FF] hover:text-[#7C64FF] hover:bg-white/5 h-8 w-8"
                              disabled={deviceAction === `${user.user_id}-update`}
                              title="Update to latest device"
                              data-testid={`update-device-${user.user_id}`}
                            >
                              {deviceAction === `${user.user_id}-update` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeviceLock(user, "lock")}
                            className="text-[#34D399] hover:text-[#34D399] hover:bg-white/5 h-8 w-8"
                            disabled={deviceAction === `${user.user_id}-lock` || user.user_id === currentUser?.user_id}
                            title="Lock to current device"
                            data-testid={`lock-device-${user.user_id}`}
                          >
                            {deviceAction === `${user.user_id}-lock` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleUserStatus(user)}
                          className={`${user.status === "active" ? "text-[#F87171] hover:text-[#F87171]" : "text-[#34D399] hover:text-[#34D399]"} hover:bg-white/5 h-8 w-8`}
                          disabled={user.user_id === currentUser?.user_id}
                          data-testid={`toggle-user-${user.user_id}`}
                        >
                          {user.status === "active" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="text-[#F87171] hover:text-[#F87171] hover:bg-white/5 h-8 w-8"
                          disabled={user.user_id === currentUser?.user_id}
                          data-testid={`delete-user-${user.user_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Login Records Tab */}
        <TabsContent value="login-records" className="mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="thco-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7C64FF]/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#7C64FF]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{loginStats.total}</p>
                  <p className="text-xs text-[#8B8AA0]">Total Logins</p>
                </div>
              </div>
            </div>
            <div className="thco-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{loginStats.successful}</p>
                  <p className="text-xs text-[#8B8AA0]">Successful</p>
                </div>
              </div>
            </div>
            <div className="thco-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F87171]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#F87171]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{loginStats.failed}</p>
                  <p className="text-xs text-[#8B8AA0]">Failed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="thco-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Time</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">User</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">IP Address</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Location</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Device</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Browser</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Method</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginRecords.map((record) => (
                  <TableRow key={record.record_id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-[#8B8AA0] text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.login_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-[#E8E6F0] font-medium text-sm">{record.user_name}</p>
                        <p className="text-[#5A596E] text-xs">{record.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#E8E6F0] text-sm font-mono">{record.ip_address}</TableCell>
                    <TableCell className="text-[#8B8AA0] text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {record.location || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#8B8AA0]">
                        {getDeviceIcon(record.device_type)}
                        <span className="text-sm">{record.device_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#8B8AA0] text-sm">{record.browser}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        record.login_method === "google_oauth" 
                          ? "bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20" 
                          : "bg-white/5 text-[#8B8AA0] border border-white/10"
                      }`}>
                        {record.login_method === "google_oauth" ? "Google" : "Email"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.success ? (
                        <span className="flex items-center gap-1 text-[#34D399] text-xs">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <div>
                          <span className="flex items-center gap-1 text-[#F87171] text-xs">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                          {record.failure_reason && (
                            <p className="text-[10px] text-[#5A596E] mt-0.5 max-w-[150px] truncate" title={record.failure_reason}>
                              {record.failure_reason}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <div className="thco-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Timestamp</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">User</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Action</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Unit</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.log_id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-[#8B8AA0]">{formatDate(activity.created_at)}</TableCell>
                    <TableCell className="text-[#E8E6F0] font-medium">{activity.user_name}</TableCell>
                    <TableCell className="text-[#E8E6F0]">{activity.action}</TableCell>
                    <TableCell className="text-[#8B8AA0]">
                      {activity.unit_slug ? ALL_UNITS.find(u => u.slug === activity.unit_slug)?.name || activity.unit_slug : "-"}
                    </TableCell>
                    <TableCell className="text-[#5A596E] max-w-xs truncate">{activity.details || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={userModal.open} onOpenChange={(open) => setUserModal({ ...userModal, open })}>
        <DialogContent className="bg-[#151828] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {userModal.isEdit ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription className="text-[#8B8AA0]">
              {userModal.isEdit ? "Update user details and permissions" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#E8E6F0]">Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E]"
                data-testid="user-modal-name-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#E8E6F0]">Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
                disabled={userModal.isEdit}
                className="bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E] disabled:opacity-50"
                data-testid="user-modal-email-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#E8E6F0]">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="bg-[#1C2035] border-white/10 text-white" data-testid="user-modal-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C2035] border-white/10">
                  <SelectItem value="team_member" className="text-white hover:bg-white/10">Team Member</SelectItem>
                  <SelectItem value="mini_admin" className="text-white hover:bg-white/10">Mini Admin</SelectItem>
                  <SelectItem value="super_admin" className="text-white hover:bg-white/10">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#E8E6F0]">Unit Access</Label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#1C2035] rounded-lg border border-white/10">
                {ALL_UNITS.map((unit) => (
                  <div key={unit.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={unit.slug}
                      checked={newUser.accessible_units.includes(unit.slug)}
                      onCheckedChange={(checked) => handleUnitToggle(unit.slug, checked)}
                      className="border-white/20 data-[state=checked]:bg-[#7C64FF] data-[state=checked]:border-[#7C64FF]"
                    />
                    <label htmlFor={unit.slug} className="text-sm text-[#E8E6F0] cursor-pointer">
                      {unit.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserModal({ open: false, user: null, isEdit: false })}
              className="bg-[#1C2035] border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={savingUser}
              className="bg-[#7C64FF] hover:bg-[#6B54E8] text-white"
              data-testid="save-user-btn"
            >
              {savingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                userModal.isEdit ? "Update User" : "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}>
        <DialogContent className="bg-[#151828] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete User</DialogTitle>
            <DialogDescription className="text-[#8B8AA0]">
              Are you sure you want to delete <span className="text-white font-medium">{deleteModal.user?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, user: null })}
              className="bg-[#1C2035] border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-[#F87171] hover:bg-[#EF4444] text-white"
              data-testid="confirm-delete-user-btn"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Detail Modal */}
      <Dialog open={loginDetailModal.open} onOpenChange={(open) => setLoginDetailModal({ ...loginDetailModal, open })}>
        <DialogContent className="bg-[#151828] border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Login History - {loginDetailModal.userName}</DialogTitle>
            <DialogDescription className="text-[#8B8AA0]">
              Detailed login records for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-[#8B8AA0] font-mono text-xs">Time</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs">IP</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs">Location</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs">Device</TableHead>
                  <TableHead className="text-[#8B8AA0] font-mono text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginDetailModal.records.map((record) => (
                  <TableRow key={record.record_id} className="border-white/5">
                    <TableCell className="text-[#8B8AA0] text-xs">{formatDate(record.login_time)}</TableCell>
                    <TableCell className="text-[#E8E6F0] text-xs font-mono">{record.ip_address}</TableCell>
                    <TableCell className="text-[#8B8AA0] text-xs">{record.location}</TableCell>
                    <TableCell className="text-[#8B8AA0] text-xs">
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(record.device_type)}
                        {record.device_type} - {record.browser}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.success ? (
                        <span className="text-[#34D399] text-xs">Success</span>
                      ) : (
                        <span className="text-[#F87171] text-xs" title={record.failure_reason}>Failed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setLoginDetailModal({ open: false, records: [], userName: "" })}
              className="bg-[#1C2035] border-white/10 text-white hover:bg-white/5"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back Link */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-[#8B8AA0] hover:text-white transition-colors"
        data-testid="back-to-dashboard-link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Settings;
