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
import UnitComingSoon from "./pages/UnitComingSoon";
import Proposals from "./pages/Proposals";
import ProposalView from "./pages/ProposalView";
import ProcureAIProposal from "./pages/ProcureAIProposal";
import ProcureAIProposalV2 from "./pages/ProcureAIProposalV2";
import ProcureAIExecutivePack from "./pages/ProcureAIExecutivePack";
import ProcureAIExecutivePackV3 from "./pages/ProcureAIExecutivePackV3";
import ProcureAIScrollPresentation from "./pages/ProcureAIScrollPresentation";

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
      
      {/* Public Procure AI Presentation - No Auth Required */}
      <Route path="/proposals/procure-ai" element={<ProcureAIProposalV2 />} />
      
      {/* Public Procure AI Executive Pack - No Auth Required */}
      <Route path="/proposals/procure-ai-executive" element={<ProcureAIExecutivePack />} />
      
      {/* Old version (backup) */}
      <Route path="/proposals/procure-ai-v1" element={<ProcureAIProposal />} />
      
      {/* Public Procure AI Scroll Presentation - No Auth Required */}
      <Route path="/proposals/procure-ai-scroll" element={<ProcureAIScrollPresentation />} />
      
      {/* Coming Soon Unit Routes */}
      <Route path="/sales" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Sales & Business Development" />
        </ProtectedRoute>
      } />
      <Route path="/marketing" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Marketing & Brand" />
        </ProtectedRoute>
      } />
      <Route path="/advisory" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Advisory & Consulting" />
        </ProtectedRoute>
      } />
      <Route path="/technology" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Technology & Build" />
        </ProtectedRoute>
      } />
      <Route path="/operations" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Operations & Finance" />
        </ProtectedRoute>
      } />
      <Route path="/academy" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Academy & Learning" />
        </ProtectedRoute>
      } />
      <Route path="/client-delivery" element={
        <ProtectedRoute>
          <UnitComingSoon unitName="Client Delivery" />
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
