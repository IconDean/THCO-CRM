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
    description: "Source candidates from the open web using AI. Generates 50-100+ scored candidates from LinkedIn and professional networks."
  },
  {
    name: "Database Search",
    slug: "database-search",
    icon: Database,
    path: "/talent/database-search",
    active: true,
    description: "Search our internal candidate database for matching profiles using AI-powered resume analysis."
  },
  {
    name: "Email & Outreach Templates",
    slug: "email-templates",
    icon: Mail,
    path: "/talent/email-templates",
    active: false,
    description: "Create and manage personalized email templates for candidate outreach."
  },
  {
    name: "Interview Scheduling",
    slug: "interview-scheduling",
    icon: Calendar,
    path: "/talent/interview-scheduling",
    active: false,
    description: "Automate interview scheduling with calendar integration."
  },
  {
    name: "Candidate Pipeline",
    slug: "candidate-pipeline",
    icon: GitBranch,
    path: "/talent/candidate-pipeline",
    active: false,
    description: "Track candidates through your hiring pipeline with visual Kanban boards."
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
              <Link to="/dashboard" className="text-[#8B8AA0] hover:text-white">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#5A596E]" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white">Talent & Human Capital</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Unit Header */}
      <div className="thco-card p-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-[#7C64FF]/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-[#7C64FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Talent & Human Capital</h1>
            <p className="text-[#8B8AA0] text-lg">
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
                  className="thco-card p-6 group hover:border-[#7C64FF]/50 hover:shadow-[0_0_30px_-10px_rgba(124,100,255,0.2)] transition-all duration-300"
                  data-testid={`tool-card-${tool.slug}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#7C64FF]/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#7C64FF]" />
                    </div>
                    <span className="badge-active text-[10px] font-mono px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#9B85FF] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-[#8B8AA0] mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-end pt-4 border-t border-white/5">
                    <span className="text-sm text-[#7C64FF] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open Tool
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            }
            
            return (
              <div
                key={tool.slug}
                className="thco-card p-6 opacity-50"
                data-testid={`tool-card-${tool.slug}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#5A596E]" />
                  </div>
                  <span className="badge-coming-soon text-[10px] font-mono px-2 py-1 rounded">
                    COMING SOON
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-[#8B8AA0] mb-4">
                  {tool.description}
                </p>
                
                <div className="pt-4 border-t border-white/5">
                  <span className="text-sm text-[#5A596E]">
                    Under development
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to Dashboard */}
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

export default TalentUnit;
