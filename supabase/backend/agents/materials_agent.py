from uagents import Agent, Context
from shared_models import SectionTask, SectionResponse
import json
import os
from google import genai

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MATERIALS_SEED = "materials-seed-123"

# Create agent with Agentverse mailbox
materials_agent = Agent(
    name="materials_agent",
    port=8002,
    seed=MATERIALS_SEED,
    # endpoint=["http://localhost:8002/submit"],
    mailbox=f"{os.getenv('AGENTVERSE_API_KEY')}@https://agentverse.ai" if os.getenv('AGENTVERSE_API_KEY') else None
)


@materials_agent.on_message(model=SectionTask)
async def handle_materials(ctx: Context, sender: str, msg: SectionTask):
    """
    Generate materials section for tech pack
    """
    if msg.section != "materials":
        ctx.logger.warning(f"Received non-materials section request: {msg.section}")
        return

    ctx.logger.info(f"🧵 Generating materials section for: {msg.garment_brief[:50]}...")

    prompt = f"""
    You are a fashion techpack materials specialist.
    Output ONLY valid JSON.

    Create the MATERIALS section for this garment:

    "{msg.garment_brief}"

    Required JSON keys:
    - shell_fabric
    - lining_fabric
    - trims (list)
    - hardware (list)
    """

    try:
        # Call Gemini 2.0 Flash
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
        )

        content = response.text

        # Safe JSON parsing
        try:
            # Remove markdown code blocks if present
            json_str = content
            if '```json' in content:
                json_str = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                json_str = content.split('```')[1].split('```')[0].strip()
            
            json_result = json.loads(json_str)
            ctx.logger.info(f"✅ Materials section generated successfully")
            
        except json.JSONDecodeError as e:
            ctx.logger.error(f"Failed to parse JSON: {e}")
            json_result = {"error": "Invalid JSON", "raw": content}

        # Send result back to orchestrator
        await ctx.send(
            sender,
            SectionResponse(section="materials", content=json_result)
        )

    except Exception as e:
        ctx.logger.error(f"❌ Error generating materials section: {e}")
        await ctx.send(
            sender,
            SectionResponse(section="materials", content={"error": str(e)})
        )


@materials_agent.on_rest_get("/health", response=dict)
async def health_check(ctx: Context):
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent": "materials_agent",
        "port": 8002,
        "agentverse_connected": bool(os.getenv('AGENTVERSE_API_KEY')),
        "gemini_configured": bool(os.getenv('GEMINI_API_KEY'))
    }


@materials_agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info(f"🚀 Materials Agent started")
    ctx.logger.info(f"📍 Agent address: {ctx.agent.address}")
    if os.getenv('AGENTVERSE_API_KEY'):
        ctx.logger.info(f"🌐 Agentverse mailbox: ENABLED")
    else:
        ctx.logger.warning(f"⚠️  Agentverse mailbox: DISABLED (no API key)")
    if os.getenv('GEMINI_API_KEY'):
        ctx.logger.info(f"🤖 Gemini API: CONFIGURED")
    else:
        ctx.logger.error(f"❌ Gemini API: NOT CONFIGURED")
    ctx.logger.info(f"🔗 Local endpoint: http://localhost:8002")


if __name__ == "__main__":
    materials_agent.run()