import { useState, useEffect, useRef, useCallback } from "react";
import { assessmentAPI } from "../lib/api";
import { Check } from "lucide-react";

const QUESTIONS = [
  { id: "q1", type: "textarea", text: "Tell us about yourself — but don't tell us what you've built. Tell us who you are." },
  { id: "q2", type: "radio", text: "If you could only work at ONE company for the rest of your career, which would you choose? You must pick one.", options: [
    "The first trillion-dollar African company that puts Africa on the global map",
    "The company that cures cancer and saves 1 million+ lives",
    "The company with the best culture in the world — where everyone loves coming to work",
    "The highest paying company in the world",
    "The company that finally makes the world take Black people seriously",
  ]},
  { id: "q3", type: "textarea", text: "Why did you pick that? Be completely honest — not what sounds good, what's actually true for you." },
  { id: "q4", type: "radio", text: "What drives you? Pick the ONE that is most honest, not the one that sounds best.", options: [
    "I want to prove to myself that I can build something extraordinary",
    "I want financial freedom for my family",
    "I want to be part of something that changes the world",
    "I want to master my craft and be the best at what I do",
    "I want to be recognised and respected in my field",
  ]},
  { id: "q5", type: "textarea", text: 'What does "being part of something big" actually mean to you? Don\'t give us the answer you think we want. Tell us what it really means when you imagine it.' },
  { id: "q6", type: "radio", text: "How smart do you think you are? Pick your estimated IQ range honestly.", options: [
    "Below average (below 100)",
    "Average (100)",
    "Above average (100–115)",
    "Smart (115–130)",
    "Very smart (130–145)",
    "Genius level (145+)",
    "I don't think IQ measures real intelligence",
  ]},
  { id: "q7", type: "textarea", text: "Why did you pick that? What makes you believe this about yourself?" },
  { id: "q8", type: "radio", text: "Does order and structure make sense to you? Why or why not?", options: [
    "Order is essential — without it, nothing gets shipped",
    "Some order, but too much kills creativity",
    "Chaos is where the best ideas come from",
    "It depends entirely on the stage of the project",
  ]},
  { id: "q9", type: "textarea", text: "Why that answer? Give a real example from your work." },
  { id: "q10", type: "textarea", text: "Have you ever taken credit for something you didn't fully do, or let someone else take blame for something that was partly your fault? What happened?" },
  { id: "q11", type: "textarea", text: "Do you think you are replaceable? What — if anything — stops you from being replaced?" },
  { id: "q12", type: "textarea", text: "What's one thing about yourself that most people get wrong?" },
  { id: "q13", type: "textarea", text: "What is something you are genuinely not good at — technically or otherwise — that would be relevant to this role?" },
  { id: "q14", type: "textarea", text: "Do you have a faith or belief system? If yes, which one? If no, what guides your moral decisions?" },
  { id: "q15", type: "textarea", text: "If you are a person of faith — what is the most important book, chapter, or verse in your holy text for you personally? Why does it matter to you? (Skip this if you answered no faith above.)" },
  { id: "q16", type: "textarea", text: "Who do you consider the most important person — dead or alive, from any faith, history, or fiction? Why?" },
  { id: "q17", type: "textarea", text: "If you were an animal, what would you be? Why?" },
  { id: "q18", type: "textarea", text: "What's one thing you love most about your family? And what's one thing you wish you could change?" },
  { id: "q19", type: "textarea", text: "Do you believe you have the ability to build anything? If yes, why do you say so? If no, what are your limits?" },
  { id: "q20", type: "textarea", text: "You have 48 hours, no sleep required, and unlimited compute. What do you build — and why?" },
  { id: "q21", type: "textarea", text: 'What is your standard for "done"? Give a specific example of when you held that standard under pressure.' },
  { id: "q22", type: "textarea", text: "Do you think AI can build anything? Why or why not?" },
  { id: "q23", type: "textarea", text: "What is the hardest thing you've ever built, and what made it genuinely difficult? Don't tell us the technology — tell us what made it hard." },
  { id: "q24", type: "textarea", text: "Have you ever been in a situation where you knew the right thing to do, but doing it would cost you something — a job, a friendship, money? What did you do?" },
  { id: "q25", type: "textarea", text: "If you joined a team and after three months you realised the technical lead was making a decision you believed was fundamentally wrong — something that would hurt the product — what would you do?" },
  { id: "q26", type: "textarea", text: 'Tell us about a time you failed badly. Not a "failure that was actually a success" story. A real failure. What happened and what did it teach you?' },
  { id: "q27", type: "textarea", text: "If you found a critical security vulnerability in a system you didn't build and weren't responsible for, what would you do — step by step?" },
  { id: "q28", type: "textarea", text: 'If I gave you a project you\'d never built before — something completely outside your experience — and told you "figure it out, you have 4 weeks," what would your first 48 hours look like?' },
  { id: "q29", type: "textarea", text: "Be honest: are you a 9-to-5 person, or are you the kind of person who loses track of time because you're deep in a problem?" },
  { id: "q30", type: "textarea", text: "Describe the best place to work for you. Not a company name — describe the environment, the people, the energy." },
  { id: "q31", type: "textarea", text: "If THCO became the most important technology and professional services firm in Africa in 5 years, what role do you see yourself playing in that story?" },
  { id: "q32", type: "textarea", text: "Is there anything about you — your background, your values, the way you think — that you think we should know, but that we didn't ask about?" },
];

const TOTAL_TIME = 5400; // 90 minutes in seconds

// --- Page 1: Candidate Info ---
const PageOne = ({ onStart }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() && email.trim();

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await assessmentAPI.start({ name: name.trim(), email: email.trim().toLowerCase() });
      onStart(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Candidate Assessment</h1>
          <p className="text-[#8b8aa0] mt-2 text-sm">THCO Engineering</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#c4c3d4] mb-1.5">Full name</label>
            <input
              data-testid="assessment-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c4c3d4] mb-1.5">Email address</label>
            <input
              data-testid="assessment-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            data-testid="assessment-begin-btn"
            onClick={handleStart}
            disabled={!canSubmit || loading}
            className="w-full py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#5a54d4] hover:bg-[#4e48c4] text-white"
          >
            {loading ? "Starting..." : "Begin assessment"}
          </button>

          <p className="text-center text-xs text-[#666]">
            You have 90 minutes to complete this assessment once you begin.
          </p>
        </div>
      </div>
    </div>
  );
};


// --- Timer Component ---
const Timer = ({ secondsLeft, total }) => {
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = (secondsLeft / total) * 100;

  let color = "#22c55e"; // green
  if (secondsLeft < 180) color = "#ef4444"; // red
  else if (secondsLeft < 600) color = "#eab308"; // amber

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d0e18]/95 backdrop-blur-sm border-b border-[#1f2033]" data-testid="assessment-timer">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-4">
        <span className="text-sm font-mono font-semibold tabular-nums" style={{ color, minWidth: 52 }}>
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
        <div className="flex-1 h-1.5 bg-[#1a1b2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-[#666]">{Math.round(pct)}%</span>
      </div>
    </div>
  );
};


// --- Page 2: Questions ---
const PageTwo = ({ assessment, onContinue, onTimerExpire }) => {
  const [answers, setAnswers] = useState(assessment.answers || {});
  const [secondsLeft, setSecondsLeft] = useState(() => {
    // Calculate remaining time based on stored timer data
    if (assessment.timer_started_at) {
      const started = new Date(assessment.timer_started_at).getTime();
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      return remaining;
    }
    return TOTAL_TIME;
  });
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef({});
  const timerSaveRef = useRef(null);
  const expiredRef = useRef(false);

  // Initialize timer_started_at on first load
  useEffect(() => {
    if (!assessment.timer_started_at) {
      const now = new Date().toISOString();
      assessmentAPI.saveTimer(assessment.id, { timer_started_at: now }).catch(() => {});
    }
  }, [assessment.id, assessment.timer_started_at]);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onTimerExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onTimerExpire]);

  // Save timer state periodically (every 30s)
  useEffect(() => {
    timerSaveRef.current = setInterval(() => {
      assessmentAPI.saveTimer(assessment.id, { time_remaining_seconds: secondsLeft }).catch(() => {});
    }, 30000);
    return () => clearInterval(timerSaveRef.current);
  }, [assessment.id, secondsLeft]);

  const saveAnswer = useCallback((questionId, value) => {
    // Clear any existing debounce for this question
    if (debounceRef.current[questionId]) clearTimeout(debounceRef.current[questionId]);

    debounceRef.current[questionId] = setTimeout(async () => {
      setSaving(true);
      try {
        await assessmentAPI.saveAnswers(assessment.id, { [questionId]: value });
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [assessment.id]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    saveAnswer(questionId, value);
  };

  const handleContinue = () => {
    onContinue(answers, secondsLeft);
  };

  return (
    <div className="min-h-screen bg-[#0a0b14]">
      <Timer secondsLeft={secondsLeft} total={TOTAL_TIME} />

      <div className="max-w-2xl mx-auto px-4 pt-16 pb-24">
        <div className="space-y-8">
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="group" data-testid={`question-${q.id}`}>
              <div className="flex gap-3 mb-3">
                <span className="text-[#5a54d4] font-semibold text-sm mt-0.5 shrink-0">Q{idx + 1}.</span>
                <p className="text-[#e0dff0] text-sm leading-relaxed">{q.text}</p>
              </div>

              <div className="pl-8">
                {q.type === "textarea" ? (
                  <textarea
                    data-testid={`answer-${q.id}`}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    rows={3}
                    className="w-full bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white text-sm leading-relaxed placeholder-[#444] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors resize-y min-h-[80px]"
                    placeholder="Type your answer..."
                  />
                ) : (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        data-testid={`option-${q.id}-${opt.slice(0,20).replace(/\s/g,'-').toLowerCase()}`}
                        className={`flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all border text-sm ${
                          answers[q.id] === opt
                            ? "bg-[#5a54d4]/10 border-[#5a54d4] text-white"
                            : "bg-[#13141f] border-[#2a2b3d] text-[#999] hover:border-[#3a3b5d] hover:text-[#ccc]"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                          answers[q.id] === opt ? "border-[#5a54d4] bg-[#5a54d4]" : "border-[#555]"
                        }`}>
                          {answers[q.id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-relaxed">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <span className="text-xs text-[#555]">{saving ? "Saving..." : "All answers auto-saved"}</span>
          <button
            data-testid="assessment-continue-btn"
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-medium text-sm bg-[#5a54d4] hover:bg-[#4e48c4] text-white transition-colors"
          >
            Continue to final details
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Page 3: Final Details ---
const PageThree = ({ assessment, answers, secondsLeft, onSubmit }) => {
  const [onsiteHybrid, setOnsiteHybrid] = useState(assessment.onsite_hybrid || "");
  const [salary, setSalary] = useState(assessment.salary_expectation || "");
  const [city, setCity] = useState(assessment.location_city || "");
  const [state, setState] = useState(assessment.location_state || "");
  const [country, setCountry] = useState(assessment.location_country || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = onsiteHybrid && salary.trim() && city.trim() && country.trim();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const timeTaken = TOTAL_TIME - secondsLeft;
      await assessmentAPI.saveFinal(assessment.id, {
        onsite_hybrid: onsiteHybrid,
        salary_expectation: salary.trim(),
        location_city: city.trim(),
        location_state: state.trim(),
        location_country: country.trim(),
        time_remaining_seconds: secondsLeft,
        total_time_taken_seconds: timeTaken,
      });
      onSubmit();
    } catch (err) {
      setError(err?.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h2 className="text-xl font-semibold text-white mb-8">Final details</h2>

        <div className="space-y-8">
          {/* Work arrangement */}
          <div>
            <p className="text-sm text-[#c4c3d4] mb-3">This role is onsite/hybrid — does this work for you?</p>
            <div className="flex gap-3">
              {["Yes", "No"].map((val) => (
                <button
                  key={val}
                  data-testid={`onsite-${val.toLowerCase()}`}
                  onClick={() => setOnsiteHybrid(val)}
                  className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all border ${
                    onsiteHybrid === val
                      ? "bg-[#5a54d4] border-[#5a54d4] text-white"
                      : "bg-[#13141f] border-[#2a2b3d] text-[#999] hover:border-[#3a3b5d]"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div>
            <p className="text-sm text-[#c4c3d4] mb-3">What is your monthly salary expectation?</p>
            <input
              data-testid="salary-input"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
              placeholder="Enter amount in your local currency"
            />
          </div>

          {/* Location */}
          <div>
            <p className="text-sm text-[#c4c3d4] mb-3">Where do you currently live?</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                data-testid="location-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
                placeholder="City *"
              />
              <input
                data-testid="location-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
                placeholder="State/Province"
              />
              <input
                data-testid="location-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-[#13141f] border border-[#2a2b3d] rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#5a54d4] focus:ring-1 focus:ring-[#5a54d4] transition-colors"
                placeholder="Country *"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            data-testid="assessment-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#5a54d4] hover:bg-[#4e48c4] text-white"
          >
            {loading ? "Submitting..." : "Submit assessment"}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Confirmation Screen ---
const Confirmation = ({ name }) => (
  <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-4">
    <div className="text-center max-w-sm" data-testid="assessment-confirmation">
      <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border-2 border-[#22c55e] flex items-center justify-center mx-auto mb-6">
        <Check size={32} className="text-[#22c55e]" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Assessment submitted</h2>
      <p className="text-[#8b8aa0] text-sm leading-relaxed">
        Thank you, {name}. Your responses have been recorded. We'll be in touch.
      </p>
    </div>
  </div>
);


// --- Main Assessment Component ---
export default function CandidateAssessment() {
  const [page, setPage] = useState(1);
  const [assessment, setAssessment] = useState(null);
  const [latestAnswers, setLatestAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  const handleStart = (data) => {
    setAssessment(data);
    // If assessment already has answers (resuming), go to page 2
    if (data.status === "completed") {
      setPage(4); // show confirmation
    } else {
      const hasAnswers = Object.values(data.answers || {}).some(v => v && String(v).trim());
      setPage(hasAnswers ? 2 : 2);
    }
  };

  const handleContinue = (answers, secondsRemaining) => {
    setLatestAnswers(answers);
    setTimeLeft(secondsRemaining);
    setPage(3);
  };

  const handleTimerExpire = useCallback(() => {
    setPage(3);
  }, []);

  const handleSubmit = () => {
    setPage(4);
  };

  if (page === 4) return <Confirmation name={assessment?.name || "Candidate"} />;
  if (page === 3) return <PageThree assessment={assessment} answers={latestAnswers} secondsLeft={timeLeft} onSubmit={handleSubmit} />;
  if (page === 2) return <PageTwo assessment={assessment} onContinue={handleContinue} onTimerExpire={handleTimerExpire} />;
  return <PageOne onStart={handleStart} />;
}
