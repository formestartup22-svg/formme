import base64
import requests
from pydantic import BaseModel

SVG_AGENT_URL = "http://localhost:8003/submit"
DESIGN_AGENT_URL = "http://localhost:8001/submit"
MATERIALS_AGENT_URL = "http://localhost:8002/submit"


# ------------------------------
# MODELS MATCHING AGENTS EXACTLY
# ------------------------------
class OrchestrationRequest(BaseModel):
    garment_brief: str
    svg_b64: str


class SVGParseTask(BaseModel):
    svg_b64: str
    garment_brief: str


class SectionTask(BaseModel):
    section: str
    garment_brief: str
    template_image_b64: str
    svg_features: dict


# ------------------------------
# GENERIC AGENT CALL (HTTP)
# ------------------------------
def call_agent(url: str, payload_model: BaseModel):
    """
    Send a model to a uAgents HTTP endpoint.
    """

    message = {
        "type": payload_model.__class__.__name__,  # REQUIRED
        "data": payload_model.dict()               # MUST be dict
    }

    try:
        response = requests.post(url, json=message)
        response.raise_for_status()
        return response.json()

    except Exception as e:
        raise RuntimeError(f"Agent at {url} failed: {e}")


# ------------------------------
# ORCHESTRATION PIPELINE
# ------------------------------
async def run_orchestration(req: OrchestrationRequest):
    garment_brief = req.garment_brief
    svg_b64 = req.svg_b64

    # 1) VERIFY SVG INPUT
    try:
        # If it's raw XML → convert to base64
        if svg_b64.strip().startswith("<svg") or svg_b64.strip().startswith("<?xml"):
            svg_b64 = base64.b64encode(svg_b64.encode()).decode()

        # If it's base64 → decode to ensure valid
        base64.b64decode(svg_b64)

    except Exception:
        raise ValueError("design_image_url must be URL or base64 SVG")

    # ------------------------------
    # 2) CALL SVG PARSER AGENT
    # ------------------------------
    svg_task = SVGParseTask(svg_b64=svg_b64, garment_brief=garment_brief)
    svg_response_json = call_agent(SVG_AGENT_URL, svg_task)

    svg_features = svg_response_json.get("features", {})

    # ------------------------------
    # 3) CALL DESIGN AGENT
    # ------------------------------
    design_task = SectionTask(
        section="design",
        garment_brief=garment_brief,
        template_image_b64=svg_b64,
        svg_features=svg_features
    )

    design_response_json = call_agent(DESIGN_AGENT_URL, design_task)
    design_section = design_response_json.get("content", "")

    # ------------------------------
    # 4) CALL MATERIALS AGENT
    # ------------------------------
    materials_task = SectionTask(
        section="materials",
        garment_brief=garment_brief,
        template_image_b64=svg_b64,
        svg_features=svg_features
    )

    materials_response_json = call_agent(MATERIALS_AGENT_URL, materials_task)
    materials_section = materials_response_json.get("content", "")

    # ------------------------------
    # 5) RETURN EVERYTHING
    # ------------------------------
    return svg_features, design_section, materials_section
