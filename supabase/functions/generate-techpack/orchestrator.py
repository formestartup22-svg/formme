from uagents import Agent, Context
from shared_models import (
    TechpackRequest,
    SectionTask,
    SectionResponse,
    SVGParseTask,
    SVGParseResult,
)
from uagents.setup import fund_agent_if_low

ORCHESTRATOR_SEED = "orchestrator-seed-123"

orchestrator = Agent(
    name="orchestrator",
    port=8000,
    seed=ORCHESTRATOR_SEED,
    endpoint=["http://localhost:8000/submit"]
)

# Worker agent addresses — update to your deployed addresses
SVG_AGENT_ADDR = "agent1qt5rewclmdwfppnfe2y2yym0fe0gf8j6u3lhrzqnvqvx4qqc3wjsypxvehj"        
DESIGN_AGENT_ADDR = "agent1qwfqgcpc9uzghapujdcfty96tuk8dkzn3egk86eed50tx6gh8ks2wu3lw2r" 
MATERIALS_AGENT_ADDR = "agent1qg7pg74wqr0pwp37ryzn88vw4xdqxdm69ssjt9jganlcpjx7gc3euqw3eut"


# ============================================================
# STEP 1 — Handle Incoming User Request
# ============================================================
@orchestrator.on_message(model=TechpackRequest)
async def handle_request(ctx: Context, sender: str, msg: TechpackRequest):

    # Prevent duplicates
    if ctx.storage.get("state") not in [None, "idle"]:
        ctx.logger.info("Ignoring duplicate request — already processing.")
        return

    ctx.logger.info(f"Received techpack request from sender: {sender}")

    ctx.storage.set("state", "waiting_svg")
    ctx.storage.set("original_sender", sender)
    ctx.storage.set("garment_brief", msg.garment_brief)
    ctx.storage.set("template_svg", msg.template_image_b64)

    # --- Send SVG to SVG Parser Agent ---
    svg_task = SVGParseTask(
        svg_b64=msg.template_image_b64,
        garment_brief=msg.garment_brief
    )
    await ctx.send(SVG_AGENT_ADDR, svg_task)


# ============================================================
# STEP 2 — Collect SVG Parser Output
# ============================================================
@orchestrator.on_message(model=SVGParseResult)
async def handle_svg_result(ctx: Context, sender: str, msg: SVGParseResult):

    ctx.logger.info("[Orchestrator] Received SVG parser output")

    ctx.storage.set("svg_features", msg.features)

    # Now dispatch design + materials agents
    garment_brief = ctx.storage.get("garment_brief")
    svg_features = msg.features
    svg_b64 = ctx.storage.get("template_svg")

    # --- DESIGN TASK ---
    design_task = SectionTask(
        section="design",
        garment_brief=garment_brief,
        template_image_b64=svg_b64,
        svg_features=svg_features
    )
    await ctx.send(DESIGN_AGENT_ADDR, design_task)

    # --- MATERIALS TASK ---
    materials_task = SectionTask(
        section="materials",
        garment_brief=garment_brief,
        template_image_b64=svg_b64,
        svg_features=svg_features
    )
    await ctx.send(MATERIALS_AGENT_ADDR, materials_task)

    ctx.storage.set("pending_sections", 2)
    ctx.storage.set("results", {})
    ctx.storage.set("state", "waiting_agents")


# ============================================================
# STEP 3 — Collect Worker Agent Responses
# ============================================================
@orchestrator.on_message(model=SectionResponse)
async def collect_responses(ctx: Context, sender: str, msg: SectionResponse):

    state = ctx.storage.get("state")
    if state != "waiting_agents":
        return

    ctx.logger.info(f"[Orchestrator] Received section: {msg.section}")

    results = ctx.storage.get("results") or {}
    results[msg.section] = msg.content
    ctx.storage.set("results", results)

    pending = ctx.storage.get("pending_sections")
    pending -= 1
    ctx.storage.set("pending_sections", pending)

    # Complete
    if pending == 0:
        final = {
            "garment_brief": ctx.storage.get("garment_brief"),
            "svg_features": ctx.storage.get("svg_features"),
            "sections": ctx.storage.get("results")
        }

        ctx.logger.info("🎉 Techpack complete!")
        ctx.logger.info(str(final))

        # Reset state so new requests can be processed
        ctx.storage.set("state", "idle")


# ============================================================
if __name__ == "__main__":
    fund_agent_if_low(orchestrator.wallet.address())
    orchestrator.run()
