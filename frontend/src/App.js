import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import TalentUnit from "./pages/TalentUnit";
import SourcingTool from "./pages/SourcingTool";
import DatabaseSearchTool from "./pages/DatabaseSearchTool";
import Settings from "./pages/Settings";
import Proposals from "./pages/Proposals";
import ProposalView from "./pages/ProposalView";
import ProcureAIProposal from "./pages/ProcureAIProposal";
import ProcureAIProposalV2 from "./pages/ProcureAIProposalV2";
import ProcureAIExecutivePack from "./pages/ProcureAIExecutivePack";
import ProcureAIExecutivePackV3 from "./pages/ProcureAIExecutivePackV3";
import ProcureAIExecutivePackV4 from "./pages/ProcureAIExecutivePackV4";
import ProcureAIScrollPresentation from "./pages/ProcureAIScrollPresentation";

// Business Unit Pages
import SalesAndBD from "./pages/SalesAndBD";
import MarketingAndBrand from "./pages/MarketingAndBrand";
import AdvisoryAndConsulting from "./pages/AdvisoryAndConsulting";
import TechnologyAndBuild from "./pages/TechnologyAndBuild";
import OperationsAndFinance from "./pages/OperationsAndFinance";
import AcademyAndLearning from "./pages/AcademyAndLearning";
import ClientDelivery from "./pages/ClientDelivery";
import THCOHRPage from "./pages/THCOHRPage";
import ProjectManagement from "./pages/ProjectManagement";
import ITAndTools from "./pages/ITAndTools";

// FlowForge Pages
import FlowForgeChat from "./pages/FlowForgeChat";
import ApprovalQueue from "./pages/ApprovalQueue";

// Public Email-Gated Presentations
import ProcureAIExecutivePackPublic from "./pages/ProcureAIExecutivePackPublic";
import ProcureAIExecutivePackV3Public from "./pages/ProcureAIExecutivePackV3Public";
import ProcureAIProposalPublic from "./pages/ProcureAIProposalPublic";
import ProcureAIScrollPublic from "./pages/ProcureAIScrollPublic";
import ProcureAIProposalV1Public from "./pages/ProcureAIProposalV1Public";
import ProcureAITWGSession from "./pages/ProcureAITWGSession";
import ProcureAITWGSessionPublic from "./pages/ProcureAITWGSessionPublic";

// Layout
import DashboardLayout from "./components/DashboardLayout";

// API
import { authAPI } from "./lib/api";

// Auth Callback Component - handles OAuth redirect
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          const response = await authAPI.exchangeSession(sessionId);
          if (response.user_id) {
            navigate("/dashboard", { state: { user: response }, replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error("Auth callback error:", error);
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0D0F1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#7C64FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8B8AA0]">Authenticating...</p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user data passed from AuthCallback, use it
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location.state]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0D0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C64FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B8AA0]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment for session_id (OAuth callback) - must be synchronous
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/talent" element={
        <ProtectedRoute>
          <TalentUnit />
        </ProtectedRoute>
      } />
      
      <Route path="/talent/sourcing" element={
        <ProtectedRoute>
          <SourcingTool />
        </ProtectedRoute>
      } />
      
      <Route path="/talent/database-search" element={
        <ProtectedRoute>
          <DatabaseSearchTool />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/proposals" element={
        <ProtectedRoute>
          <Proposals />
        </ProtectedRoute>
      } />
      
      {/* Public Proposal View - No Auth Required */}
      <Route path="/proposals/view/:shareToken" element={<ProposalView />} />
      
      {/* Public Email-Gated Presentations */}
      <Route path="/proposals/procure-ai" element={<ProcureAIProposalPublic />} />
      <Route path="/proposals/procure-ai-executive" element={<ProcureAIExecutivePackPublic />} />
      <Route path="/proposals/procure-ai-executive-v3" element={<ProcureAIExecutivePackV3Public />} />
      <Route path="/proposals/procure-ai-scroll" element={<ProcureAIScrollPublic />} />
      <Route path="/proposals/procure-ai-v1" element={<ProcureAIProposalV1Public />} />
      
      {/* Internal Preview Routes (no email gate - for admins) */}
      <Route path="/proposals/preview/procure-ai" element={<ProcureAIProposalV2 />} />
      <Route path="/proposals/preview/procure-ai-executive" element={<ProcureAIExecutivePackV4 />} />
      <Route path="/proposals/preview/procure-ai-executive-v3" element={<ProcureAIExecutivePackV3 />} />
      <Route path="/proposals/preview/procure-ai-scroll" element={<ProcureAIScrollPresentation />} />
      <Route path="/proposals/preview/procure-ai-v1" element={<ProcureAIProposal />} />
      
      {/* Old Executive Pack version (legacy) */}
      <Route path="/proposals/procure-ai-executive-v1" element={<ProcureAIExecutivePack />} />
      
      {/* Business Unit Routes */}
      <Route path="/sales" element={
        <ProtectedRoute>
          <SalesAndBD />
        </ProtectedRoute>
      } />
      <Route path="/marketing" element={
        <ProtectedRoute>
          <MarketingAndBrand />
        </ProtectedRoute>
      } />
      <Route path="/advisory" element={
        <ProtectedRoute>
          <AdvisoryAndConsulting />
        </ProtectedRoute>
      } />
      <Route path="/technology" element={
        <ProtectedRoute>
          <TechnologyAndBuild />
        </ProtectedRoute>
      } />
      <Route path="/operations" element={
        <ProtectedRoute>
          <OperationsAndFinance />
        </ProtectedRoute>
      } />
      <Route path="/academy" element={
        <ProtectedRoute>
          <AcademyAndLearning />
        </ProtectedRoute>
      } />
      <Route path="/client-delivery" element={
        <ProtectedRoute>
          <ClientDelivery />
        </ProtectedRoute>
      } />
      <Route path="/thco-hr" element={
        <ProtectedRoute>
          <THCOHRPage />
        </ProtectedRoute>
      } />
      <Route path="/project-management" element={
        <ProtectedRoute>
          <ProjectManagement />
        </ProtectedRoute>
      } />
      <Route path="/it-tools" element={
        <ProtectedRoute>
          <ITAndTools />
        </ProtectedRoute>
      } />
      
      {/* FlowForge Routes */}
      <Route path="/:unit/build/new" element={
        <ProtectedRoute>
          <FlowForgeChat />
        </ProtectedRoute>
      } />
      <Route path="/:unit/build/:conversationId" element={
        <ProtectedRoute>
          <FlowForgeChat />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/approvals" element={
        <ProtectedRoute>
          <ApprovalQueue />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#151828',
            color: '#E8E6F0',
            border: '1px solid rgba(255,255,255,0.07)',
          },
        }}
      />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
