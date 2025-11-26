# backend/services/orchestrator.py

import base64
import requests
from pydantic import BaseModel
from typing import Any, Dict


# -------------------------------------------------------------------
# Agent URLs — match your running agents
# -------------------------------------------------------------------
SVG_AGENT_URL = "http://localhost:8003/submit"
DESIGN_AGENT_URL = "http://localhost:8001/submit"
MATERIALS_AGENT_URL = "http://localhost:8002/submit"


# -------------------------------------------------------------------
# Incoming Request Model
# -------------------------------------------------------------------
class OrchestrationRequest(BaseModel):
    garment_brief: str
    svg_b64: str   # cleaned + always base64


# -------------------------------------------------------------------
# HELPER: Send HTTP message to uAgents
# -------------------------------------------------------------------
def call_agent(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls a uAgent HTTP endpoint using requests.post and returns JSON.
    """

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise RuntimeError(f"Agent at {url} failed: {e}")


# -------------------------------------------------------------------
# HELPER: Normalize raw SVG into base64
# -------------------------------------------------------------------
def normalize_svg(svg_input: str) -> str:
    """
    Supports:
    - Raw <svg> XML string
    - Base64 encoded SVG
    - URL pointing to an SVG file
    """
    svg_input = svg_input.strip()

    # Case 1: It is the raw XML SVG text itself
    if svg_input.startswith("<svg") or svg_input.startswith("<?xml"):
        return base64.b64encode(svg_input.encode()).decode()

    # Case 2: It is already base64
    try:
        decoded = base64.b64decode(svg_input)
        decoded.decode("utf-8")    # validate string
        return svg_input           # it is VALID base64 SVG
    except Exception:
        pass  # Not base64 → try next

    # Case 3: It is a URL
    if svg_input.startswith("http://") or svg_input.startswith("https://"):
        try:
            remote = requests.get(svg_input)
            remote.raise_for_status()
            xml = remote.text
            return base64.b64encode(xml.encode()).decode()
        except Exception:
            raise ValueError("Could not fetch SVG from URL")

    raise ValueError("Invalid SVG input — must be raw XML, base64, or URL")


# -------------------------------------------------------------------
# MAIN ORCHESTRATION PIPELINE
# -------------------------------------------------------------------
async def run_orchestration(req: OrchestrationRequest):
    """
    Executes: SVG → DESIGN → MATERIALS
    Returns: svg_features, design_section, materials_section
    """

    # Normalize SVG input
    svg_b64 = normalize_svg(req.svg_b64)

    # -----------------------------------------------------------
    # 1. CALL SVG PARSER AGENT
    # -----------------------------------------------------------
    svg_payload = {
        "svg_b64": svg_b64,
        "garment_brief": req.garment_brief
    }

    svg_response = call_agent(SVG_AGENT_URL, svg_payload)

    svg_features = svg_response.get("features")
    if svg_features is None:
        raise ValueError("SVG agent returned no features")

    # -----------------------------------------------------------
    # 2. CALL DESIGN AGENT
    # -----------------------------------------------------------
    design_payload = {
        "section": "design",
        "garment_brief": req.garment_brief,
        "template_image_b64": svg_b64,
        "svg_features": svg_features
    }

    design_response = call_agent(DESIGN_AGENT_URL, design_payload)

    design_section = design_response.get("content")
    if design_section is None:
        raise ValueError("Design agent returned no content")

    # -----------------------------------------------------------
    # 3. CALL MATERIALS AGENT
    # -----------------------------------------------------------
    materials_payload = {
        "section": "materials",
        "garment_brief": req.garment_brief,
        "template_image_b64": svg_b64,
        "svg_features": svg_features
    }

    materials_response = call_agent(MATERIALS_AGENT_URL, materials_payload)

    materials_section = materials_response.get("content")
    if materials_section is None:
        raise ValueError("Materials agent returned no content")

    # -----------------------------------------------------------
    # 4. DONE: return all three results
    # -----------------------------------------------------------
    return svg_features, design_section, materials_section
