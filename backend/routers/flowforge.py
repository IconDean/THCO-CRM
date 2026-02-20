"""
FlowForge - AI-Powered Workflow Automation Builder
Handles conversations, workflow generation, and approvals via Supabase (PostgreSQL)
"""

from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import logging
import httpx
import tempfile
from supabase import create_client, Client

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("Supabase credentials not found in environment variables")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    logger.info("Supabase client initialized successfully")

# n8n configuration
N8N_BASE_URL = os.environ.get('N8N_BASE_URL', '')
N8N_API_KEY = os.environ.get('N8N_API_KEY', '')

# Create router with prefix
router = APIRouter(prefix="/flowforge", tags=["FlowForge"])

# ==================== PYDANTIC MODELS ====================

class ConversationCreate(BaseModel):
    unit: str
    tool_name: Optional[str] = None

class ConversationUpdate(BaseModel):
    tool_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class ConversationResponse(BaseModel):
    id: str
    tool_name: Optional[str]
    description: Optional[str]
    unit: str
    tags: List[str]
    status: str
    created_by: str
    created_by_name: str
    created_by_email: Optional[str]
    engine_workflow_id: Optional[str]
    workflow_version: int
    trigger_type: Optional[str]
    trigger_description: Optional[str]
    systems_used: List[str]
    execution_count: int
    success_count: int
    error_count: int
    last_execution_at: Optional[str]
    created_at: str
    updated_at: str

class MessageCreate(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    has_voice: bool = False
    voice_url: Optional[str] = None
    voice_duration_seconds: Optional[int] = None
    voice_transcription: Optional[str] = None
    has_workflow_preview: bool = False
    workflow_preview_json: Optional[Dict[str, Any]] = None
    workflow_version: Optional[int] = None
    has_action_buttons: bool = False
    action_buttons: Optional[List[Dict[str, Any]]] = None
    has_duplicate_alert: bool = False
    duplicate_data: Optional[Dict[str, Any]] = None
    has_integration_check: bool = False
    integration_check_data: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    has_voice: bool
    voice_url: Optional[str]
    voice_duration_seconds: Optional[int]
    voice_transcription: Optional[str]
    has_workflow_preview: bool
    workflow_preview_json: Optional[Dict[str, Any]]
    workflow_version: Optional[int]
    has_action_buttons: bool
    action_buttons: Optional[List[Dict[str, Any]]]
    has_duplicate_alert: bool
    duplicate_data: Optional[Dict[str, Any]]
    has_integration_check: bool
    integration_check_data: Optional[Dict[str, Any]]
    message_index: int
    created_at: str

class ApprovalCreate(BaseModel):
    conversation_id: str
    request_type: str = Field(..., pattern="^(new_tool|update|activate|delete|move)$")
    tool_name: str
    request_summary: str
    request_details: Dict[str, Any]
    proposed_workflow_json: Optional[Dict[str, Any]] = None
    current_workflow_json: Optional[Dict[str, Any]] = None
    current_state: Optional[Dict[str, Any]] = None
    proposed_changes: Optional[Dict[str, Any]] = None
    impact_assessment: Optional[Dict[str, Any]] = None
    similar_tools_found: Optional[List[Dict[str, Any]]] = None

class ApprovalResponse(BaseModel):
    id: str
    conversation_id: str
    request_type: str
    requested_by: str
    requested_by_name: str
    unit: str
    tool_name: str
    request_summary: str
    request_details: Dict[str, Any]
    status: str
    decided_by: Optional[str]
    decided_by_name: Optional[str]
    decision_note: Optional[str]
    decided_at: Optional[str]
    created_at: str

class ApprovalAction(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|request_changes)$")
    note: Optional[str] = None

class AdminCreate(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    admin_type: str = Field(..., pattern="^(unit_admin|company_admin)$")
    unit: Optional[str] = None

class AdminResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    admin_type: str
    unit: Optional[str]
    assigned_by: str
    is_active: bool
    created_at: str

class IntegrationResponse(BaseModel):
    id: str
    display_name: str
    internal_type: str
    credential_name: Optional[str]
    status: str
    icon: Optional[str]
    last_verified_at: Optional[str]

class WorkflowInventoryResponse(BaseModel):
    id: str
    engine_workflow_id: str
    name: str
    description: Optional[str]
    nodes_summary: Optional[str]
    trigger_type: Optional[str]
    is_active: bool
    tags: List[str]
    unit: Optional[str]
    conversation_id: Optional[str]
    is_flowforge_created: bool
    last_synced_at: str

# ==================== HELPER FUNCTIONS ====================

def ensure_supabase():
    """Ensure Supabase client is initialized"""
    if not supabase:
        raise HTTPException(
            status_code=503, 
            detail="Database service unavailable. Please check configuration."
        )
    return supabase

async def get_current_user_from_request(request: Request) -> dict:
    """Import and use the existing auth function from server.py"""
    # Import here to avoid circular imports
    import sys
    sys.path.insert(0, '/app/backend')
    from server import get_current_user
    return await get_current_user(request)

def get_next_message_index(conversation_id: str) -> int:
    """Get the next message index for a conversation"""
    sb = ensure_supabase()
    result = sb.table('flowforge_messages').select('message_index').eq('conversation_id', conversation_id).order('message_index', desc=True).limit(1).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]['message_index'] + 1
    return 0

# ==================== CONVERSATION ROUTES ====================

@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    request: Request,
    unit: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List all conversations with optional filters"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    query = sb.table('flowforge_conversations').select('*')
    
    # Filter by unit if specified
    if unit:
        query = query.eq('unit', unit)
    
    # Filter by status if specified
    if status:
        query = query.eq('status', status)
    
    # For non-admins, only show their own conversations
    if user.get('role') not in ['super_admin', 'company_admin']:
        query = query.eq('created_by', user['user_id'])
    
    result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
    
    return result.data or []

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(data: ConversationCreate, request: Request):
    """Create a new FlowForge conversation"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    conversation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    conversation_doc = {
        'id': conversation_id,
        'tool_name': data.tool_name,
        'description': None,
        'unit': data.unit,
        'tags': [],
        'icon': 'default',
        'created_by': user['user_id'],
        'created_by_name': user['name'],
        'created_by_email': user.get('email'),
        'engine_workflow_id': None,
        'engine_workflow_url': None,
        'current_workflow_json': None,
        'workflow_version': 0,
        'status': 'building',
        'trigger_type': None,
        'trigger_description': None,
        'systems_used': [],
        'execution_count': 0,
        'success_count': 0,
        'error_count': 0,
        'last_execution_at': None,
        'last_error_message': None,
        'alert_on_failure': True,
        'alert_channels': ['slack'],
        'access_level': 'unit',
        'created_at': now,
        'updated_at': now,
        'deployed_at': None,
        'last_opened_at': now
    }
    
    result = sb.table('flowforge_conversations').insert(conversation_doc).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")
    
    return result.data[0]

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, request: Request):
    """Get a specific conversation by ID"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    result = sb.table('flowforge_conversations').select('*').eq('id', conversation_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = result.data[0]
    
    # Check access
    if user.get('role') not in ['super_admin', 'company_admin']:
        if conversation['created_by'] != user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Update last_opened_at
    sb.table('flowforge_conversations').update({
        'last_opened_at': datetime.now(timezone.utc).isoformat()
    }).eq('id', conversation_id).execute()
    
    return conversation

@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(conversation_id: str, data: ConversationUpdate, request: Request):
    """Update a conversation's metadata"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Check conversation exists
    existing = sb.table('flowforge_conversations').select('*').eq('id', conversation_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = existing.data[0]
    
    # Check access
    if user.get('role') not in ['super_admin', 'company_admin']:
        if conversation['created_by'] != user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Build update dict
    update_dict = {'updated_at': datetime.now(timezone.utc).isoformat()}
    if data.tool_name is not None:
        update_dict['tool_name'] = data.tool_name
    if data.description is not None:
        update_dict['description'] = data.description
    if data.status is not None:
        update_dict['status'] = data.status
    if data.tags is not None:
        update_dict['tags'] = data.tags
    
    result = sb.table('flowforge_conversations').update(update_dict).eq('id', conversation_id).execute()
    
    return result.data[0]

# ==================== MESSAGE ROUTES ====================

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(conversation_id: str, request: Request):
    """Get all messages for a conversation"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Check conversation exists and user has access
    conv_result = sb.table('flowforge_conversations').select('created_by').eq('id', conversation_id).execute()
    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conv_result.data[0]
    if user.get('role') not in ['super_admin', 'company_admin']:
        if conversation['created_by'] != user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    result = sb.table('flowforge_messages').select('*').eq('conversation_id', conversation_id).order('message_index').execute()
    
    return result.data or []

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def add_message(conversation_id: str, data: MessageCreate, request: Request):
    """Add a message to a conversation"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Check conversation exists and user has access
    conv_result = sb.table('flowforge_conversations').select('created_by').eq('id', conversation_id).execute()
    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conv_result.data[0]
    if user.get('role') not in ['super_admin', 'company_admin']:
        if conversation['created_by'] != user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    message_id = str(uuid.uuid4())
    message_index = get_next_message_index(conversation_id)
    now = datetime.now(timezone.utc).isoformat()
    
    message_doc = {
        'id': message_id,
        'conversation_id': conversation_id,
        'role': data.role,
        'content': data.content,
        'has_voice': data.has_voice,
        'voice_url': data.voice_url,
        'voice_duration_seconds': data.voice_duration_seconds,
        'voice_transcription': data.voice_transcription,
        'has_workflow_preview': data.has_workflow_preview,
        'workflow_preview_json': data.workflow_preview_json,
        'workflow_version': data.workflow_version,
        'has_action_buttons': data.has_action_buttons,
        'action_buttons': data.action_buttons,
        'has_duplicate_alert': data.has_duplicate_alert,
        'duplicate_data': data.duplicate_data,
        'has_integration_check': data.has_integration_check,
        'integration_check_data': data.integration_check_data,
        'has_execution_result': False,
        'execution_result': None,
        'message_index': message_index,
        'created_at': now
    }
    
    result = sb.table('flowforge_messages').insert(message_doc).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create message")
    
    # Update conversation's updated_at
    sb.table('flowforge_conversations').update({
        'updated_at': now
    }).eq('id', conversation_id).execute()
    
    return result.data[0]

# ==================== APPROVAL ROUTES ====================

@router.get("/approvals", response_model=List[ApprovalResponse])
async def list_approvals(
    request: Request,
    status: Optional[str] = None,
    unit: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List approval requests (filtered by admin permissions)"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    query = sb.table('flowforge_approvals').select('*')
    
    # Filter by status if specified
    if status:
        query = query.eq('status', status)
    
    # Filter by unit if specified
    if unit:
        query = query.eq('unit', unit)
    
    # For unit admins, only show their unit's requests
    if user.get('role') not in ['super_admin', 'company_admin']:
        # Check if user is a unit admin
        admin_result = sb.table('flowforge_admins').select('*').eq('user_id', user['user_id']).eq('is_active', True).execute()
        if admin_result.data:
            admin = admin_result.data[0]
            if admin['admin_type'] == 'unit_admin':
                query = query.eq('unit', admin['unit'])
            # company_admin can see all
        else:
            # Not an admin, only show their own requests
            query = query.eq('requested_by', user['user_id'])
    
    result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
    
    return result.data or []

@router.post("/approvals", response_model=ApprovalResponse)
async def create_approval(data: ApprovalCreate, request: Request):
    """Create a new approval request"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Get conversation to get unit
    conv_result = sb.table('flowforge_conversations').select('unit').eq('id', data.conversation_id).execute()
    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    unit = conv_result.data[0]['unit']
    approval_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    approval_doc = {
        'id': approval_id,
        'conversation_id': data.conversation_id,
        'request_type': data.request_type,
        'requested_by': user['user_id'],
        'requested_by_name': user['name'],
        'unit': unit,
        'tool_name': data.tool_name,
        'request_summary': data.request_summary,
        'request_details': data.request_details,
        'current_state': data.current_state,
        'proposed_changes': data.proposed_changes,
        'impact_assessment': data.impact_assessment,
        'similar_tools_found': data.similar_tools_found,
        'proposed_workflow_json': data.proposed_workflow_json,
        'current_workflow_json': data.current_workflow_json,
        'status': 'pending',
        'decided_by': None,
        'decided_by_name': None,
        'decision_note': None,
        'decided_at': None,
        'admin_notified': False,
        'reminder_sent': False,
        'reminder_sent_at': None,
        'created_at': now,
        'updated_at': now
    }
    
    result = sb.table('flowforge_approvals').insert(approval_doc).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create approval request")
    
    # Update conversation status
    sb.table('flowforge_conversations').update({
        'status': 'pending_approval',
        'updated_at': now
    }).eq('id', data.conversation_id).execute()
    
    return result.data[0]

@router.get("/approvals/stats")
async def get_approval_stats(request: Request):
    """Get approval queue statistics"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    # Count by status
    pending = sb.table('flowforge_approvals').select('id', count='exact').eq('status', 'pending').execute()
    approved = sb.table('flowforge_approvals').select('id', count='exact').eq('status', 'approved').execute()
    rejected = sb.table('flowforge_approvals').select('id', count='exact').eq('status', 'rejected').execute()
    changes_requested = sb.table('flowforge_approvals').select('id', count='exact').eq('status', 'changes_requested').execute()
    
    return {
        "pending": pending.count or 0,
        "approved": approved.count or 0,
        "rejected": rejected.count or 0,
        "changes_requested": changes_requested.count or 0,
        "total": (pending.count or 0) + (approved.count or 0) + (rejected.count or 0) + (changes_requested.count or 0)
    }

@router.get("/approvals/{approval_id}", response_model=ApprovalResponse)
async def get_approval(approval_id: str, request: Request):
    """Get a specific approval request"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    result = sb.table('flowforge_approvals').select('*').eq('id', approval_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    return result.data[0]

@router.post("/approvals/{approval_id}/action")
async def process_approval_action(approval_id: str, data: ApprovalAction, request: Request):
    """Process an approval action (approve/reject/request_changes)"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Check admin permissions
    is_admin = user.get('role') in ['super_admin', 'company_admin']
    if not is_admin:
        admin_result = sb.table('flowforge_admins').select('*').eq('user_id', user['user_id']).eq('is_active', True).execute()
        if not admin_result.data:
            raise HTTPException(status_code=403, detail="Only admins can process approvals")
    
    # Get approval
    approval_result = sb.table('flowforge_approvals').select('*').eq('id', approval_id).execute()
    if not approval_result.data:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    approval = approval_result.data[0]
    
    if approval['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Approval has already been processed")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Map action to status
    status_map = {
        'approve': 'approved',
        'reject': 'rejected',
        'request_changes': 'changes_requested'
    }
    
    # Update approval
    update_doc = {
        'status': status_map[data.action],
        'decided_by': user['user_id'],
        'decided_by_name': user['name'],
        'decision_note': data.note,
        'decided_at': now,
        'updated_at': now
    }
    
    sb.table('flowforge_approvals').update(update_doc).eq('id', approval_id).execute()
    
    # Update conversation status based on action
    conv_status_map = {
        'approve': 'deployed',
        'reject': 'building',
        'request_changes': 'changes_requested'
    }
    
    conv_update = {
        'status': conv_status_map[data.action],
        'updated_at': now
    }
    
    if data.action == 'approve':
        conv_update['deployed_at'] = now
    
    sb.table('flowforge_conversations').update(conv_update).eq('id', approval['conversation_id']).execute()
    
    return {
        "message": f"Approval {data.action}d successfully",
        "approval_id": approval_id,
        "status": status_map[data.action]
    }

# ==================== ADMIN ROUTES ====================

@router.get("/admins", response_model=List[AdminResponse])
async def list_admins(request: Request):
    """List all FlowForge admins"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Only super_admin or company_admin can see all admins
    if user.get('role') not in ['super_admin', 'company_admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = sb.table('flowforge_admins').select('*').eq('is_active', True).execute()
    
    return result.data or []

@router.post("/admins", response_model=AdminResponse)
async def add_admin(data: AdminCreate, request: Request):
    """Add a new FlowForge admin"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Only super_admin can add admins
    if user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admins can add admins")
    
    # Check if user is already an admin for this unit
    existing = sb.table('flowforge_admins').select('*').eq('user_id', data.user_id).eq('unit', data.unit).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User is already an admin for this unit")
    
    admin_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    admin_doc = {
        'id': admin_id,
        'user_id': data.user_id,
        'user_name': data.user_name,
        'user_email': data.user_email,
        'admin_type': data.admin_type,
        'unit': data.unit if data.admin_type == 'unit_admin' else None,
        'assigned_by': user['user_id'],
        'is_active': True,
        'created_at': now
    }
    
    result = sb.table('flowforge_admins').insert(admin_doc).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to add admin")
    
    return result.data[0]

@router.delete("/admins/{admin_id}")
async def remove_admin(admin_id: str, request: Request):
    """Remove a FlowForge admin"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Only super_admin can remove admins
    if user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admins can remove admins")
    
    # Soft delete
    result = sb.table('flowforge_admins').update({'is_active': False}).eq('id', admin_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"message": "Admin removed successfully"}

@router.get("/admins/for-unit/{unit}", response_model=List[AdminResponse])
async def get_unit_admins(unit: str, request: Request):
    """Get admins for a specific unit"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    # Get unit admins + company admins
    unit_admins = sb.table('flowforge_admins').select('*').eq('unit', unit).eq('is_active', True).execute()
    company_admins = sb.table('flowforge_admins').select('*').eq('admin_type', 'company_admin').eq('is_active', True).execute()
    
    all_admins = (unit_admins.data or []) + (company_admins.data or [])
    
    # Remove duplicates
    seen = set()
    unique_admins = []
    for admin in all_admins:
        if admin['id'] not in seen:
            seen.add(admin['id'])
            unique_admins.append(admin)
    
    return unique_admins

# ==================== INTEGRATION ROUTES ====================

@router.get("/integrations", response_model=List[IntegrationResponse])
async def list_integrations(request: Request):
    """List all available integrations and their status"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    result = sb.table('flowforge_integrations').select('*').execute()
    
    return result.data or []

@router.post("/integrations/check")
async def check_integrations(request: Request, integration_types: List[str]):
    """Check if specific integrations are available"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    result = sb.table('flowforge_integrations').select('*').in_('internal_type', integration_types).execute()
    
    # Build response with status for each requested type
    status_map = {}
    for integration in (result.data or []):
        status_map[integration['internal_type']] = {
            'display_name': integration['display_name'],
            'status': integration['status'],
            'icon': integration['icon']
        }
    
    # Add 'not_found' for missing integrations
    for itype in integration_types:
        if itype not in status_map:
            status_map[itype] = {
                'display_name': itype,
                'status': 'not_found',
                'icon': None
            }
    
    return status_map

@router.post("/integrations/sync")
async def sync_integrations(request: Request):
    """Sync integration status from n8n"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    if user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admins can sync integrations")
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        raise HTTPException(status_code=503, detail="n8n configuration not available")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{N8N_BASE_URL}/api/v1/credentials",
                headers={"X-N8N-API-KEY": N8N_API_KEY},
                timeout=30
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to fetch credentials from automation engine")
            
            credentials = response.json().get('data', [])
            
            # Update integration statuses
            now = datetime.now(timezone.utc).isoformat()
            for cred in credentials:
                # Try to update existing or insert new
                sb.table('flowforge_integrations').upsert({
                    'internal_type': cred.get('type', ''),
                    'display_name': cred.get('name', cred.get('type', '')),
                    'credential_name': cred.get('name', ''),
                    'status': 'connected',
                    'last_verified_at': now,
                    'updated_at': now
                }, on_conflict='internal_type').execute()
            
            return {"message": f"Synced {len(credentials)} credentials from automation engine"}
    
    except httpx.RequestError as e:
        logger.error(f"Failed to sync integrations: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to automation engine")

# ==================== WORKFLOW INVENTORY ROUTES ====================

@router.get("/inventory", response_model=List[WorkflowInventoryResponse])
async def list_workflow_inventory(
    request: Request,
    unit: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """List all workflows in the inventory"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    query = sb.table('flowforge_workflow_inventory').select('*')
    
    if unit:
        query = query.eq('unit', unit)
    
    result = query.order('name').range(offset, offset + limit - 1).execute()
    
    return result.data or []

@router.post("/inventory/sync")
async def sync_workflow_inventory(request: Request):
    """Sync workflow inventory from n8n"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        raise HTTPException(status_code=503, detail="n8n configuration not available")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{N8N_BASE_URL}/api/v1/workflows",
                headers={"X-N8N-API-KEY": N8N_API_KEY},
                timeout=30
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to fetch workflows from automation engine")
            
            workflows = response.json().get('data', [])
            now = datetime.now(timezone.utc).isoformat()
            
            synced_count = 0
            for wf in workflows:
                # Extract node types
                nodes = wf.get('nodes', [])
                node_types = list(set([n.get('type', '') for n in nodes]))
                nodes_summary = ', '.join(node_types[:10])  # Limit to first 10
                
                # Determine trigger type
                trigger_type = None
                for node in nodes:
                    if 'trigger' in node.get('type', '').lower():
                        trigger_type = node.get('type', '')
                        break
                
                # Handle case where meta might be None
                meta = wf.get('meta') or {}
                
                inventory_doc = {
                    'engine_workflow_id': wf.get('id', ''),
                    'name': wf.get('name', 'Untitled'),
                    'description': meta.get('description', '') if isinstance(meta, dict) else '',
                    'nodes_summary': nodes_summary,
                    'trigger_type': trigger_type,
                    'is_active': wf.get('active', False),
                    'tags': [t.get('name', '') for t in (wf.get('tags') or [])],
                    'is_flowforge_created': False,  # Will be updated if linked to conversation
                    'last_synced_at': now,
                    'engine_created_at': wf.get('createdAt'),
                    'engine_updated_at': wf.get('updatedAt')
                }
                
                # Upsert by engine_workflow_id
                sb.table('flowforge_workflow_inventory').upsert(
                    inventory_doc, 
                    on_conflict='engine_workflow_id'
                ).execute()
                synced_count += 1
            
            return {"message": f"Synced {synced_count} workflows from automation engine"}
    
    except httpx.RequestError as e:
        logger.error(f"Failed to sync inventory: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to automation engine")

@router.post("/inventory/search")
async def search_inventory(request: Request, query: str, limit: int = 10):
    """Search workflow inventory for similar workflows"""
    await get_current_user_from_request(request)  # Ensure authenticated
    sb = ensure_supabase()
    
    # Simple text search - in production, this would use semantic similarity
    result = sb.table('flowforge_workflow_inventory').select('*').or_(
        f"name.ilike.%{query}%,description.ilike.%{query}%,nodes_summary.ilike.%{query}%"
    ).limit(limit).execute()
    
    return result.data or []

# ==================== AI GENERATION ROUTES ====================

class GenerateRequest(BaseModel):
    conversation_id: str
    message: str
    include_history: bool = True
    check_duplicates: bool = True

class GenerateResponse(BaseModel):
    content: str
    has_workflow: bool = False
    workflow_data: Optional[Dict[str, Any]] = None
    has_action_buttons: bool = False
    action_buttons: Optional[List[Dict[str, Any]]] = None
    has_duplicate_alert: bool = False
    duplicate_data: Optional[Dict[str, Any]] = None

@router.post("/generate", response_model=GenerateResponse)
async def generate_workflow(data: GenerateRequest, request: Request):
    """Generate AI response for workflow building"""
    user = await get_current_user_from_request(request)
    sb = ensure_supabase()
    
    # Get conversation
    conv_result = sb.table('flowforge_conversations').select('*').eq('id', data.conversation_id).execute()
    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conv_result.data[0]
    
    # Check access
    if user.get('role') not in ['super_admin', 'company_admin']:
        if conversation['created_by'] != user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Import AI service
        from services.flowforge_ai import generate_ai_response
        
        # Get conversation history if needed
        history = []
        is_first_message = True
        if data.include_history:
            msg_result = sb.table('flowforge_messages').select('role,content').eq('conversation_id', data.conversation_id).order('message_index').execute()
            history = msg_result.data or []
            # Check if this is the first user message
            # Note: The current user message may already be saved before calling generate,
            # so we check if there are 0 or 1 user messages (1 being the current one)
            user_messages = [m for m in history if m['role'] == 'user']
            is_first_message = len(user_messages) <= 1
        
        # Generate AI response
        response = await generate_ai_response(
            conversation_id=data.conversation_id,
            unit=conversation['unit'],
            user_message=data.message,
            conversation_history=history,
            tool_status=conversation['status'],
            execution_count=conversation.get('execution_count', 0),
            last_error=conversation.get('last_error_message'),
            check_duplicates=data.check_duplicates,
            is_first_message=is_first_message
        )
        
        return response
    
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

# ==================== HEALTH CHECK ====================

@router.get("/health")
async def health_check():
    """Health check for FlowForge service"""
    status = {
        "status": "healthy",
        "supabase": "connected" if supabase else "disconnected",
        "n8n": "configured" if N8N_BASE_URL and N8N_API_KEY else "not_configured"
    }
    
    # Test Supabase connection
    if supabase:
        try:
            supabase.table('flowforge_conversations').select('id').limit(1).execute()
        except Exception as e:
            status["supabase"] = f"error: {str(e)}"
            status["status"] = "degraded"
    
    return status

# ==================== VOICE TRANSCRIPTION ====================

class TranscriptionResponse(BaseModel):
    text: str
    duration_seconds: Optional[float] = None
    language: Optional[str] = None

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    request: Request,
    audio: UploadFile = File(...)
):
    """
    Transcribe audio file to text using OpenAI Whisper
    Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm (max 25MB)
    """
    await get_current_user_from_request(request)  # Ensure authenticated
    
    # Validate file type
    allowed_types = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/x-m4a']
    allowed_extensions = ['.webm', '.wav', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a']
    
    file_ext = os.path.splitext(audio.filename or '')[1].lower()
    
    if audio.content_type not in allowed_types and file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (25MB limit)
    contents = await audio.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large. Maximum size is 25MB.")
    
    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        from dotenv import load_dotenv
        load_dotenv()
        
        EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=503, detail="Voice processing service not configured")
        
        # Initialize the STT service
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        
        # Create a temporary file for the audio
        suffix = file_ext if file_ext else '.webm'
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        try:
            # Transcribe the audio
            with open(tmp_path, 'rb') as audio_file:
                response = await stt.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    response_format="verbose_json",
                    language="en"  # Default to English, could be made configurable
                )
            
            # Extract duration if available
            duration = None
            if hasattr(response, 'duration'):
                duration = response.duration
            
            return TranscriptionResponse(
                text=response.text,
                duration_seconds=duration,
                language="en"
            )
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except ImportError as e:
        logger.error(f"Missing dependency for transcription: {e}")
        raise HTTPException(status_code=503, detail="Voice processing service unavailable")
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")

