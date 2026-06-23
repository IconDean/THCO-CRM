import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, Presentation, File, Table2, Download, AlertCircle, Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { proposalsAPI } from "../lib/api";
import apiClient from "../lib/api";

const ProposalView = () => {
  const { shareToken } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email gate state
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [viewerName, setViewerName] = useState("");
  const [viewerCompany, setViewerCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gateError, setGateError] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await proposalsAPI.getShared(shareToken);
        setProposal(data);
        // Auto-unlock if email gate not required, OR if we already registered in this browser
        const cached = localStorage.getItem(`proposal_viewer_${shareToken}`);
        if (!data.require_email || cached) {
          setEmailUnlocked(true);
          if (cached) setViewerEmail(cached);
        }
      } catch (err) {
        setError("This proposal link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchProposal();
    }
  }, [shareToken]);

  const submitEmailGate = async (e) => {
    e.preventDefault();
    setGateError(null);
    if (!viewerEmail || !viewerEmail.includes("@")) {
      setGateError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/proposals/shared/${shareToken}/register`, {
        email: viewerEmail.trim().toLowerCase(),
        name: viewerName.trim(),
        company: viewerCompany.trim(),
      });
      localStorage.setItem(`proposal_viewer_${shareToken}`, viewerEmail.trim().toLowerCase());
      setEmailUnlocked(true);
    } catch (err) {
      setGateError(err.response?.data?.detail || "Could not register your email — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    let downloadUrl = proposalsAPI.getDownloadUrl(shareToken);
    if (proposal?.require_email && viewerEmail) {
      const sep = downloadUrl.includes("?") ? "&" : "?";
      downloadUrl = `${downloadUrl}${sep}email=${encodeURIComponent(viewerEmail)}`;
    }
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getFileIcon = (fileType) => {
    const iconClass = "w-16 h-16";
    switch (fileType) {
      case 'PDF':
        return <FileText className={`${iconClass} text-red-400`} />;
      case 'PowerPoint':
        return <Presentation className={`${iconClass} text-orange-400`} />;
      case 'Excel':
        return <Table2 className={`${iconClass} text-green-400`} />;
      case 'Word':
        return <File className={`${iconClass} text-blue-400`} />;
      default:
        return <File className={`${iconClass} text-gray-400`} />;
    }
  };

  const getFileColor = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return 'bg-red-500/10 border-red-500/20';
      case 'PowerPoint':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'Excel':
        return 'bg-green-500/10 border-green-500/20';
      case 'Word':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center p-4">
        <div className="bg-[#1a1f36] rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1219] flex items-center justify-center p-4" data-testid="proposal-view-page">
      <div className="bg-[#1a1f36] rounded-2xl border border-white/10 p-8 max-w-lg w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_internal-thco/artifacts/bvr2l293_THCO%20Logo_Navy%20soft%20purple.png" 
            alt="THCO" 
            className="h-10 brightness-0 invert"
          />
        </div>

        {/* Client Name */}
        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            {proposal.client_name}
          </span>
        </div>

        {/* File Preview */}
        <div className={`rounded-2xl border p-8 mb-6 ${getFileColor(proposal.file_type)}`}>
          <div className="flex flex-col items-center">
            {getFileIcon(proposal.file_type)}
            <h2 className="text-lg font-semibold text-white mt-4 text-center break-all">
              {proposal.filename}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span>{proposal.file_type}</span>
              <span>•</span>
              <span>{formatFileSize(proposal.file_size)}</span>
            </div>
          </div>
        </div>

        {/* Upload Date */}
        <p className="text-center text-sm text-gray-500 mb-6">
          Shared on {formatDate(proposal.uploaded_at)}
        </p>

        {/* Download Button OR Email Gate */}
        {emailUnlocked ? (
          <Button
            onClick={handleDownload}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 text-base"
            data-testid="download-proposal-btn"
          >
            <Download className="w-5 h-5 mr-2" />
            Download {proposal.file_type}
          </Button>
        ) : (
          <form onSubmit={submitEmailGate} className="space-y-3" data-testid="email-gate-form">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2 mb-2">
              <Lock className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-200">Enter your details to access this document.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Email *</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={viewerEmail}
                  onChange={(e) => setViewerEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-3 py-3 bg-[#0f1219] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  data-testid="viewer-email-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={viewerName}
                onChange={(e) => setViewerName(e.target.value)}
                placeholder="Name (optional)"
                className="px-3 py-2.5 bg-[#0f1219] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                data-testid="viewer-name-input"
              />
              <input
                type="text"
                value={viewerCompany}
                onChange={(e) => setViewerCompany(e.target.value)}
                placeholder="Company (optional)"
                className="px-3 py-2.5 bg-[#0f1219] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                data-testid="viewer-company-input"
              />
            </div>
            {gateError && (
              <p className="text-xs text-red-400 text-center" data-testid="email-gate-error">{gateError}</p>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 text-base"
              data-testid="email-gate-submit"
            >
              {submitting ? "Verifying..." : "Continue to Document"}
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Powered by THCO Group
        </p>
      </div>
    </div>
  );
};

export default ProposalView;
