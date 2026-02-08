import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Database, Search, Loader2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { databaseSearchAPI } from "../lib/api";
import { toast } from "sonner";

const searchSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  job_description: z.string().min(1, "Job description is required"),
  company_context: z.string().optional(),
  seniority_level: z.string().min(1, "Seniority level is required"),
  max_candidates: z.string().min(1, "Max candidates is required"),
});

const DatabaseSearchTool = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searches, setSearches] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const data = await databaseSearchAPI.getAll();
        setSearches(data);
      } catch (error) {
        console.error("Failed to fetch searches:", error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchSearches();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await databaseSearchAPI.create(data);
      toast.success("Database search initiated. Results will be delivered to your email shortly.");
      reset();
      // Refresh history
      const updatedSearches = await databaseSearchAPI.getAll();
      setSearches(updatedSearches);
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to submit search";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20",
      processing: "bg-[#7C64FF]/10 text-[#7C64FF] border-[#7C64FF]/20",
      completed: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20",
      failed: "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20",
    };
    return (
      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${styles[status] || styles.submitted}`}>
        {status}
      </span>
    );
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

  return (
    <div className="space-y-6" data-testid="database-search-tool-page">
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
            <BreadcrumbLink asChild>
              <Link to="/talent" className="text-[#8B8AA0] hover:text-white">Talent & Human Capital</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#5A596E]" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white">Database Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tool Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#7C64FF]/10 flex items-center justify-center">
          <Database className="w-6 h-6 text-[#7C64FF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Database Search</h1>
          <p className="text-[#8B8AA0]">Search our internal candidate database using AI-powered resume analysis</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="new-search" className="w-full">
        <TabsList className="bg-[#151828] border border-white/10 p-1">
          <TabsTrigger 
            value="new-search" 
            className="data-[state=active]:bg-[#7C64FF] data-[state=active]:text-white text-[#8B8AA0]"
            data-testid="new-search-tab"
          >
            New Search
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-[#7C64FF] data-[state=active]:text-white text-[#8B8AA0]"
            data-testid="search-history-tab"
          >
            Search History
          </TabsTrigger>
        </TabsList>

        {/* New Search Tab */}
        <TabsContent value="new-search" className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Search Criteria Section */}
            <div className="form-section">
              <h3 className="thco-section-label mb-6">Search Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#E8E6F0]">Job Title *</Label>
                  <Input
                    placeholder="e.g., Senior Data Engineer"
                    className="bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E] focus:border-[#7C64FF]"
                    {...register("job_title")}
                    data-testid="search-job-title-input"
                  />
                  {errors.job_title && <p className="text-[#F87171] text-sm">{errors.job_title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E8E6F0]">Seniority Level *</Label>
                  <Select onValueChange={(value) => setValue("seniority_level", value)}>
                    <SelectTrigger className="bg-[#1C2035] border-white/10 text-white" data-testid="seniority-level-select">
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C2035] border-white/10">
                      <SelectItem value="Junior (0-2 years)" className="text-white hover:bg-white/10">
                        Junior (0-2 years)
                      </SelectItem>
                      <SelectItem value="Mid-Level (3-5 years)" className="text-white hover:bg-white/10">
                        Mid-Level (3-5 years)
                      </SelectItem>
                      <SelectItem value="Senior (5-8 years)" className="text-white hover:bg-white/10">
                        Senior (5-8 years)
                      </SelectItem>
                      <SelectItem value="Lead / Principal (8-12 years)" className="text-white hover:bg-white/10">
                        Lead / Principal (8-12 years)
                      </SelectItem>
                      <SelectItem value="Executive / C-Suite (12+ years)" className="text-white hover:bg-white/10">
                        Executive / C-Suite (12+ years)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.seniority_level && <p className="text-[#F87171] text-sm">{errors.seniority_level.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#E8E6F0]">Job Description *</Label>
                  <Textarea
                    placeholder="Paste the full JD here — responsibilities, requirements, qualifications..."
                    rows={6}
                    className="bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E] focus:border-[#7C64FF] resize-none"
                    {...register("job_description")}
                    data-testid="search-job-description-input"
                  />
                  {errors.job_description && <p className="text-[#F87171] text-sm">{errors.job_description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E8E6F0]">Company / Hiring Context</Label>
                  <Textarea
                    placeholder="Industry, team size, culture, budget range, location requirements..."
                    rows={3}
                    className="bg-[#1C2035] border-white/10 text-white placeholder:text-[#5A596E] focus:border-[#7C64FF] resize-none"
                    {...register("company_context")}
                    data-testid="company-context-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E8E6F0]">Max Candidates to Evaluate *</Label>
                  <Select onValueChange={(value) => setValue("max_candidates", value)}>
                    <SelectTrigger className="bg-[#1C2035] border-white/10 text-white" data-testid="max-candidates-select">
                      <SelectValue placeholder="Select max candidates" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C2035] border-white/10">
                      <SelectItem value="10 (Quick Scan)" className="text-white hover:bg-white/10">
                        10 (Quick Scan)
                      </SelectItem>
                      <SelectItem value="25 (Standard)" className="text-white hover:bg-white/10">
                        25 (Standard)
                      </SelectItem>
                      <SelectItem value="50 (Deep Search)" className="text-white hover:bg-white/10">
                        50 (Deep Search)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.max_candidates && <p className="text-[#F87171] text-sm">{errors.max_candidates.message}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#7C64FF] hover:bg-[#6B54E8] text-white px-8 h-12 font-medium"
                disabled={isLoading}
                data-testid="submit-search-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Database
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <div className="thco-card overflow-hidden">
            {loadingHistory ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-[#7C64FF] animate-spin mx-auto mb-3" />
                <p className="text-[#8B8AA0]">Loading history...</p>
              </div>
            ) : searches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Date</TableHead>
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Job Title</TableHead>
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Seniority</TableHead>
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Max Candidates</TableHead>
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase">Status</TableHead>
                    <TableHead className="text-[#8B8AA0] font-mono text-xs uppercase"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searches.map((search) => (
                    <>
                      <TableRow 
                        key={search.search_id} 
                        className="border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === search.search_id ? null : search.search_id)}
                        data-testid={`search-history-row-${search.search_id}`}
                      >
                        <TableCell className="text-[#E8E6F0]">{formatDate(search.created_at)}</TableCell>
                        <TableCell className="text-[#E8E6F0] font-medium">{search.job_title}</TableCell>
                        <TableCell className="text-[#8B8AA0]">{search.seniority_level}</TableCell>
                        <TableCell className="text-[#8B8AA0]">{search.max_candidates}</TableCell>
                        <TableCell>{getStatusBadge(search.status)}</TableCell>
                        <TableCell>
                          {expandedRow === search.search_id ? (
                            <ChevronUp className="w-4 h-4 text-[#8B8AA0]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#8B8AA0]" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow === search.search_id && (
                        <TableRow className="border-white/5 bg-[#1C2035]/50">
                          <TableCell colSpan={6} className="p-6">
                            <div className="space-y-4 text-sm">
                              <div>
                                <span className="text-[#5A596E] block mb-1">Job Description</span>
                                <span className="text-[#E8E6F0] whitespace-pre-wrap">{search.job_description}</span>
                              </div>
                              {search.company_context && (
                                <div>
                                  <span className="text-[#5A596E] block mb-1">Company / Hiring Context</span>
                                  <span className="text-[#E8E6F0]">{search.company_context}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <Database className="w-12 h-12 text-[#5A596E] mx-auto mb-3" />
                <p className="text-[#8B8AA0]">No database searches yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Back Link */}
      <Link 
        to="/talent" 
        className="inline-flex items-center gap-2 text-[#8B8AA0] hover:text-white transition-colors"
        data-testid="back-to-talent-link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Talent & Human Capital
      </Link>
    </div>
  );
};

export default DatabaseSearchTool;
