from uagents import Agent, Context
from shared_models import SectionTask, SectionResponse
import json
from google import genai
import os

# ---------------------------------------
# Initialize Gemini client (NEW SDK)
# ---------------------------------------
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

DESIGN_SEED = "design-seed-123"

design_agent = Agent(
    name="design_agent",
    port=8001,
    seed=DESIGN_SEED,
    endpoint=["http://localhost:8001/submit"]
)

@design_agent.on_message(model=SectionTask)
async def handle_design(ctx: Context, sender: str, msg: SectionTask):
    if msg.section != "design":
        return

    prompt = f"""
    You are a fashion techpack assistant.
    Output ONLY valid JSON.

    Generate the DESIGN OVERVIEW section for the following garment:

    "{msg.garment_brief}"

    Required JSON keys:
    - style_description
    - silhouette
    - fit
    - intended_use
    - key_features (list)
    """

    # ---------------------------------------
    # Call Gemini Flash (NEW API)
    # ---------------------------------------
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )

    content = response.text

    # ---------------------------------------
    # Parse JSON safely
    # ---------------------------------------
    try:
        json_result = json.loads(content)
    except Exception:
        json_result = {"error": "Invalid JSON", "raw": content}

    # ---------------------------------------
    # Return answer
    # ---------------------------------------
    await ctx.send(sender, SectionResponse(section="design", content=json_result))


if __name__ == "__main__":
    design_agent.run()

