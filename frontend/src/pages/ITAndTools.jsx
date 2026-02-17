import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wrench, 
  ArrowLeft, 
  ChevronRight,
  Bot,
  Mail,
  Globe,
  Shield,
  Server,
  Database,
  Code,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";

// The 22 AI Agents from Operating Cycle
const AI_AGENTS = [
  { id: "lead_research", name: "Lead Research Agent", department: "Sales", status: "active", lastRun: "2 min ago" },
  { id: "meeting_prep", name: "Meeting Prep Agent", department: "Sales", status: "active", lastRun: "15 min ago" },
  { id: "follow_up", name: "Follow-Up Agent", department: "Sales", status: "active", lastRun: "5 min ago" },
  { id: "inbox_mgmt", name: "Inbox Management Agent", department: "Operations", status: "active", lastRun: "1 min ago" },
  { id: "mvp_proposal", name: "MVP/Proposal Generator", department: "Technology", status: "active", lastRun: "30 min ago" },
  { id: "spec_to_tasks", name: "Spec-to-Tasks Agent", department: "Technology", status: "active", lastRun: "1 hr ago" },
  { id: "project_status", name: "Project Status Agent", department: "Project Mgmt", status: "active", lastRun: "10 min ago" },
  { id: "knowledge_capture", name: "Knowledge Capture Agent", department: "Academy", status: "idle", lastRun: "2 hrs ago" },
  { id: "data_aggregation", name: "Data Aggregation Agent", department: "Analytics", status: "active", lastRun: "3 min ago" },
  { id: "content_writer", name: "Content Writer Agent", department: "Marketing", status: "active", lastRun: "45 min ago" },
  { id: "linkedin_poster", name: "LinkedIn Poster Agent", department: "Marketing", status: "idle", lastRun: "4 hrs ago" },
  { id: "newsletter", name: "Newsletter Agent", department: "Marketing", status: "idle", lastRun: "1 week ago" },
];

const TOOLS = [
  {
    name: "AI Agents Hub",
    slug: "ai-agents",
    icon: Bot,
    description: "Monitor and manage all 22 AI agents across departments",
    gradient: "from-violet-500 to-purple-600",
    active: true,
    stats: { total: 22, active: 9, idle: 13 }
  },
  {
    name: "Email Warming",
    slug: "email-warming",
    icon: Mail,
    description: "Outbound email warming and domain health management",
    gradient: "from-blue-500 to-cyan-600",
    active: true,
    stats: { domains: 5, warmingRate: "85%" }
  },
  {
    name: "Domain Manager",
    slug: "domain-manager",
    icon: Globe,
    description: "Manage outbound domains and DNS configuration",
    gradient: "from-emerald-500 to-teal-600",
    active: false,
    stats: null
  },
  {
    name: "Security & Access",
    slug: "security",
    icon: Shield,
    description: "User permissions, device locking, and audit logs",
    gradient: "from-red-500 to-rose-600",
    active: false,
    stats: null
  }
];

const STATUS_CONFIG = {
  active: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Active" },
  idle: { color: "bg-gray-100 text-gray-600", icon: RefreshCw, label: "Idle" },
  error: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Error" },
  warning: { color: "bg-amber-100 text-amber-700", icon: AlertTriangle, label: "Warning" }
};

const ITAndTools = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const activeAgents = AI_AGENTS.filter(a => a.status === "active").length;
  const idleAgents = AI_AGENTS.filter(a => a.status === "idle").length;

  return (
    <div className="space-y-8" data-testid="it-tools-page">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-900">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-gray-300" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 font-medium">IT & THCO Tools</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Unit Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IT & THCO Tools</h1>
            <p className="text-gray-500 text-lg">
              IT infrastructure, AI agents, outbound tooling, and system management
            </p>
            <p className="text-sm text-gray-400 mt-1">Lead: Emmanuel</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{AI_AGENTS.length}</p>
              <p className="text-sm text-gray-500">Total AI Agents</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
              <p className="text-sm text-gray-500">Active Agents</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500">Email Domains</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-500">System Uptime</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            
            if (tool.active) {
              return (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  data-testid={`tool-card-${tool.slug}`}
                >
                  <div className={`h-2 bg-gradient-to-r ${tool.gradient}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {tool.description}
                    </p>
                    
                    {tool.stats && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        {tool.stats.total && <span>{tool.stats.total} agents</span>}
                        {tool.stats.active && <span className="text-green-600">{tool.stats.active} active</span>}
                        {tool.stats.domains && <span>{tool.stats.domains} domains</span>}
                        {tool.stats.warmingRate && <span className="text-blue-600">{tool.stats.warmingRate} health</span>}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <span className="text-sm text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                        Open Tool
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={tool.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-60"
                data-testid={`tool-card-${tool.slug}`}
              >
                <div className="h-2 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      COMING SOON
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-400">Under development</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Agents Overview */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">AI Agents Status</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Agents ({AI_AGENTS.length})</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-3 h-3" /> {activeAgents} Active
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <RefreshCw className="w-3 h-3" /> {idleAgents} Idle
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {AI_AGENTS.map((agent, index) => {
              const statusConfig = STATUS_CONFIG[agent.status];
              const StatusIcon = statusConfig.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                  data-testid={`agent-${agent.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{agent.lastRun}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        data-testid="back-to-dashboard-link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default ITAndTools;
