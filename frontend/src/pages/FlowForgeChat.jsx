import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Bot,
  User,
  Loader2,
  Check,
  Clock,
  AlertCircle,
  FileCode,
  Zap,
  ChevronDown,
  Play,
  CheckCircle2,
  XCircle,
  Edit3,
  Database,
  Mail,
  Calendar,
  MessageSquare,
  Globe,
  PlugZap,
  Search
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { flowforgeAPI, authAPI } from "../lib/api";
import VoiceRecorder from "../components/flowforge/VoiceRecorder";
import ProblemBriefForm from "../components/flowforge/ProblemBriefForm";

// Unit name mapping
const UNIT_NAMES = {
  talent: "Talent & Human Capital",
  "thco-hr": "THCO HR",
  "project-management": "Project Management",
  "it-tools": "IT & THCO Tools",
  sales: "Sales & Business Development",
  marketing: "Marketing & Brand",
  advisory: "Advisory & Consulting",
  technology: "Technology & Build",
  operations: "Operations & Finance",
  academy: "Academy & Learning",
  "client-delivery": "Client Delivery",
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    building: { color: "bg-blue-500", label: "Building", icon: Edit3 },
    ready: { color: "bg-purple-500", label: "Ready", icon: Check },
    pending_approval: { color: "bg-yellow-500", label: "Pending Approval", icon: Clock },
    changes_requested: { color: "bg-orange-500", label: "Changes Requested", icon: AlertCircle },
    deployed: { color: "bg-green-500", label: "Deployed", icon: CheckCircle2 },
    active: { color: "bg-green-600", label: "Active", icon: Play },
    inactive: { color: "bg-gray-500", label: "Inactive", icon: XCircle },
    error: { color: "bg-red-500", label: "Error", icon: AlertCircle },
    draft: { color: "bg-gray-400", label: "Draft", icon: FileCode },
  };

  const config = statusConfig[status] || statusConfig.building;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Integration status icon
const IntegrationIcon = ({ type, status }) => {
  const icons = {
    supabase: Database,
    gmail: Mail,
    google_calendar: Calendar,
    slack: MessageSquare,
    http_request: Globe,
    anthropic: Bot,
    whisper: Mic,
  };
  
  const Icon = icons[type] || PlugZap;
  const statusColors = {
    connected: "text-green-500",
    not_connected: "text-gray-400",
    needs_setup: "text-yellow-500",
  };

  return (
    <div className={`flex items-center gap-1.5 ${statusColors[status] || statusColors.not_connected}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

// Message component
const ChatMessage = ({ message, isLastMessage, onActionClick }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  // Check if this is a welcome template message
  const isWelcomeTemplate = message.metadata?.type === 'welcome_template';

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`} data-testid={`chat-message-${message.role}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-gradient-to-br from-[#7C64FF] to-[#9D8AFF]" : "bg-gradient-to-br from-[#38D190] to-[#53E1A3]"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Zap className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {isWelcomeTemplate ? (
          // Styled Welcome Template
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full" data-testid="welcome-template">
            <div className="bg-gradient-to-r from-[#7C64FF] to-[#9D8AFF] px-4 py-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-white" />
                <span className="font-medium text-white">FlowForge</span>
              </div>
            </div>
            <div className="p-4">
              <div 
                className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-700 prose-em:text-gray-500 prose-em:text-xs"
                dangerouslySetInnerHTML={{ 
                  __html: message.content
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-[#7C64FF] mt-4 mb-2">$1</h2>')
                    .replace(/^---$/gm, '<hr class="my-4 border-gray-200"/>')
                    .replace(/✅/g, '<span class="text-green-500">✅</span>')
                    .replace(/📝/g, '<span class="text-2xl">📝</span>')
                    .replace(/🎤/g, '<span class="text-2xl">🎤</span>')
                    .replace(/👇/g, '<span class="text-xl">👇</span>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          </div>
        ) : (
          // Regular message
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? "bg-[#7C64FF] text-white rounded-tr-sm" 
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Voice transcription */}
            {message.has_voice && message.voice_transcription && (
              <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-80">
                <Mic className="w-3 h-3 inline mr-1" />
                Transcribed from voice
              </div>
            )}
          </div>
        )}

        {/* Workflow Preview - Enhanced for Two-Step Process */}
        {message.has_workflow && message.workflow_data && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full" data-testid="workflow-preview">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#7C64FF]" />
                <span className="font-medium text-gray-800">
                  {message.workflow_data.suggested_name || "Workflow Preview"}
                </span>
              </div>
              {message.workflow_data.trigger_type && (
                <span className="text-xs px-2 py-1 bg-[#7C64FF]/10 text-[#7C64FF] rounded-full capitalize">
                  {message.workflow_data.trigger_type}
                </span>
              )}
            </div>
            
            {/* Description */}
            {message.workflow_data.description && (
              <p className="text-sm text-gray-600 mb-3">{message.workflow_data.description}</p>
            )}
            
            {/* Workflow Steps */}
            {message.workflow_steps && message.workflow_steps.length > 0 && (
              <div className="space-y-2 mb-3">
                {message.workflow_steps.slice(0, 6).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-6 h-6 bg-[#7C64FF]/10 text-[#7C64FF] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {step.step_number || idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-gray-800">{step.name}</span>
                      {step.description && (
                        <p className="text-gray-500 text-xs mt-0.5">{step.description.substring(0, 80)}</p>
                      )}
                    </div>
                  </div>
                ))}
                {message.workflow_steps.length > 6 && (
                  <div className="text-xs text-gray-400 ml-8">
                    +{message.workflow_steps.length - 6} more steps
                  </div>
                )}
              </div>
            )}
            
            {/* Trigger Info */}
            {message.workflow_data.trigger_description && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>{message.workflow_data.trigger_description}</span>
              </div>
            )}
            
            {/* Systems Used */}
            {message.workflow_data.systems_used && message.workflow_data.systems_used.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {message.workflow_data.systems_used.map((system, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {system}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legacy Workflow Preview (for backwards compatibility) */}
        {message.has_workflow_preview && message.workflow_preview_json && !message.workflow_data && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="w-5 h-5 text-[#7C64FF]" />
              <span className="font-medium text-gray-800">Workflow Preview</span>
              <span className="text-xs text-gray-500">v{message.workflow_version || 1}</span>
            </div>
            <div className="space-y-2">
              {message.workflow_preview_json.steps?.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-[#7C64FF]/10 text-[#7C64FF] rounded-full flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{step.name || step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Alert */}
        {message.has_duplicate_alert && message.duplicate_data && (
          <div className={`mt-2 rounded-xl p-4 shadow-sm w-full ${
            message.duplicate_data.has_strong_match 
              ? "bg-yellow-50 border-2 border-yellow-200" 
              : "bg-blue-50 border border-blue-100"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Search className={`w-5 h-5 ${message.duplicate_data.has_strong_match ? "text-yellow-600" : "text-blue-600"}`} />
              <span className="font-medium text-gray-800">
                {message.duplicate_data.has_strong_match ? "Similar Tool Found" : "Related Tools"}
              </span>
            </div>
            
            {/* Strongest match */}
            <div className="bg-white rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{message.duplicate_data.strongest_match?.name}</h4>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  {message.duplicate_data.strongest_match?.similarity_score}% match
                </span>
              </div>
              <p className="text-sm text-gray-600">{message.duplicate_data.strongest_match?.description || "No description available"}</p>
              {message.duplicate_data.strongest_match?.is_active && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600">
                  <Play className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
            
            {/* Other matches */}
            {message.duplicate_data.other_matches?.length > 0 && (
              <div className="text-sm text-gray-500 mb-3">
                Also similar: {message.duplicate_data.other_matches.map(m => m.name).join(", ")}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {message.duplicate_data.action_buttons?.map((btn, idx) => (
                <Button
                  key={idx}
                  variant={btn.primary ? "default" : "outline"}
                  size="sm"
                  onClick={() => onActionClick && onActionClick(btn.action, message)}
                  className={btn.primary ? "bg-[#7C64FF] text-white hover:bg-[#6B55E0]" : ""}
                  data-testid={`duplicate-action-${btn.action}`}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Integration Check */}
        {message.has_integration_check && message.integration_check_data && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <PlugZap className="w-5 h-5 text-[#7C64FF]" />
              <span className="font-medium text-gray-800">Required Integrations</span>
            </div>
            <div className="space-y-2">
              {message.integration_check_data.integrations?.map((integration, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <IntegrationIcon type={integration.type} status={integration.status} />
                    <span className="text-gray-700">{integration.display_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    integration.status === "connected" 
                      ? "bg-green-100 text-green-700"
                      : integration.status === "needs_setup"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {integration.status === "connected" ? "Connected" : 
                     integration.status === "needs_setup" ? "Needs Setup" : "Not Connected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {message.has_action_buttons && message.action_buttons && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.action_buttons.map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant || "outline"}
                size="sm"
                onClick={() => onActionClick && onActionClick(btn.action, message)}
                className={btn.primary ? "bg-[#7C64FF] text-white hover:bg-[#6B55E0]" : ""}
                data-testid={`action-btn-${btn.action}`}
              >
                {btn.icon && <span className="mr-1">{btn.icon}</span>}
                {btn.label}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// Main FlowForge Chat Component
const FlowForgeChat = () => {
  const { unit, conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showProblemBriefForm, setShowProblemBriefForm] = useState(false);
  const [toolName, setToolName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);

  // Load user and conversation data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const userData = await authAPI.getMe();
        setUser(userData);

        if (conversationId && conversationId !== "new") {
          // Load existing conversation
          const [conv, msgs] = await Promise.all([
            flowforgeAPI.getConversation(conversationId),
            flowforgeAPI.getMessages(conversationId),
          ]);
          setConversation(conv);
          setMessages(msgs);
          setToolName(conv.tool_name || "Untitled");
          
          // Check if this is a new conversation with no user messages yet - show the form
          const hasUserMessages = msgs.some(m => m.role === 'user');
          if (!hasUserMessages) {
            setShowProblemBriefForm(true);
          }
        } else {
          // New conversation - create it and show the problem brief form
          const newConv = await flowforgeAPI.createConversation({ unit });
          setConversation(newConv);
          
          // Show the problem brief form instead of loading text template
          setShowProblemBriefForm(true);
          setMessages([]); // No messages yet - form will handle initial input
          
          // Navigate after setting state
          navigate(`/${unit}/build/${newConv.id}`, { replace: true });
        }
      } catch (error) {
        console.error("Failed to load FlowForge data:", error);
        if (error.response?.status === 404 || error.response?.data?.detail?.includes("table") || error.response?.status === 503) {
          // Supabase tables not set up yet - show setup instructions
          toast.error("FlowForge database setup required. Please check with your administrator.");
          setMessages([{
            id: "setup-required",
            role: "system",
            content: "FlowForge database is being configured. Please ask your administrator to complete the setup.",
            created_at: new Date().toISOString(),
          }]);
        } else {
          toast.error("Failed to load conversation");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [unit, conversationId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim(),
    };

    try {
      setSending(true);
      setInputValue("");

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, { ...userMessage, id: tempId, created_at: new Date().toISOString() }]);

      // Send to backend
      const savedMessage = await flowforgeAPI.addMessage(conversation.id, userMessage);
      
      // Update with real message
      setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMessage : m)));

      // Generate AI response
      try {
        const aiResponse = await flowforgeAPI.generateResponse(
          conversation.id,
          inputValue.trim(),
          true, // include_history
          true  // check_duplicates
        );
        
        // Save AI response to database with enhanced workflow data
        const aiMessage = {
          role: "assistant",
          content: aiResponse.content,
          // New two-step workflow format
          has_workflow: aiResponse.has_workflow || false,
          workflow_data: aiResponse.workflow_data || null,
          workflow_steps: aiResponse.workflow_steps || null,
          build_spec: aiResponse.build_spec || null,  // Stored for admin review
          explanation: aiResponse.explanation || null,
          integration_requirements: aiResponse.integration_requirements || null,
          // Legacy format (backwards compatibility)
          has_workflow_preview: aiResponse.has_workflow,
          workflow_preview_json: aiResponse.workflow_data ? {
            ...aiResponse.workflow_data,
            steps: aiResponse.workflow_steps || aiResponse.workflow_data.steps || []
          } : null,
          workflow_version: aiResponse.has_workflow ? 1 : null,
          has_action_buttons: aiResponse.has_action_buttons,
          action_buttons: aiResponse.action_buttons,
          has_duplicate_alert: aiResponse.has_duplicate_alert || false,
          duplicate_data: aiResponse.duplicate_data || null,
        };
        
        const savedAiMessage = await flowforgeAPI.addMessage(conversation.id, aiMessage);
        setMessages((prev) => [...prev, savedAiMessage]);
        
        // Update conversation with tool name if workflow was generated
        if (aiResponse.workflow_data?.suggested_name && toolName === "Untitled") {
          const newName = aiResponse.workflow_data.suggested_name;
          setToolName(newName);
          await flowforgeAPI.updateConversation(conversation.id, { 
            tool_name: newName,
            description: aiResponse.workflow_data.description,
            systems_used: aiResponse.workflow_data.systems_used || [],
            trigger_type: aiResponse.workflow_data.trigger_type,
            trigger_description: aiResponse.workflow_data.trigger_description,
          });
        }
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        // Fallback message if AI fails
        const fallbackMessage = {
          id: `fallback-${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble processing your request right now. Please try again in a moment.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle tool name update
  const handleNameUpdate = async () => {
    if (!conversation) return;
    
    try {
      await flowforgeAPI.updateConversation(conversation.id, { tool_name: toolName });
      setIsEditingName(false);
      toast.success("Tool name updated");
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("Failed to update name");
    }
  };

  // Handle action button clicks (Submit for Approval, Make Changes, etc.)
  const handleActionClick = async (action, message) => {
    if (action === "submit_approval") {
      try {
        setSending(true);
        
        // Get workflow data from the message
        const workflowData = message.workflow_preview_json || {};
        
        // Create approval request
        const approvalData = {
          conversation_id: conversation.id,
          request_type: "new_tool",
          tool_name: toolName !== "Untitled" ? toolName : workflowData.tool_name || "Untitled Tool",
          request_summary: workflowData.description || `New automation tool for ${UNIT_NAMES[unit] || unit}`,
          request_details: {
            steps: workflowData.steps || [],
            trigger_type: workflowData.trigger_type,
            trigger_description: workflowData.trigger_description,
            systems_used: workflowData.systems_used || [],
            estimated_impact: workflowData.estimated_impact,
          },
          proposed_workflow_json: workflowData,
          impact_assessment: {
            risk: "LOW",
            estimated_impact: workflowData.estimated_impact || "Pending assessment",
          },
        };
        
        await flowforgeAPI.createApproval(approvalData);
        
        // Add system message
        const systemMessage = await flowforgeAPI.addMessage(conversation.id, {
          role: "assistant",
          content: `Great! I've submitted "${approvalData.tool_name}" for admin approval. You'll be notified once it's reviewed.\n\nIn the meantime, you can continue refining the tool or start building another one.`,
        });
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Update conversation status
        await flowforgeAPI.updateConversation(conversation.id, { 
          status: "pending_approval",
          tool_name: approvalData.tool_name,
        });
        setConversation(prev => ({ ...prev, status: "pending_approval" }));
        
        toast.success("Submitted for approval!");
      } catch (error) {
        console.error("Failed to submit for approval:", error);
        toast.error("Failed to submit for approval");
      } finally {
        setSending(false);
      }
    } else if (action === "request_changes") {
      // Add a prompt for the user to describe changes
      const changeMessage = await flowforgeAPI.addMessage(conversation.id, {
        role: "assistant",
        content: "Sure! What changes would you like to make? Describe what you'd like to modify and I'll update the workflow accordingly.",
      });
      setMessages(prev => [...prev, changeMessage]);
    } else if (action === "use_existing") {
      // User wants to use the existing similar tool
      const duplicateData = message.duplicate_data;
      const existingTool = duplicateData?.strongest_match;
      
      const confirmMessage = await flowforgeAPI.addMessage(conversation.id, {
        role: "assistant",
        content: `Great! "${existingTool?.name}" is already available and ${existingTool?.is_active ? 'actively running' : 'deployed'}. You can find it in your unit's tools section.\n\nIs there anything else you'd like to build?`,
      });
      setMessages(prev => [...prev, confirmMessage]);
      
      // Update conversation to resolved
      await flowforgeAPI.updateConversation(conversation.id, { 
        status: "archived",
        description: `Resolved - matched to existing tool: ${existingTool?.name}`,
      });
      setConversation(prev => ({ ...prev, status: "archived" }));
      
    } else if (action === "request_update") {
      // User wants to update the existing tool
      const duplicateData = message.duplicate_data;
      const existingTool = duplicateData?.strongest_match;
      
      const updateMessage = await flowforgeAPI.addMessage(conversation.id, {
        role: "assistant",
        content: `Got it! What changes would you like to make to "${existingTool?.name}"? Describe the modifications and I'll prepare an update request for admin approval.`,
      });
      setMessages(prev => [...prev, updateMessage]);
      
    } else if (action === "build_new") {
      // User confirms they want to build something new despite similar tools
      const buildMessage = await flowforgeAPI.addMessage(conversation.id, {
        role: "assistant",
        content: "Understood! Let's build something new. Can you give me more details about what you need? I'll make sure it's distinct from the existing tools.",
      });
      setMessages(prev => [...prev, buildMessage]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C64FF] mx-auto mb-4" />
          <p className="text-gray-500">Loading FlowForge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white rounded-xl shadow-sm border border-gray-100" data-testid="flowforge-chat">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link 
            to={`/${unit}`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            data-testid="back-to-unit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to {UNIT_NAMES[unit] || unit}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Editable Tool Name */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Tool:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="h-8 w-48"
                  onBlur={handleNameUpdate}
                  onKeyPress={(e) => e.key === "Enter" && handleNameUpdate()}
                  autoFocus
                  data-testid="tool-name-input"
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-medium text-gray-800 hover:text-[#7C64FF] transition-colors flex items-center gap-1"
                data-testid="tool-name-display"
              >
                {toolName}
                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Status Badge */}
          <StatusBadge status={conversation?.status || "building"} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLastMessage={index === messages.length - 1}
            onActionClick={handleActionClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-100">
        {/* Voice Recorder Overlay */}
        {showVoiceRecorder && (
          <div className="mb-4">
            <VoiceRecorder
              onTranscriptionComplete={(text, duration) => {
                setInputValue(prev => prev ? `${prev}\n\n[Voice]: ${text}` : text);
                setShowVoiceRecorder(false);
                // Focus the input
                inputRef.current?.focus();
              }}
              onCancel={() => setShowVoiceRecorder(false)}
              disabled={isSending}
            />
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or click the mic to record..."
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7C64FF]/20 focus:border-[#7C64FF] transition-all min-h-[48px] max-h-[200px]"
              rows={1}
              disabled={isSending || showVoiceRecorder}
              data-testid="chat-input"
            />
          </div>

          {/* Voice Recording Button */}
          <Button
            variant="outline"
            size="icon"
            className={`h-12 w-12 rounded-xl transition-all ${
              showVoiceRecorder 
                ? "bg-red-50 border-red-200 text-red-500" 
                : "hover:bg-[#7C64FF]/10 hover:border-[#7C64FF]/50"
            }`}
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            disabled={isSending}
            data-testid="voice-record-btn"
          >
            {showVoiceRecorder ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* Attachment Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={() => toast.info("Attachments coming soon!")}
            disabled={showVoiceRecorder}
            data-testid="attachment-btn"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending || showVoiceRecorder}
            className="h-12 px-6 rounded-xl bg-[#7C64FF] hover:bg-[#6B55E0] text-white"
            data-testid="send-message-btn"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line • Click mic to record voice
        </p>
      </div>
    </div>
  );
};

export default FlowForgeChat;
