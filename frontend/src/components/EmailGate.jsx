import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Building2, ArrowRight, Lock, Eye } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const EmailGate = ({ proposalSlug, proposalTitle, children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const activityInterval = useRef(null);
  const startTime = useRef(Date.now());

  // Check if user already has access
  useEffect(() => {
    const checkAccess = async () => {
      const storedEmail = localStorage.getItem(`proposal_viewer_${proposalSlug}`);
      
      if (storedEmail) {
        try {
          const response = await axios.get(
            `${API_URL}/api/proposals/viewers/check/${proposalSlug}/${encodeURIComponent(storedEmail)}`
          );
          
          if (response.data.has_access) {
            setEmail(storedEmail);
            setName(response.data.name || '');
            setCompany(response.data.company || '');
            setHasAccess(true);
            
            // Re-register to update last viewed
            await axios.post(`${API_URL}/api/proposals/viewers/register`, {
              email: storedEmail,
              name: response.data.name || '',
              company: response.data.company || '',
              proposal_slug: proposalSlug
            });
          }
        } catch (err) {
          console.error('Error checking access:', err);
        }
      }
      
      setIsLoading(false);
    };

    checkAccess();
  }, [proposalSlug]);

  // Track time spent
  useEffect(() => {
    if (hasAccess && email) {
      startTime.current = Date.now();
      
      // Send activity update every 30 seconds
      activityInterval.current = setInterval(async () => {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        startTime.current = Date.now();
        
        try {
          await axios.post(`${API_URL}/api/proposals/viewers/activity`, {
            email,
            proposal_slug: proposalSlug,
            time_spent: timeSpent
          });
        } catch (err) {
          console.error('Error tracking activity:', err);
        }
      }, 30000);

      // Send final activity on unmount
      return () => {
        if (activityInterval.current) {
          clearInterval(activityInterval.current);
        }
        
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        if (timeSpent > 0) {
          axios.post(`${API_URL}/api/proposals/viewers/activity`, {
            email,
            proposal_slug: proposalSlug,
            time_spent: timeSpent
          }).catch(() => {});
        }
      };
    }
  }, [hasAccess, email, proposalSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email) {
      setError('Please enter your email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/proposals/viewers/register`, {
        email,
        name,
        company,
        proposal_slug: proposalSlug
      });

      if (response.data.success) {
        localStorage.setItem(`proposal_viewer_${proposalSlug}`, email);
        setHasAccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#1E2761]">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAccess) {
    return children;
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#1E2761] via-[#1a2057] to-[#0f1535] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">View Presentation</h1>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              {proposalTitle || 'Executive Presentation'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="text-center mb-6">
              <Lock className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-white/70 text-sm">
                Enter your details to access this presentation
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  data-testid="email-gate-email"
                />
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Your Name <span className="text-white/40">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  data-testid="email-gate-name"
                />
              </div>
            </div>

            {/* Company Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Company <span className="text-white/40">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company Name"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  data-testid="email-gate-company"
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="email-gate-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Continue to Presentation</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <p className="text-white/40 text-xs text-center mt-4">
              Your information is used only to track viewership and will not be shared.
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs text-center mt-6">
          Powered by THCO Group
        </p>
      </motion.div>
    </div>
  );
};

export default EmailGate;
