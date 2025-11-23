from uagents import Agent, Context
from shared_models import SectionTask, SectionResponse
import json
import os
from google import genai  

# -----------------------------
# Initialize Gemini client
# -----------------------------
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MATERIALS_SEED = "materials-seed-123"

materials_agent = Agent(
    name="materials_agent",
    port=8002,
    seed=MATERIALS_SEED,
    endpoint=["http://localhost:8002/submit"]
)


@materials_agent.on_message(model=SectionTask)
async def handle_materials(ctx: Context, sender: str, msg: SectionTask):
    if msg.section != "materials":
        return

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

    # -----------------------------
    # Call Gemini 2.5 Flash
    # -----------------------------
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
    )

    content = response.text

    # -----------------------------
    # Safe JSON parsing
    # -----------------------------
    try:
        json_result = json.loads(content)
    except Exception:
        json_result = {"error": "Invalid JSON", "raw": content}

    # -----------------------------
    # Send result back to orchestrator
    # -----------------------------
    await ctx.send(
        sender,
        SectionResponse(section="materials", content=json_result)
    )


if __name__ == "__main__":
    materials_agent.run()
