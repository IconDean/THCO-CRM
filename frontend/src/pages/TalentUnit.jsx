import { Link } from "react-router-dom";
import { Users, Search, Database, Mail, Calendar, GitBranch, ChevronRight, ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";

const TOOLS = [
  {
    name: "AI Candidate Sourcing",
    slug: "sourcing",
    icon: Search,
    path: "/talent/sourcing",
    active: true,
    description: "Source candidates from the open web using AI. Generates 50-100+ scored candidates from LinkedIn and professional networks.",
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    name: "Database Search",
    slug: "database-search",
    icon: Database,
    path: "/talent/database-search",
    active: true,
    description: "Search our internal candidate database for matching profiles using AI-powered resume analysis.",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    name: "Email & Outreach Templates",
    slug: "email-templates",
    icon: Mail,
    path: "/talent/email-templates",
    active: false,
    description: "Create and manage personalized email templates for candidate outreach.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    name: "Interview Scheduling",
    slug: "interview-scheduling",
    icon: Calendar,
    path: "/talent/interview-scheduling",
    active: false,
    description: "Automate interview scheduling with calendar integration.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    name: "Candidate Pipeline",
    slug: "candidate-pipeline",
    icon: GitBranch,
    path: "/talent/candidate-pipeline",
    active: false,
    description: "Track candidates through your hiring pipeline with visual Kanban boards.",
    gradient: "from-amber-500 to-orange-600"
  },
];

const TalentUnit = () => {
  return (
    <div className="space-y-8" data-testid="talent-unit-page">
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
            <BreadcrumbPage className="text-gray-900 font-medium">Talent & Human Capital</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Unit Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Talent & Human Capital</h1>
            <p className="text-gray-500 text-lg">
              AI-powered recruiting, sourcing, and talent operations
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="thco-section-label mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            
            if (tool.active) {
              return (
                <Link
                  key={tool.slug}
                  to={tool.path}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300"
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
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <span className="text-sm text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                        Open Tool
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }
            
            return (
              <div
                key={tool.slug}
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
                    <span className="text-sm text-gray-400">
                      Under development
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

export default TalentUnit;
