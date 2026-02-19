"""
FlowForge AI Service
Uses Emergent LLM integration for workflow generation with Claude
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Get API key from environment
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# FlowForge System Prompt
FLOWFORGE_SYSTEM_PROMPT = """You are FlowForge, THCO's internal automation builder. You live inside thcoteam.com 
and help team members build, deploy, and maintain automations through natural conversation.

## YOUR PERSONALITY
- Conversational, competent, helpful
- You're a colleague, not a robot
- You ask smart clarifying questions (2-3 max at a time) but don't over-ask
- You generate workflows as soon as you have enough info
- When a user returns, you greet naturally and show current tool status
- You own mistakes and fix them quickly

## CRITICAL RULES

### NEVER Expose Underlying Technology
- NEVER say "n8n" — say "THCO automation engine" or just "automation engine"
- NEVER say "n8n workflow" — say "automation" or "tool"
- NEVER say "n8n node" — say "step" or "action"
- NEVER say "n8n credential" — say "service connection" or "integration"
- NEVER say "Claude" or "Anthropic" — say "AI" or "AI text generation"
- NEVER say "Supabase" to the user — say "database" or "THCO database"
- NEVER say "Deepgram" or "Whisper" — say "voice processing"
- NEVER expose JSON, API details, or technical architecture to end users
- The user sees: FlowForge, THCO Automation Engine, and friendly integration names

### Integration Display Names
Use ONLY these user-facing names:
- Database Access (not Supabase/PostgreSQL)
- Email Sending (Gmail)
- Calendar Access (Google Calendar)
- Spreadsheet Access (Google Sheets)
- Team Notifications (Slack)
- WhatsApp Messaging
- LinkedIn Integration
- AI Text Generation
- Voice Processing
- External API Connection
- Scheduled Automation

### Approval Flow
- NEVER deploy directly. Always say "submit for approval"
- After generating a workflow, offer: "Submit for Approval" or "Make Changes"
- When approval is received, post the decision in the conversation

### CONVERSATION FLOW ORDER
1. User describes problem
2. Ask for tool name if not provided
3. Ask clarifying questions (2-3 max)
4. Generate workflow
5. Show preview with steps
6. Offer: "Submit for Approval" or "Make Changes"

## OUTPUT FORMAT FOR WORKFLOW
When generating a workflow, respond with a JSON block like this (embedded in your response):

```workflow
{
  "tool_name": "Suggested Tool Name",
  "description": "What this tool does",
  "trigger_type": "scheduled|manual|webhook",
  "trigger_description": "e.g., Daily at 9:00 AM",
  "systems_used": ["Database Access", "Email Sending", "AI Text Generation"],
  "steps": [
    {"step_number": 1, "name": "Step Name", "description": "What this step does"},
    {"step_number": 2, "name": "Step Name", "description": "What this step does"}
  ],
  "estimated_impact": "~5-15 emails per day"
}
```

Always wrap workflow JSON in ```workflow ... ``` blocks so it can be parsed.
"""

class FlowForgeAI:
    """FlowForge AI Service using Emergent LLM integration"""
    
    def __init__(self, conversation_id: str, unit: str):
        self.conversation_id = conversation_id
        self.unit = unit
        
        if not EMERGENT_LLM_KEY:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        # Initialize the LLM chat with Claude
        self.chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"flowforge-{conversation_id}",
            system_message=FLOWFORGE_SYSTEM_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    async def send_message(
        self, 
        user_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to the AI and get a response
        
        Args:
            user_message: The user's message
            context: Optional context including conversation history, tool status, etc.
        
        Returns:
            Dict containing the AI response and any extracted workflow data
        """
        try:
            # Build the message with context
            full_message = self._build_context_message(user_message, context)
            
            # Create user message
            message = UserMessage(text=full_message)
            
            # Send to AI
            response = await self.chat.send_message(message)
            
            # Parse the response for any workflow JSON
            workflow_data = self._extract_workflow_data(response)
            
            return {
                "content": response,
                "has_workflow": workflow_data is not None,
                "workflow_data": workflow_data,
                "has_action_buttons": workflow_data is not None,
                "action_buttons": self._get_action_buttons(workflow_data) if workflow_data else None
            }
        
        except Exception as e:
            logger.error(f"FlowForge AI error: {e}")
            raise
    
    def _build_context_message(
        self, 
        user_message: str, 
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Build the full message with context"""
        parts = []
        
        if context:
            # Add unit context
            if "unit" in context:
                parts.append(f"[Building for unit: {context['unit']}]")
            
            # Add tool status if returning to conversation
            if context.get("tool_status"):
                parts.append(f"[Current tool status: {context['tool_status']}]")
            
            # Add execution history if available
            if context.get("execution_summary"):
                parts.append(f"[Recent executions: {context['execution_summary']}]")
            
            # Add any errors
            if context.get("last_error"):
                parts.append(f"[Last error: {context['last_error']}]")
        
        parts.append(user_message)
        
        return "\n".join(parts)
    
    def _extract_workflow_data(self, response: str) -> Optional[Dict[str, Any]]:
        """Extract workflow JSON from the response"""
        try:
            # Look for ```workflow ... ``` blocks
            import re
            pattern = r'```workflow\s*([\s\S]*?)\s*```'
            match = re.search(pattern, response)
            
            if match:
                workflow_json = match.group(1).strip()
                return json.loads(workflow_json)
            
            return None
        except json.JSONDecodeError:
            logger.warning("Failed to parse workflow JSON from response")
            return None
    
    def _get_action_buttons(self, workflow_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate action buttons for workflow preview"""
        return [
            {
                "label": "Submit for Approval",
                "action": "submit_approval",
                "primary": True,
                "icon": "check"
            },
            {
                "label": "Make Changes",
                "action": "request_changes",
                "primary": False,
                "icon": "edit"
            }
        ]


async def generate_ai_response(
    conversation_id: str,
    unit: str,
    user_message: str,
    conversation_history: List[Dict[str, Any]] = None,
    tool_status: str = None,
    execution_count: int = 0,
    last_error: str = None
) -> Dict[str, Any]:
    """
    High-level function to generate an AI response for FlowForge
    
    Args:
        conversation_id: The conversation ID
        unit: The business unit
        user_message: The user's message
        conversation_history: Previous messages in the conversation
        tool_status: Current status of the tool
        execution_count: Number of times the tool has run
        last_error: Last error message if any
    
    Returns:
        Dict containing the AI response and metadata
    """
    ai = FlowForgeAI(conversation_id, unit)
    
    context = {
        "unit": unit,
        "tool_status": tool_status,
        "execution_count": execution_count,
        "last_error": last_error
    }
    
    if execution_count > 0:
        context["execution_summary"] = f"{execution_count} executions"
    
    response = await ai.send_message(user_message, context)
    
    return response
