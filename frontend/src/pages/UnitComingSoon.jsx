import { Link } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";

const UnitComingSoon = ({ unitName }) => {
  return (
    <div className="space-y-8" data-testid="unit-coming-soon-page">
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
            <BreadcrumbPage className="text-white">{unitName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-full bg-[#7C64FF]/10 flex items-center justify-center mb-8 animate-pulse-glow">
          <Construction className="w-12 h-12 text-[#7C64FF]" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 text-center">{unitName}</h1>
        <p className="text-lg text-[#8B8AA0] text-center max-w-md mb-8">
          This unit is under development. Tools will be available soon.
        </p>

        <div className="flex items-center gap-3 text-[#5A596E]">
          <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse"></div>
          <span className="text-sm font-mono uppercase tracking-wider">In Progress</span>
        </div>
      </div>

      {/* Back Link */}
      <div className="flex justify-center">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-[#8B8AA0] hover:text-white transition-colors"
          data-testid="back-to-dashboard-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnitComingSoon;
