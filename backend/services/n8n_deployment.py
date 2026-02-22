"""
n8n Deployment Service
Creates and manages workflows in n8n via their REST API
"""

import os
import json
import logging
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

N8N_BASE_URL = os.environ.get('N8N_BASE_URL', '')
N8N_API_KEY = os.environ.get('N8N_API_KEY', '')


def get_n8n_headers() -> Dict[str, str]:
    """Get headers for n8n API requests"""
    return {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": N8N_API_KEY
    }


def map_trigger_to_n8n_node(trigger_type: str, trigger_description: str = None) -> Dict[str, Any]:
    """Map our trigger type to an n8n trigger node"""
    
    if trigger_type == "scheduled":
        # Parse schedule from description if possible
        return {
            "parameters": {
                "rule": {
                    "interval": [{"field": "hours", "hoursInterval": 24}]
                }
            },
            "id": "trigger-node",
            "name": "Schedule Trigger",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [0, 0]
        }
    elif trigger_type == "webhook":
        return {
            "parameters": {
                "httpMethod": "POST",
                "path": "flowforge-webhook",
                "responseMode": "onReceived",
                "responseData": "allEntries"
            },
            "id": "trigger-node",
            "name": "Webhook Trigger",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2,
            "position": [0, 0]
        }
    else:  # manual
        return {
            "parameters": {},
            "id": "trigger-node",
            "name": "Manual Trigger",
            "type": "n8n-nodes-base.manualTrigger",
            "typeVersion": 1,
            "position": [0, 0]
        }


def map_step_to_n8n_node(step: Dict[str, Any], index: int) -> Dict[str, Any]:
    """Map a workflow step to an n8n node"""
    
    step_name = step.get('name', f'Step {index + 1}')
    step_type = step.get('type', 'action')
    integration = step.get('integration', '').lower() if step.get('integration') else ''
    description = step.get('description', '')
    
    # Position nodes in a horizontal line
    x_pos = (index + 1) * 250
    y_pos = 0
    
    # Default to a "Set" node that passes data through with a note
    node = {
        "parameters": {
            "mode": "manual",
            "duplicateItem": False,
            "assignments": {
                "assignments": [
                    {
                        "id": f"step-{index + 1}",
                        "name": "step_description",
                        "value": description,
                        "type": "string"
                    }
                ]
            }
        },
        "id": f"step-{index + 1}",
        "name": step_name,
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.4,
        "position": [x_pos, y_pos],
        "notes": description
    }
    
    # Map specific integrations to n8n node types
    if 'email' in integration or 'gmail' in integration:
        node["type"] = "n8n-nodes-base.gmail"
        node["typeVersion"] = 2.1
        node["parameters"] = {
            "operation": "send",
            "sendTo": "={{ $json.email }}",
            "subject": "={{ $json.subject }}",
            "message": "={{ $json.message }}"
        }
    elif 'slack' in integration:
        node["type"] = "n8n-nodes-base.slack"
        node["typeVersion"] = 2.2
        node["parameters"] = {
            "operation": "post",
            "channel": "={{ $json.channel }}",
            "text": "={{ $json.message }}"
        }
    elif 'database' in integration or 'supabase' in integration:
        node["type"] = "n8n-nodes-base.postgres"
        node["typeVersion"] = 2.5
        node["parameters"] = {
            "operation": "select",
            "query": "-- Query placeholder"
        }
    elif 'spreadsheet' in integration or 'sheet' in integration:
        node["type"] = "n8n-nodes-base.googleSheets"
        node["typeVersion"] = 4.5
        node["parameters"] = {
            "operation": "read"
        }
    elif 'ai' in integration or 'text generation' in integration:
        node["type"] = "@n8n/n8n-nodes-langchain.openAi"
        node["typeVersion"] = 1.2
        node["parameters"] = {
            "model": "gpt-4",
            "prompt": "={{ $json.prompt }}"
        }
    elif 'http' in integration or 'api' in integration:
        node["type"] = "n8n-nodes-base.httpRequest"
        node["typeVersion"] = 4.2
        node["parameters"] = {
            "method": "GET",
            "url": "={{ $json.url }}"
        }
    elif step_type == "condition":
        node["type"] = "n8n-nodes-base.if"
        node["typeVersion"] = 2
        node["parameters"] = {
            "conditions": {
                "options": {
                    "caseSensitive": True,
                    "leftValue": "",
                    "typeValidation": "strict"
                },
                "conditions": []
            }
        }
    elif step_type == "loop":
        node["type"] = "n8n-nodes-base.splitInBatches"
        node["typeVersion"] = 3
        node["parameters"] = {
            "batchSize": 10
        }
    
    return node


def build_n8n_workflow(
    tool_name: str,
    description: str,
    workflow_steps: List[Dict[str, Any]],
    trigger_type: str = "manual",
    trigger_description: str = None,
    tags: List[str] = None,
    unit: str = None
) -> Dict[str, Any]:
    """
    Build a complete n8n workflow JSON from our workflow definition
    """
    
    nodes = []
    connections = {}
    
    # Add trigger node
    trigger_node = map_trigger_to_n8n_node(trigger_type, trigger_description)
    nodes.append(trigger_node)
    
    # Add step nodes
    prev_node_name = trigger_node["name"]
    for i, step in enumerate(workflow_steps):
        node = map_step_to_n8n_node(step, i)
        nodes.append(node)
        
        # Connect to previous node
        if prev_node_name not in connections:
            connections[prev_node_name] = {"main": [[]]}
        
        connections[prev_node_name]["main"][0].append({
            "node": node["name"],
            "type": "main",
            "index": 0
        })
        
        prev_node_name = node["name"]
    
    # Build the workflow object with ONLY required fields
    # n8n API rejects extra properties like tags, meta, staticData
    workflow = {
        "name": f"[FlowForge] {tool_name}",
        "nodes": nodes,
        "connections": connections,
        "settings": {
            "executionOrder": "v1"
        }
    }
    
    return workflow


async def create_n8n_workflow(
    tool_name: str,
    description: str,
    workflow_steps: List[Dict[str, Any]],
    trigger_type: str = "manual",
    trigger_description: str = None,
    tags: List[str] = None,
    unit: str = None
) -> Dict[str, Any]:
    """
    Create a workflow in n8n via their API
    
    Returns:
        Dict with workflow_id, workflow_url, and status
    """
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        logger.warning("n8n credentials not configured")
        return {
            "success": False,
            "error": "n8n credentials not configured",
            "workflow_id": None,
            "workflow_url": None
        }
    
    # Build the workflow JSON
    workflow_json = build_n8n_workflow(
        tool_name=tool_name,
        description=description,
        workflow_steps=workflow_steps,
        trigger_type=trigger_type,
        trigger_description=trigger_description,
        tags=tags,
        unit=unit
    )
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{N8N_BASE_URL}/api/v1/workflows",
                headers=get_n8n_headers(),
                json=workflow_json
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                workflow_id = result.get('id')
                
                logger.info(f"Created n8n workflow: {workflow_id}")
                
                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "workflow_url": f"{N8N_BASE_URL}/workflow/{workflow_id}",
                    "workflow_name": result.get('name'),
                    "active": result.get('active', False)
                }
            else:
                error_msg = response.text
                logger.error(f"Failed to create n8n workflow: {response.status_code} - {error_msg}")
                
                return {
                    "success": False,
                    "error": f"n8n API error: {response.status_code}",
                    "error_detail": error_msg,
                    "workflow_id": None,
                    "workflow_url": None
                }
    
    except httpx.RequestError as e:
        logger.error(f"n8n connection error: {e}")
        return {
            "success": False,
            "error": f"Connection error: {str(e)}",
            "workflow_id": None,
            "workflow_url": None
        }
    except Exception as e:
        logger.error(f"Unexpected error creating n8n workflow: {e}")
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "workflow_id": None,
            "workflow_url": None
        }


async def activate_n8n_workflow(workflow_id: str, active: bool = True) -> Dict[str, Any]:
    """
    Activate or deactivate a workflow in n8n
    """
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        return {"success": False, "error": "n8n credentials not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Use PATCH to update workflow active status
            response = await client.patch(
                f"{N8N_BASE_URL}/api/v1/workflows/{workflow_id}",
                headers=get_n8n_headers(),
                json={"active": active}
            )
            
            if response.status_code in [200, 201]:
                return {"success": True, "active": active}
            else:
                return {
                    "success": False, 
                    "error": f"Failed to update workflow: {response.status_code}"
                }
    
    except Exception as e:
        logger.error(f"Error activating workflow: {e}")
        return {"success": False, "error": str(e)}


async def get_n8n_workflow(workflow_id: str) -> Optional[Dict[str, Any]]:
    """
    Get workflow details from n8n
    """
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{N8N_BASE_URL}/api/v1/workflows/{workflow_id}",
                headers=get_n8n_headers()
            )
            
            if response.status_code == 200:
                return response.json()
            return None
    
    except Exception as e:
        logger.error(f"Error getting workflow: {e}")
        return None


async def delete_n8n_workflow(workflow_id: str) -> Dict[str, Any]:
    """
    Delete a workflow from n8n
    """
    
    if not N8N_BASE_URL or not N8N_API_KEY:
        return {"success": False, "error": "n8n credentials not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.delete(
                f"{N8N_BASE_URL}/api/v1/workflows/{workflow_id}",
                headers=get_n8n_headers()
            )
            
            if response.status_code in [200, 204]:
                return {"success": True}
            else:
                return {
                    "success": False,
                    "error": f"Failed to delete workflow: {response.status_code}"
                }
    
    except Exception as e:
        logger.error(f"Error deleting workflow: {e}")
        return {"success": False, "error": str(e)}
