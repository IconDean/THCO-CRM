import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Shield, Wrench, Users, Briefcase, Search, Save, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import api from "../lib/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleField = async (userId, field, currentValue) => {
    setSaving(s => ({ ...s, [userId + field]: true }));
    try {
      await api.put(`/users/${userId}`, { [field]: !currentValue });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, [field]: !currentValue } : u));
      toast.success("Updated");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed to update"); }
    finally { setSaving(s => ({ ...s, [userId + field]: false })); }
  };

  const updateCapacity = async (userId, value) => {
    try {
      await api.put(`/users/${userId}`, { engineer_capacity_override: value ? parseInt(value) : null });
      toast.success("Capacity updated");
    } catch (e) { toast.error("Failed"); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const TogglePill = ({ active, onClick, loading: isLoading, label, activeColor }) => (
    <button onClick={onClick} disabled={isLoading}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${active ? `${activeColor} border-current` : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}>
      {isLoading ? "..." : label}
    </button>
  );

  return (
    <div className="space-y-6" data-testid="user-management-page">
      <div className="flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="w-5 h-5 text-gray-400 hover:text-gray-700" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B4332]/20" data-testid="user-search" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full" data-testid="users-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Engineer</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">HR</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-gray-50/50" data-testid={`user-row-${u.user_id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TogglePill active={u.is_engineer} onClick={() => toggleField(u.user_id, "is_engineer", u.is_engineer)}
                      loading={saving[u.user_id + "is_engineer"]} label={u.is_engineer ? "Yes" : "No"} activeColor="bg-blue-100 text-blue-700" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TogglePill active={u.is_fulfillment} onClick={() => toggleField(u.user_id, "is_fulfillment", u.is_fulfillment)}
                      loading={saving[u.user_id + "is_fulfillment"]} label={u.is_fulfillment ? "Yes" : "No"} activeColor="bg-purple-100 text-purple-700" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <TogglePill active={u.is_hr} onClick={() => toggleField(u.user_id, "is_hr", u.is_hr)}
                      loading={saving[u.user_id + "is_hr"]} label={u.is_hr ? "Yes" : "No"} activeColor="bg-emerald-100 text-emerald-700" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.is_engineer && (
                      <input type="number" min="1" max="10" defaultValue={u.engineer_capacity_override || ""}
                        placeholder="-" onBlur={e => updateCapacity(u.user_id, e.target.value)}
                        className="w-14 px-2 py-1 border border-gray-200 rounded text-sm text-center" data-testid={`capacity-${u.user_id}`} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
