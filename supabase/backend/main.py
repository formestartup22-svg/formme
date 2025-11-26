from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.services.orchestrator import run_orchestration, OrchestrationRequest
from backend.services.pdf_generator import generate_pdf
from backend.services.markdown import build_markdown

import base64
import logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI(debug=True)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

# ---------------------------
# Pydantic Models
# ---------------------------
from pydantic import BaseModel
from typing import List, Dict, Optional

class Header(BaseModel):
    styleName: str
    styleNumber: str
    category: str
    season: str
    createdBy: str
    brand: str

class TechPackDraft(BaseModel):
    header: Header
    designOverview: Dict
    materials: Dict
    measurements: List[Dict]
    fabricSpecs: List[Dict]
    constructionNotes: str
    designImageUrl: Optional[str] = None

class FinalizeRequest(BaseModel):
    draft: TechPackDraft


# ----------------------------------------------------
# 1️⃣  FULL TECH PACK (used by your older Supabase workflow)
# ----------------------------------------------------
@app.post("/generate-techpack")
async def generate_techpack(garment_brief: str, design_image_url: str = "", measurements: list = [], fabric_specs: list = []):
    try:
        req = OrchestrationRequest(
            garment_brief=garment_brief,
            design_image_url=design_image_url
        )

        svg_features, design_section, materials_section = await run_orchestration(req)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {e}")

    markdown = build_markdown(
        garment_brief=garment_brief,
        design_section=design_section,
        materials_section=materials_section,
        measurements=measurements,
        fabric_specs=fabric_specs,
        svg_features=svg_features,
    )

    pdf_bytes = generate_pdf(markdown, design_image_url)
    pdf_b64 = base64.b64encode(pdf_bytes).decode()

    return {
        "markdown": markdown,
        "pdf": pdf_b64,
        "sections": {
            "svg": svg_features,
            "design": design_section,
            "materials": materials_section
        }
    }


# ----------------------------------------------------
# 2️⃣  DRAFT CREATION ENDPOINT
# ----------------------------------------------------
@app.post("/techpack/draft")
async def generate_techpack_draft(payload: dict):
    print("🔥 Received draft payload:", payload)

    req = OrchestrationRequest(
        garment_brief=payload["garment_brief"],
        svg_b64=payload["svg_b64"]
    )

    svg_features, design_section, materials_section = await run_orchestration(req)

    return {
        "svg_features": svg_features,
        "designSection": design_section,
        "materialsSection": materials_section
    }



# ----------------------------------------------------
# 3️⃣ FINALIZE ENDPOINT
# ----------------------------------------------------
@app.post("/techpack/finalize")
async def finalize_techpack(req: FinalizeRequest):
    draft = req.draft

    garment_brief_text = f"""
Design Name: {draft.header.styleName}
Style Number: {draft.header.styleNumber}
Category: {draft.header.category}
Brand: {draft.header.brand}
Season: {draft.header.season}

Measurements:
{chr(10).join(f"- {m['name']}: {m['value']}" for m in draft.measurements)}

Fabric Specifications:
{chr(10).join(f"- {f['type']}: {f['details']}" for f in draft.fabricSpecs)}

Construction Notes:
{draft.constructionNotes}
"""

    markdown = build_markdown(
        garment_brief=garment_brief_text,
        design_section=draft.designOverview,
        materials_section=draft.materials,
        measurements=draft.measurements,
        fabric_specs=draft.fabricSpecs,
        svg_features={},  # fill later
    )

    pdf_bytes = generate_pdf(markdown, draft.designImageUrl)
    pdf_b64 = base64.b64encode(pdf_bytes).decode()

    return {
        "markdown": markdown,
        "pdfData": pdf_b64
    }
