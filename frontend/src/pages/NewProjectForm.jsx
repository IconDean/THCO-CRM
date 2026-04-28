import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Building } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import api from "../lib/api";

export default function NewProjectForm() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/clients").then(r => setClients(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Project name is required"); return; }
    if (!clientId) { toast.error("Please select a client"); return; }
    if (!brief) { toast.error("Brief document is required"); return; }
    if (!roadmap) { toast.error("Roadmap document is required"); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("client_id", clientId);
      fd.append("description", description.trim());
      fd.append("brief", brief);
      fd.append("roadmap", roadmap);
      await api.post("/projects", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Project created successfully! HR has been notified.");
      navigate("/talent/projects");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create project");
    } finally { setSubmitting(false); }
  };

  const FileDropZone = ({ label, file, onFile, testId }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition"
        style={{ borderColor: file ? "#1B4332" : "#e5e7eb" }} data-testid={testId}>
        <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => onFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center gap-2 text-[#1B4332]">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Click to upload PDF or DOCX (max 25MB)</p>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="new-project-form-page">
      <div className="flex items-center gap-3">
        <Link to="/talent/projects"><ArrowLeft className="w-5 h-5 text-gray-400 hover:text-gray-700" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q2 Platform Redesign"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none text-sm" data-testid="project-name-input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Client <span className="text-red-500">*</span></label>
          <div className="relative">
            <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={clientId} onChange={e => setClientId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none text-sm bg-white appearance-none" data-testid="client-select">
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c.client_id || c.id} value={c.client_id || c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 text-xs">(optional, 500 chars)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 500))} placeholder="Brief project overview..." rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none text-sm resize-none" data-testid="description-input" />
          <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileDropZone label="Full Brief" file={brief} onFile={setBrief} testId="brief-upload" />
          <FileDropZone label="Roadmap Design" file={roadmap} onFile={setRoadmap} testId="roadmap-upload" />
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90 text-white py-6 text-base font-semibold" data-testid="submit-project-btn">
          {submitting ? "Creating Project..." : "Create Project & Notify HR"}
        </Button>
      </form>
    </div>
  );
}
