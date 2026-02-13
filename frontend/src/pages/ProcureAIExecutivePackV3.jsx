import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ==================== DESIGN SYSTEM ====================
const colors = {
  navy: "#1E2761",
  teal: "#0D9488",
  white: "#FFFFFF",
  lightGrey: "#F8FAFC",
  iceBlue: "#CADCFC",
  slate: "#64748B",
  dark: "#0F172A",
  green: "#059669",
  blue: "#2563EB",
  orange: "#EA580C",
  red: "#DC2626",
};

// ==================== MAIN COMPONENT ====================
const ProcureAIExecutivePackV3 = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const containerRef = useRef(null);
  const totalSlides = 12;

  const goToSlide = (slide) => {
    if (slide >= 1 && slide <= totalSlides && slide !== currentSlide) {
      setDirection(slide > currentSlide ? 1 : -1);
      setCurrentSlide(slide);
    }
  };

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, toggleFullscreen]);

  const slideVariants = {
    enter: (direction) => ({ opacity: 0, x: direction > 0 ? 50 : -50 }),
    center: { opacity: 1, x: 0 },
    exit: (direction) => ({ opacity: 0, x: direction < 0 ? 50 : -50 })
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Teal accent stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50" style={{ backgroundColor: colors.teal }} />

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {currentSlide === 1 && <Slide1Title />}
          {currentSlide === 2 && <Slide2Agenda />}
          {currentSlide === 3 && <Slide3StrategicFraming />}
          {currentSlide === 4 && <Slide4Scope />}
          {currentSlide === 5 && <Slide5Architecture />}
          {currentSlide === 6 && <Slide6Governance />}
          {currentSlide === 7 && <Slide7Risk />}
          {currentSlide === 8 && <Slide8Roadmap />}
          {currentSlide === 9 && <Slide9Resources />}
          {currentSlide === 10 && <Slide10Commercial />}
          {currentSlide === 11 && <Slide11Decisions />}
          {currentSlide === 12 && <Slide12Credentials />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <AnimatePresence>
        {showArrows && currentSlide > 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-40"
          >
            <ChevronLeft className="w-6 h-6" style={{ color: colors.dark }} />
          </motion.button>
        )}
        {showArrows && currentSlide < totalSlides && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors z-40"
          >
            <ChevronRight className="w-6 h-6" style={{ color: colors.dark }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
        {Array.from({ length: totalSlides }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToSlide(i + 1)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              currentSlide === i + 1 
                ? 'w-6' 
                : 'hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: currentSlide === i + 1 ? colors.teal : colors.slate + '40'
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div 
        className="absolute bottom-6 right-8 text-sm font-medium z-40"
        style={{ color: colors.slate }}
      >
        <span style={{ color: colors.teal, fontFamily: "Georgia, serif", fontWeight: "bold" }}>{currentSlide}</span>
        <span> / {totalSlides}</span>
      </div>
    </div>
  );
};

// ==================== SLIDE 1: TITLE ====================
const Slide1Title = () => (
  <div className="w-full h-full flex flex-col" style={{ backgroundColor: colors.navy }}>
    <div className="flex-1 flex flex-col items-center justify-center px-20">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold mb-4"
        style={{ fontFamily: "Georgia, serif", color: colors.white }}
      >
        Procure AI
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-xl mb-6"
        style={{ color: colors.iceBlue }}
      >
        Procurement Transformation Programme
      </motion.p>
      
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-44 h-0.5 mb-6"
        style={{ backgroundColor: colors.teal }}
      />
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg font-bold mb-3"
        style={{ color: colors.white }}
      >
        Executive Kick-Off Pack
      </motion.p>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-sm mb-2"
        style={{ color: colors.slate }}
      >
        Strategic Validation Session with Group CIO
      </motion.p>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-sm"
        style={{ color: colors.slate }}
      >
        23 February 2026
      </motion.p>
    </div>
    
    {/* Footer */}
    <div className="h-14 px-20 flex items-center justify-between" style={{ backgroundColor: colors.dark }}>
      <span className="text-xs" style={{ color: colors.slate }}>
        IHS Towers Nigeria | TN Macaulay | Future Africa
      </span>
      <span className="text-xs tracking-widest" style={{ color: colors.teal }}>
        CONFIDENTIAL
      </span>
    </div>
  </div>
);

// ==================== SLIDE 2: AGENDA ====================
const Slide2Agenda = () => {
  const agendaItems = [
    { num: "01", section: "Strategic Framing", time: "15–20 min", desc: "Objectives, transformation thesis, phased capability model" },
    { num: "02", section: "Scope Confirmation", time: "20 min", desc: "Interfaces, data governance, assumptions, exclusions" },
    { num: "03", section: "Target Architecture", time: "20–25 min", desc: "Solution design, integrations, cybersecurity, scalability" },
    { num: "04", section: "Governance & Delivery Model", time: "20–25 min", desc: "SteerCo, PMO, RACI, reporting, risk management" },
    { num: "05", section: "Milestones & Execution Roadmap", time: "20–25 min", desc: "13-month timeline, critical path, resources, change mgmt" },
    { num: "06", section: "Commercial & Performance", time: "10–15 min", desc: "Budget phasing, payment milestones, KPIs, exclusions" },
    { num: "07", section: "Decision Points", time: "10–15 min", desc: "Go/no-go for 1 March, governance approval, IT access" },
  ];

  return (
    <div className="w-full h-full p-16" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Georgia, serif", color: colors.dark }}
      >
        Session Agenda
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm mb-8"
        style={{ color: colors.slate }}
      >
        1.5–2 hour strategic validation — structured for executive decision
      </motion.p>

      <div className="space-y-1">
        {agendaItems.map((item, i) => (
          <motion.div
            key={item.num}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="flex items-center py-4 px-6 rounded-lg"
            style={{ 
              backgroundColor: i % 2 === 0 ? colors.white : 'transparent',
              boxShadow: i % 2 === 0 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <span 
              className="w-12 text-lg font-bold"
              style={{ fontFamily: "Georgia, serif", color: colors.teal }}
            >
              {item.num}
            </span>
            <span 
              className="w-64 font-bold text-sm"
              style={{ color: colors.dark }}
            >
              {item.section}
            </span>
            <span 
              className="w-24 text-center text-sm font-bold"
              style={{ color: colors.teal }}
            >
              {item.time}
            </span>
            <span 
              className="flex-1 text-sm"
              style={{ color: colors.slate }}
            >
              {item.desc}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== SLIDE 3: STRATEGIC FRAMING ====================
const Slide3StrategicFraming = () => {
  const currentState = [
    "Manual Excel-based procurement across all categories",
    "45-day average purchase cycle from request to PO",
    "Limited to established local vendor networks",
    "No real-time spend visibility or analytics",
    "Manual vendor due diligence and compliance tracking",
    "No structured asset recovery or disposal process"
  ];

  const futureState = [
    "AI-powered end-to-end procurement automation",
    "15-day procurement cycles (67% reduction)",
    "Global vendor discovery (Alibaba, D&B, Global Sources)",
    "Real-time dashboards, spend analytics, forecasting",
    "Automated compliance scoring and risk monitoring",
    "Competitive reverse auctions for asset disposal"
  ];

  const phases = [
    { num: 1, title: "Foundation & Core", desc: "Vendor Portal, Due Diligence, Risk Monitor, AI Bot, Reverse Auction", time: "Feb–May 2026 (4 mo)", cost: "$47,500", color: colors.blue },
    { num: 2, title: "RFx Workflows", desc: "RFx Creation, Vendor Sourcing, Scope Validation, BAFO, Templates", time: "Jun–Oct 2026 (5 mo)", cost: "$60,000", color: colors.teal },
    { num: 3, title: "Intelligence", desc: "Forecasting, Category Mgmt, TCO Reporting, Audit, Settings", time: "Nov 2026–Feb 2027 (4 mo)", cost: "$60,000", color: colors.green },
  ];

  return (
    <div className="w-full h-full p-12 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>01</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Strategic Framing</h2>
          <p className="text-sm" style={{ color: colors.slate }}>Programme objectives and transformation thesis</p>
        </div>
      </div>

      {/* Current vs Future State */}
      <div className="flex gap-6 mb-8">
        {/* Current State */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-5 py-3" style={{ backgroundColor: colors.red }}>
            <h3 className="text-sm font-bold text-white">CURRENT STATE</h3>
          </div>
          <div className="p-5 bg-white">
            {currentState.map((item, i) => (
              <motion.p 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="text-xs py-1.5 border-b border-gray-100 last:border-0"
                style={{ color: colors.slate }}
              >
                • {item}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center"
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <path d="M8 20 L28 20 M22 14 L28 20 L22 26" stroke={colors.teal} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>

        {/* Future State */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-5 py-3" style={{ backgroundColor: colors.green }}>
            <h3 className="text-sm font-bold text-white">FUTURE STATE (PROCURE AI)</h3>
          </div>
          <div className="p-5 bg-white">
            {futureState.map((item, i) => (
              <motion.p 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="text-xs py-1.5 border-b border-gray-100 last:border-0"
                style={{ color: colors.slate }}
              >
                • {item}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Phase Cards */}
      <div className="flex gap-4">
        {phases.map((phase, i) => (
          <motion.div
            key={phase.num}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            className="flex-1 rounded-lg p-5 text-white relative overflow-hidden"
            style={{ backgroundColor: phase.color }}
          >
            <div className="relative z-10">
              <p className="text-xs font-bold opacity-80 mb-1">PHASE {phase.num}</p>
              <h4 className="text-base font-bold mb-2">{phase.title}</h4>
              <p className="text-xs opacity-90 mb-3 leading-relaxed">{phase.desc}</p>
              <p className="text-xs italic opacity-80 mb-2">{phase.time}</p>
              <p className="text-xl font-bold">{phase.cost}</p>
            </div>
            {i < 2 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== SLIDE 4: SCOPE ====================
const Slide4Scope = () => {
  const scopeData = [
    { phase: 1, module: "Vendor Portal + Interface", pages: 15, ai: "Agentic AI, Decision Engine", ext: "D&B, NAVEX, Docusign" },
    { phase: 1, module: "Due Diligence & Risk Monitor", pages: 7, ai: "Decision Engine", ext: "D&B, NAVEX" },
    { phase: 1, module: "AI Overview Bot", pages: 1, ai: "LLM", ext: "—" },
    { phase: 1, module: "Reverse Auction Portal", pages: 8, ai: "Analytics + Decision Engine", ext: "—" },
    { phase: 2, module: "RFx Creation + Source Vendor", pages: 9, ai: "Agentic AI, Decision Engine", ext: "Alibaba, Global Sources" },
    { phase: 2, module: "Scope Validation + Review & Rank", pages: 16, ai: "Analytics + Decision Engine", ext: "—" },
    { phase: 2, module: "BAFO Rank & Award + Templates", pages: "20+", ai: "Analytics + Decision Engine", ext: "—" },
    { phase: 3, module: "Forecasting + Category Mgmt", pages: 11, ai: "Agentic AI, Forecasting Engine", ext: "Redcube, D365" },
    { phase: 3, module: "Cost/TCO + Risk Register Reporting", pages: 14, ai: "Forecasting + Decision Engine", ext: "D365" },
    { phase: 3, module: "Settings + Exception + Audit + Perf Mgmt", pages: 19, ai: "—", ext: "—" },
  ];

  const assumptions = [
    "IHS provides timely access to systems & environments",
    "LLM usage, hosting, and 3rd-party licences are IHS cost",
    "Scoping worksheet requirements are complete and final",
    "D365 environment supports required API integrations",
    "Change requests managed via formal CR process"
  ];

  const exclusions = [
    "LLM API usage costs (Azure OpenAI or equivalent)",
    "Cloud hosting and infrastructure costs (Azure)",
    "Third-party service licences (D&B, NAVEX, Docusign)",
    "Microsoft Dynamics 365 licensing",
    "D365 core ERP modifications, legacy decommissioning"
  ];

  const getPhaseColor = (phase) => phase === 1 ? colors.blue : phase === 2 ? colors.teal : colors.green;

  return (
    <div className="w-full h-full p-10 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>02</span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Scope Confirmation & Boundaries</h2>
      </div>

      {/* Scope Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden mb-4"
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.dark }}>
              <th className="px-3 py-2 text-left text-white font-bold">Phase</th>
              <th className="px-3 py-2 text-left text-white font-bold">Module</th>
              <th className="px-3 py-2 text-center text-white font-bold">Pages</th>
              <th className="px-3 py-2 text-left text-white font-bold">AI Components</th>
              <th className="px-3 py-2 text-left text-white font-bold">External Integration</th>
            </tr>
          </thead>
          <tbody>
            {scopeData.map((row, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className="border-b border-gray-100"
              >
                <td className="px-3 py-2">
                  <span className="px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: getPhaseColor(row.phase) }}>
                    P{row.phase}
                  </span>
                </td>
                <td className="px-3 py-2" style={{ color: colors.dark }}>{row.module}</td>
                <td className="px-3 py-2 text-center font-bold" style={{ color: colors.teal }}>{row.pages}</td>
                <td className="px-3 py-2" style={{ color: colors.slate }}>{row.ai}</td>
                <td className="px-3 py-2" style={{ color: colors.slate }}>{row.ext}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Assumptions & Exclusions */}
      <div className="flex gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex-1 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-4 py-2" style={{ backgroundColor: colors.orange }}>
            <h3 className="text-xs font-bold text-white">KEY ASSUMPTIONS (CIO VALIDATION)</h3>
          </div>
          <div className="p-4 bg-white">
            {assumptions.map((item, i) => (
              <p key={i} className="text-xs py-1" style={{ color: colors.slate }}>• {item}</p>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex-1 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-4 py-2" style={{ backgroundColor: colors.red }}>
            <h3 className="text-xs font-bold text-white">EXCLUSIONS (IHS RESPONSIBILITY)</h3>
          </div>
          <div className="p-4 bg-white">
            {exclusions.map((item, i) => (
              <p key={i} className="text-xs py-1" style={{ color: colors.slate }}>• {item}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ==================== SLIDE 5: ARCHITECTURE ====================
const Slide5Architecture = () => {
  const ihsSystems = ["D365 Finance & Ops", "ServiceNow", "Azure Data Lake", "Azure OpenAI", "Azure AD / Entra ID"];
  const services = [
    { name: "Procurement Service", color: colors.blue },
    { name: "Vendor Service", color: colors.green },
    { name: "AI/ML Service", color: colors.navy },
    { name: "Analytics Service", color: colors.teal },
    { name: "Auction Service", color: colors.orange },
    { name: "Contract Service", color: colors.slate },
  ];
  const infra = [
    { cat: "Cloud", req: "Azure Subscription (compute, storage, networking)", env: "Dev, Staging, Prod", by: "Week 1" },
    { cat: "Database", req: "Azure SQL or PostgreSQL", env: "Dev, Staging, Prod", by: "Week 1" },
    { cat: "AI/LLM", req: "Azure OpenAI Service (GPT-4 access)", env: "All environments", by: "Month 2" },
    { cat: "Integration", req: "D365 API credentials + ServiceNow API", env: "All environments", by: "Week 2" },
    { cat: "Third-Party", req: "D&B, NAVEX, Docusign APIs", env: "Staging, Prod", by: "Month 3" },
    { cat: "Security", req: "VPN access for dev team + CI/CD pipeline tools", env: "All environments", by: "Week 1" },
  ];

  return (
    <div className="w-full h-full p-10 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>03</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Target Architecture & Technical Design</h2>
          <p className="text-sm" style={{ color: colors.slate }}>Azure-native microservices with D365 deep integration</p>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="flex gap-4 mb-6 items-stretch">
        {/* IHS Systems */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-48"
        >
          <div className="px-4 py-2 rounded-t-lg" style={{ backgroundColor: colors.navy }}>
            <h3 className="text-xs font-bold text-white text-center">IHS SYSTEMS</h3>
          </div>
          <div className="bg-white rounded-b-lg p-3 shadow-lg space-y-2">
            {ihsSystems.map((sys, i) => (
              <motion.div 
                key={sys}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="px-3 py-2 rounded text-xs text-center"
                style={{ backgroundColor: colors.iceBlue, color: colors.dark }}
              >
                {sys}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Hub */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="w-0.5 h-8" style={{ backgroundColor: colors.teal }} />
          <div className="px-4 py-2 rounded-full text-xs font-bold text-white" style={{ backgroundColor: colors.teal }}>
            API Hub
          </div>
          <div className="w-0.5 h-8" style={{ backgroundColor: colors.teal }} />
        </motion.div>

        {/* Procure AI Platform */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 border-2 rounded-lg p-4"
          style={{ borderColor: colors.teal }}
        >
          <h3 className="text-xs font-bold mb-3" style={{ color: colors.teal }}>PROCURE AI PLATFORM (AZURE)</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="px-2 py-2 rounded text-xs text-white text-center font-medium"
                style={{ backgroundColor: svc.color }}
              >
                {svc.name}
              </motion.div>
            ))}
          </div>
          <div className="px-3 py-2 rounded text-xs text-center" style={{ backgroundColor: colors.iceBlue, color: colors.dark }}>
            Azure SQL | Cosmos DB | Redis | Blob Storage | Cognitive Search
          </div>
        </motion.div>

        {/* External */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="w-44"
        >
          <div className="px-3 py-2 rounded text-xs text-center text-white" style={{ backgroundColor: colors.orange }}>
            External: Alibaba | Global Sources | D&B | NAVEX | Docusign
          </div>
        </motion.div>
      </div>

      {/* Infrastructure Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="px-4 py-2" style={{ backgroundColor: colors.dark }}>
          <h3 className="text-xs font-bold text-white">IHS Technical Infrastructure Required</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>Category</th>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>Requirement</th>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>Environment</th>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>Required By</th>
            </tr>
          </thead>
          <tbody>
            {infra.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-2 font-bold" style={{ color: colors.teal }}>{row.cat}</td>
                <td className="px-4 py-2" style={{ color: colors.slate }}>{row.req}</td>
                <td className="px-4 py-2" style={{ color: colors.slate }}>{row.env}</td>
                <td className="px-4 py-2 font-bold" style={{ color: colors.dark }}>{row.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 6: GOVERNANCE ====================
const Slide6Governance = () => {
  const raciData = [
    { activity: "Platform development", tn: "R/A", it: "C", proc: "I", exec: "I" },
    { activity: "D365 / system integration", tn: "R", it: "A/C", proc: "C", exec: "I" },
    { activity: "Data migration & bulk upload", tn: "R", it: "R", proc: "A", exec: "I" },
    { activity: "UAT & go-live sign-off", tn: "R", it: "C", proc: "R", exec: "A" },
    { activity: "Change management & training", tn: "C", it: "C", proc: "R/A", exec: "I" },
  ];

  const deps = ["D1: Azure env (Wk 1)", "D2: D365 API creds (Wk 2)", "D3: ServiceNow specs (Mo 2)", "D4: Vendor master export (Mo 1)", "D5: RFx templates (Mo 2)", "D6: 3rd-party APIs (Mo 3)", "D7: UAT env (Mo 3)", "D8: Security review (Mo 4)"];

  return (
    <div className="w-full h-full p-10 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>04</span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Governance & Delivery Model</h2>
      </div>

      {/* Hierarchy */}
      <div className="flex flex-col items-center mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-8 py-3 rounded-lg text-white text-xs font-bold text-center" style={{ backgroundColor: colors.navy }}>
          STEERING COMMITTEE (Monthly) — Exec Sponsor, Project Director, IT Lead, Project Owner
        </motion.div>
        <div className="w-0.5 h-4" style={{ backgroundColor: colors.teal }} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="px-8 py-3 rounded-lg text-white text-xs font-bold text-center" style={{ backgroundColor: colors.teal }}>
          PROJECT STATUS REVIEW (Weekly) — PM, IT Lead, Business Analysts
        </motion.div>
        <div className="w-0.5 h-4" style={{ backgroundColor: colors.teal }} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3">
          {[
            { title: "Sprint Demo", sub: "Bi-weekly — Full team + stakeholders", color: colors.blue },
            { title: "Technical Review", sub: "Weekly — Architect + Devs + IT Lead", color: colors.teal },
            { title: "Change Mgmt & Training", sub: "IHS Project Owner + Champions", color: colors.green },
            { title: "Integration Coordination", sub: "IT Lead + TN Macaulay", color: colors.orange },
          ].map((item, i) => (
            <div key={i} className="px-4 py-2 rounded text-white text-center" style={{ backgroundColor: item.color }}>
              <p className="text-xs font-bold">{item.title}</p>
              <p className="text-xs opacity-80">{item.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RACI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.dark }}>
              <th className="px-4 py-2 text-left text-white font-bold">Activity</th>
              <th className="px-4 py-2 text-center text-white font-bold">TN Macaulay</th>
              <th className="px-4 py-2 text-center text-white font-bold">IHS IT</th>
              <th className="px-4 py-2 text-center text-white font-bold">IHS Procurement</th>
              <th className="px-4 py-2 text-center text-white font-bold">Exec Sponsor</th>
            </tr>
          </thead>
          <tbody>
            {raciData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-2" style={{ color: colors.dark }}>{row.activity}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: row.tn.includes("A") ? colors.blue : colors.slate }}>{row.tn}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: row.it.includes("A") ? colors.blue : colors.slate }}>{row.it}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: row.proc.includes("A") ? colors.blue : colors.slate }}>{row.proc}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: row.exec.includes("A") ? colors.blue : colors.slate }}>{row.exec}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: colors.lightGrey, color: colors.slate }}>
          R = Responsible | A = Accountable | C = Consulted | I = Informed
        </div>
      </motion.div>

      {/* Dependencies */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-4 py-2 rounded-lg text-xs flex flex-wrap gap-3" style={{ backgroundColor: colors.iceBlue }}>
        {deps.map((d, i) => (
          <span key={i} style={{ color: colors.dark }}>{d}</span>
        ))}
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 7: RISK ====================
const Slide7Risk = () => {
  const risks = [
    { id: "R1", risk: "D365 integration complexity", l: "Med", i: "High", mit: "Early POC in Month 1, dedicated integration specialist", owner: "TN Mac" },
    { id: "R2", risk: "Delayed IHS environment access", l: "Med", i: "High", mit: "Parallel dev env, early dependency tracking", owner: "IHS IT" },
    { id: "R3", risk: "Scope creep from new requirements", l: "High", i: "Med", mit: "Formal change control, weekly scope reviews", owner: "Joint" },
    { id: "R4", risk: "Key resource unavailability", l: "Low", i: "High", mit: "Cross-training, documentation, backup resources", owner: "TN Mac" },
    { id: "R5", risk: "Data migration quality issues", l: "Med", i: "Med", mit: "Data profiling, validation scripts, cleansing", owner: "Joint" },
    { id: "R6", risk: "User adoption resistance", l: "Med", i: "Med", mit: "Early engagement, training, change champions", owner: "IHS" },
    { id: "R7", risk: "Third-party API changes", l: "Low", i: "Med", mit: "Abstraction layer, API versioning, monitoring", owner: "TN Mac" },
    { id: "R8", risk: "Security / compliance gaps", l: "Low", i: "High", mit: "Security review gates, compliance checklist, pen testing", owner: "Joint" },
  ];

  const reporting = [
    { cadence: "Weekly", forum: "Sprint Review", content: "Velocity, blockers, demo of features", audience: "PM + IT Lead + BAs" },
    { cadence: "Bi-weekly", forum: "Sprint Demo", content: "Feature walkthrough, stakeholder feedback", audience: "Full project team" },
    { cadence: "Monthly", forum: "SteerCo Pack", content: "Strategic progress, decisions, risk escalations", audience: "Exec Sponsor + SteerCo" },
    { cadence: "Phase Gate", forum: "Go/No-Go", content: "UAT results, readiness checklist, sign-off", audience: "Exec Sponsor (final)" },
  ];

  const getColor = (level) => level === "High" ? colors.red : level === "Med" ? colors.orange : colors.green;

  return (
    <div className="w-full h-full p-10 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>04</span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Risk Register & Reporting Cadence</h2>
      </div>

      {/* Risk Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.dark }}>
              <th className="px-3 py-2 text-left text-white font-bold">ID</th>
              <th className="px-3 py-2 text-left text-white font-bold">Risk</th>
              <th className="px-3 py-2 text-center text-white font-bold">L</th>
              <th className="px-3 py-2 text-center text-white font-bold">I</th>
              <th className="px-3 py-2 text-left text-white font-bold">Mitigation</th>
              <th className="px-3 py-2 text-left text-white font-bold">Owner</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-1.5 font-bold" style={{ color: colors.dark }}>{r.id}</td>
                <td className="px-3 py-1.5" style={{ color: colors.slate }}>{r.risk}</td>
                <td className="px-3 py-1.5 text-center font-bold" style={{ color: getColor(r.l) }}>{r.l}</td>
                <td className="px-3 py-1.5 text-center font-bold" style={{ color: getColor(r.i) }}>{r.i}</td>
                <td className="px-3 py-1.5" style={{ color: colors.slate }}>{r.mit}</td>
                <td className="px-3 py-1.5 font-bold" style={{ color: colors.dark }}>{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Reporting Framework */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.teal }}>
              <th className="px-4 py-2 text-left text-white font-bold">Cadence</th>
              <th className="px-4 py-2 text-left text-white font-bold">Forum</th>
              <th className="px-4 py-2 text-left text-white font-bold">Content</th>
              <th className="px-4 py-2 text-left text-white font-bold">Audience</th>
            </tr>
          </thead>
          <tbody>
            {reporting.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-2 font-bold" style={{ color: colors.teal }}>{r.cadence}</td>
                <td className="px-4 py-2 font-bold" style={{ color: colors.dark }}>{r.forum}</td>
                <td className="px-4 py-2" style={{ color: colors.slate }}>{r.content}</td>
                <td className="px-4 py-2" style={{ color: colors.slate }}>{r.audience}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs" style={{ backgroundColor: colors.lightGrey, color: colors.slate }}>
          Escalation: Workstream Lead (24hr) → PM (48hr) → SteerCo (72hr) → Exec Sponsor (exception)
        </div>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 8: ROADMAP ====================
const Slide8Roadmap = () => {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const deliverables = [
    { month: "1 (Feb)", key: "Kickoff, requirements validation, architecture design", gate: "Architecture Sign-off", gateColor: colors.blue },
    { month: "2 (Mar)", key: "Vendor Portal (9 interfaces), API foundation", gate: "Vendor Portal Alpha", gateColor: colors.slate },
    { month: "3 (Apr)", key: "Vendor Interface (6 pages), Due Diligence, Risk Monitor", gate: "Integration Testing", gateColor: colors.slate },
    { month: "4 (May)", key: "AI Bot, Reverse Auction Portal (8 pages), Phase 1 UAT", gate: "PHASE 1 GO-LIVE", gateColor: colors.blue },
    { month: "5 (Jun)", key: "RFx Creation (4 pages), Source Vendor (5 pages)", gate: "RFx Module Alpha", gateColor: colors.slate },
    { month: "6 (Jul)", key: "Scope Validation (11 pages), D365 integration", gate: "Integration Complete", gateColor: colors.slate },
    { month: "7–9", key: "Review & Rank, BAFO, Automated Planning, Templates, Phase 2 UAT", gate: "PHASE 2 GO-LIVE", gateColor: colors.teal },
    { month: "10–11", key: "Forecasting, Category Mgmt, Risk Register, Cost/TCO Reporting", gate: "Reporting Suite Live", gateColor: colors.slate },
    { month: "12–13", key: "Performance Mgmt, Exception Requests, Settings, Audit, Final UAT", gate: "PROJECT GO-LIVE", gateColor: colors.green },
  ];

  const payments = [
    { num: 1, trigger: "Project kickoff (contract signature)", pct: "50%", amt: "$83,750", target: "Feb 2026" },
    { num: 2, trigger: "Phase 1 completion (core modules + vendor portal)", pct: "20%", amt: "$33,500", target: "May 2026" },
    { num: 3, trigger: "Phase 2 completion (RFx workflows live)", pct: "15%", amt: "$25,125", target: "Oct 2026" },
    { num: 4, trigger: "Final delivery and go-live", pct: "15%", amt: "$25,125", target: "Feb 2027" },
  ];

  return (
    <div className="w-full h-full p-8 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>05</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Milestones & Execution Roadmap</h2>
          <p className="text-sm" style={{ color: colors.slate }}>13-month delivery — February 2026 to February 2027</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2" style={{ color: colors.slate }}>
          {months.map((m, i) => <span key={i} className="w-12 text-center">{m}</span>)}
        </div>
        <div className="relative h-8 flex gap-1">
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }} style={{ originX: 0 }}
            className="h-full rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: colors.blue, width: `${(4/13)*100}%` }}>
            Phase 1: Foundation & Core ($47,500)
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ originX: 0 }}
            className="h-full rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: colors.teal, width: `${(5/13)*100}%` }}>
            Phase 2: RFx Workflows ($60,000)
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }} style={{ originX: 0 }}
            className="h-full rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: colors.green, width: `${(4/13)*100}%` }}>
            Phase 3: Intelligence ($60,000)
          </motion.div>
        </div>
      </div>

      {/* Deliverables Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: colors.dark }}>
              <th className="px-3 py-2 text-left text-white font-bold w-20">Month</th>
              <th className="px-3 py-2 text-left text-white font-bold">Key Deliverables</th>
              <th className="px-3 py-2 text-left text-white font-bold w-40">Milestone Gate</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((d, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-1.5 font-bold" style={{ color: colors.dark }}>{d.month}</td>
                <td className="px-3 py-1.5" style={{ color: colors.slate }}>{d.key}</td>
                <td className="px-3 py-1.5 font-bold" style={{ color: d.gateColor }}>{d.gate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Payment Milestones */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-2 font-bold text-xs" style={{ backgroundColor: colors.teal, color: colors.white }}>Payment Milestones</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>#</th>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>Trigger</th>
              <th className="px-4 py-2 text-center font-bold" style={{ color: colors.dark }}>%</th>
              <th className="px-4 py-2 text-right font-bold" style={{ color: colors.dark }}>Amount</th>
              <th className="px-4 py-2 text-right font-bold" style={{ color: colors.dark }}>Target</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.num} className="border-b border-gray-100">
                <td className="px-4 py-2 font-bold" style={{ color: colors.teal }}>{p.num}</td>
                <td className="px-4 py-2" style={{ color: colors.slate }}>{p.trigger}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: colors.dark }}>{p.pct}</td>
                <td className="px-4 py-2 text-right font-bold" style={{ color: colors.green }}>{p.amt}</td>
                <td className="px-4 py-2 text-right" style={{ color: colors.slate }}>{p.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 9: RESOURCES ====================
const Slide9Resources = () => {
  const tnTeam = [
    { role: "Project Director", p1: "10 hrs/wk", p2: "10 hrs/wk", p3: "10 hrs/wk", total: "520 hrs" },
    { role: "Technical Project Manager", p1: "40 hrs/wk", p2: "40 hrs/wk", p3: "40 hrs/wk", total: "2,080 hrs" },
    { role: "Solution Architect", p1: "40 hrs/wk", p2: "20 hrs/wk", p3: "10 hrs/wk", total: "1,200 hrs" },
    { role: "Senior Full-Stack Developers (2)", p1: "40 hrs/wk ea", p2: "40 hrs/wk ea", p3: "40 hrs/wk ea", total: "4,160 hrs" },
    { role: "AI/ML Engineer", p1: "20 hrs/wk", p2: "30 hrs/wk", p3: "40 hrs/wk", total: "1,560 hrs" },
    { role: "QA Engineer", p1: "20 hrs/wk", p2: "40 hrs/wk", p3: "40 hrs/wk", total: "1,760 hrs" },
    { role: "DevOps Engineer", p1: "30 hrs/wk", p2: "20 hrs/wk", p3: "30 hrs/wk", total: "1,360 hrs" },
  ];

  const ihsTeam = [
    { role: "Executive Sponsor", weekly: "1 hr/week", activities: "Steering committee, escalations, budget approval" },
    { role: "Project Owner (Procurement)", weekly: "8 hrs/week", activities: "Requirements, UAT, business process decisions" },
    { role: "IT Lead", weekly: "8 hrs/week", activities: "Technical review, integration support, security" },
    { role: "Business Analysts (2)", weekly: "20 hrs/week each", activities: "Requirements docs, process mapping, testing" },
    { role: "SMEs + Change Champions", weekly: "4 hrs/week each", activities: "Domain expertise, training coordination, feedback" },
  ];

  return (
    <div className="w-full h-full p-8 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>05</span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Resource Mobilisation & Change Management</h2>
      </div>

      {/* TN Macaulay Team */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: colors.teal }}>
          <span className="text-xs font-bold text-white">TN Macaulay Delivery Team</span>
          <span className="text-xs text-white opacity-80">12,640 total hours</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
              <th className="px-3 py-2 text-left font-bold" style={{ color: colors.dark }}>Role</th>
              <th className="px-3 py-2 text-center font-bold" style={{ color: colors.blue }}>Phase 1 (4 mo)</th>
              <th className="px-3 py-2 text-center font-bold" style={{ color: colors.teal }}>Phase 2 (5 mo)</th>
              <th className="px-3 py-2 text-center font-bold" style={{ color: colors.green }}>Phase 3 (4 mo)</th>
              <th className="px-3 py-2 text-right font-bold" style={{ color: colors.dark }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {tnTeam.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-1.5" style={{ color: colors.dark }}>{r.role}</td>
                <td className="px-3 py-1.5 text-center" style={{ color: colors.slate }}>{r.p1}</td>
                <td className="px-3 py-1.5 text-center" style={{ color: colors.slate }}>{r.p2}</td>
                <td className="px-3 py-1.5 text-center" style={{ color: colors.slate }}>{r.p3}</td>
                <td className="px-3 py-1.5 text-right font-bold" style={{ color: colors.teal }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* IHS Team */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
        <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: colors.navy }}>
          <span className="text-xs font-bold text-white">IHS Towers Resources Required</span>
          <span className="text-xs text-white opacity-80">3,380 total hours</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
              <th className="px-3 py-2 text-left font-bold" style={{ color: colors.dark }}>Role</th>
              <th className="px-3 py-2 text-center font-bold" style={{ color: colors.dark }}>Weekly Commitment</th>
              <th className="px-3 py-2 text-left font-bold" style={{ color: colors.dark }}>Key Activities</th>
            </tr>
          </thead>
          <tbody>
            {ihsTeam.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-1.5 font-bold" style={{ color: colors.dark }}>{r.role}</td>
                <td className="px-3 py-1.5 text-center font-bold" style={{ color: colors.teal }}>{r.weekly}</td>
                <td className="px-3 py-1.5" style={{ color: colors.slate }}>{r.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Post-Deployment */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="px-4 py-3 rounded-lg text-xs flex gap-6" style={{ backgroundColor: colors.iceBlue }}>
        <span style={{ color: colors.dark }}><strong>Hypercare:</strong> 3 months (4-hr response)</span>
        <span style={{ color: colors.dark }}><strong>Critical issues:</strong> 24/7</span>
        <span style={{ color: colors.dark }}><strong>Knowledge transfer:</strong> Month 13</span>
        <span style={{ color: colors.dark }}><strong>Optional maintenance:</strong> $3,000/month</span>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 10: COMMERCIAL ====================
const Slide10Commercial = () => {
  const investment = [
    { phase: "Phase 1: Foundation & Core", amt: "$47,500", time: "Feb–May 2026" },
    { phase: "Phase 2: RFx Workflows", amt: "$60,000", time: "Jun–Oct 2026" },
    { phase: "Phase 3: Intelligence", amt: "$60,000", time: "Nov–Feb 2027" },
  ];

  const kpis = [
    { kpi: "Procurement cycle time", baseline: "45 days", target: "15 days" },
    { kpi: "Vendor onboarding", baseline: "3–4 weeks", target: "3–5 days" },
    { kpi: "Spend visibility", baseline: "~40%", target: ">85%" },
    { kpi: "Cost savings", baseline: "Baseline", target: "10–15% YoY" },
    { kpi: "Automation rate", baseline: "<10%", target: "80%+" },
  ];

  const competitive = [
    { metric: "Total cost", procure: "$167.5K one-time", ariba: "$200K+/year", oracle: "$180K+/year", inhouse: "$300K+" },
    { metric: "AI capabilities", procure: "5+ AI engines", ariba: "Basic", oracle: "Basic", inhouse: "None" },
    { metric: "D365 integration", procure: "Deep, proven", ariba: "Available", oracle: "Available", inhouse: "Build" },
    { metric: "Code ownership", procure: "Full to IHS", ariba: "No (SaaS)", oracle: "No (SaaS)", inhouse: "Yes" },
    { metric: "Annual licence", procure: "None", ariba: "$200K+", oracle: "$180K+", inhouse: "None" },
  ];

  return (
    <div className="w-full h-full p-10 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>06</span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Commercial & Performance Framework</h2>
      </div>

      <div className="flex gap-6 mb-6">
        {/* Investment Summary */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3" style={{ backgroundColor: colors.dark }}>
            <h3 className="text-sm font-bold text-white">Investment Summary</h3>
          </div>
          <div className="p-4">
            {investment.map((i, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm" style={{ color: colors.dark }}>{i.phase}</span>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: colors.teal }}>{i.amt}</span>
                  <span className="text-xs ml-2" style={{ color: colors.slate }}>{i.time}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-2 border-t-2 border-gray-200">
              <span className="text-sm font-bold" style={{ color: colors.dark }}>TOTAL</span>
              <span className="text-lg font-bold" style={{ color: colors.green }}>$167,500</span>
            </div>
            <p className="text-xs mt-2" style={{ color: colors.slate }}>+ 7.5% VAT = $180,062.50 | Optional maintenance: $3,000/month</p>
          </div>
        </motion.div>

        {/* KPI Framework */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3" style={{ backgroundColor: colors.teal }}>
            <h3 className="text-sm font-bold text-white">KPI Framework</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
                <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}>KPI</th>
                <th className="px-4 py-2 text-center font-bold" style={{ color: colors.slate }}>Baseline</th>
                <th className="px-4 py-2 text-center font-bold" style={{ color: colors.green }}>Target</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-2" style={{ color: colors.dark }}>{k.kpi}</td>
                  <td className="px-4 py-2 text-center" style={{ color: colors.slate }}>{k.baseline}</td>
                  <td className="px-4 py-2 text-center font-bold" style={{ color: colors.green }}>{k.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Competitive Context */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-2" style={{ backgroundColor: colors.navy }}>
          <h3 className="text-xs font-bold text-white">Competitive Context</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ backgroundColor: colors.lightGrey }}>
              <th className="px-4 py-2 text-left font-bold" style={{ color: colors.dark }}></th>
              <th className="px-4 py-2 text-center font-bold" style={{ color: colors.teal }}>Procure AI</th>
              <th className="px-4 py-2 text-center font-bold" style={{ color: colors.slate }}>SAP Ariba</th>
              <th className="px-4 py-2 text-center font-bold" style={{ color: colors.slate }}>Oracle</th>
              <th className="px-4 py-2 text-center font-bold" style={{ color: colors.slate }}>In-House</th>
            </tr>
          </thead>
          <tbody>
            {competitive.map((c, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-2 font-bold" style={{ color: colors.dark }}>{c.metric}</td>
                <td className="px-4 py-2 text-center font-bold" style={{ color: colors.green }}>{c.procure}</td>
                <td className="px-4 py-2 text-center" style={{ color: colors.slate }}>{c.ariba}</td>
                <td className="px-4 py-2 text-center" style={{ color: colors.slate }}>{c.oracle}</td>
                <td className="px-4 py-2 text-center" style={{ color: colors.slate }}>{c.inhouse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 11: DECISIONS ====================
const Slide11Decisions = () => {
  const decisions = [
    { num: "01", title: "Confirm Programme Start & Milestone 1 Payment", desc: "Approve mobilisation and authorise Payment 1 ($83,750 + VAT). Team begins with Azure provisioning, D365 integration, and architecture design in Month 1.", btn: "GO / NO-GO" },
    { num: "02", title: "Approve Governance Model & Team Allocation", desc: "Endorse SteerCo composition, reporting cadence, RACI matrix, and escalation protocol. Confirm IHS project team roles (Project Owner, IT Lead, 2 BAs, SMEs, Change Champions).", btn: "APPROVE" },
    { num: "03", title: "Instruct IT to Provision Infrastructure Access", desc: "Direct IHS IT to provision: Azure subscription (Week 1), D365 API credentials (Week 2), VPN access for dev team (Week 1), and ServiceNow specs (Month 2).", btn: "APPROVE" },
  ];

  return (
    <div className="w-full h-full flex flex-col p-16" style={{ backgroundColor: colors.navy, paddingLeft: 80 }}>
      <div className="mb-8">
        <span className="text-lg font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>07</span>
        <h2 className="text-4xl font-bold mt-2 mb-4" style={{ fontFamily: "Georgia, serif", color: colors.white }}>Decision Points</h2>
        <div className="w-44 h-0.5 mb-4" style={{ backgroundColor: colors.teal }} />
        <p style={{ color: colors.slate }}>Three decisions required to proceed with 1 March 2026 mobilisation:</p>
      </div>

      <div className="space-y-4 flex-1">
        {decisions.map((d, i) => (
          <motion.div
            key={d.num}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-6 p-5 rounded-lg"
            style={{ backgroundColor: colors.dark }}
          >
            <span className="text-3xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>{d.num}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{d.title}</h3>
              <p className="text-sm" style={{ color: colors.slate }}>{d.desc}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${colors.teal}40` }}
              className="px-6 py-3 rounded-lg font-bold text-white"
              style={{ backgroundColor: colors.teal }}
            >
              {d.btn}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 px-6 py-4 rounded-lg border"
        style={{ borderColor: colors.teal }}
      >
        <p className="text-sm italic" style={{ color: colors.iceBlue }}>
          Thursday follow-up session will incorporate feedback and conclude with formal endorsement to proceed.
        </p>
      </motion.div>
    </div>
  );
};

// ==================== SLIDE 12: CREDENTIALS ====================
const Slide12Credentials = () => {
  const projects = [
    { title: "Meristem Investment Bank", year: "2016", desc: "One of Nigeria's earliest enterprise AI chatbots. NLP-powered investment advisory processing thousands of queries daily.", color: colors.blue },
    { title: "Vodafone Procurement Platform", year: "2017–2019", desc: "Three-in-one: internal procurement + vendor enablement + reverse auctions. D365 integration. 200+ vendors, ₦2B+ annually.", color: colors.teal },
    { title: "Enterprise Financial Wallet", year: "2018", desc: "Multi-tenant platform for P&G, Vodafone, Dangote, Oando. D365 reconciliation. 50,000+ users across tenants.", color: colors.green },
    { title: "Multi-Tenant AI Platform", year: "2018–Present", desc: "15+ enterprises on shared infra. Kubernetes-based isolation. 50K+ monthly transactions. HR, CX, and operations.", color: colors.navy },
  ];

  const stats = [
    { value: "8+", label: "Years D365/Azure" },
    { value: "15+", label: "Enterprise tenants" },
    { value: "5", label: "D365 integrations" },
    { value: "50K+", label: "Monthly txns" },
    { value: "12", label: "Azure apps live" },
  ];

  return (
    <div className="w-full h-full p-12 overflow-hidden" style={{ backgroundColor: colors.lightGrey, paddingLeft: 80 }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: colors.dark }}>Appendix: TN Macaulay Credentials</h2>
        <p style={{ color: colors.slate }}>Pioneering enterprise AI in Nigeria since 2016</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: p.color }}>
              <h3 className="text-sm font-bold text-white">{p.title}</h3>
              <span className="text-xs text-white opacity-80">{p.year}</span>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm" style={{ color: colors.slate }}>{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-around py-6 rounded-lg"
        style={{ backgroundColor: colors.iceBlue }}
      >
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-bold" style={{ fontFamily: "Georgia, serif", color: colors.teal }}>{s.value}</p>
            <p className="text-xs" style={{ color: colors.slate }}>{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProcureAIExecutivePackV3;
