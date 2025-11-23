import base64
from uagents import Agent, Context
from shared_models import TechpackRequest
from uagents.setup import fund_agent_if_low

SENDER_SEED = "sender-seed"

ORCHESTRATOR_ADDR = "agent1qdr5m7hdppy5ljqlwdh8vpn0sd0kd0tvs9rxkgwu2zuwz82xe025jjzw20m"

sender = Agent(
    name="sender",
    port=8015,
    seed=SENDER_SEED,
    endpoint=["http://localhost:8015/submit"]
)

# Load SVG -> base64
def load_svg_as_b64(path="test.svg"):
    with open(path, "r") as f:
        svg_text = f.read()
    return base64.b64encode(svg_text.encode("utf-8")).decode("utf-8")


@sender.on_interval(period=3.0)
async def send_once(ctx: Context):
    svg_b64 = load_svg_as_b64("test.svg")

    req = TechpackRequest(
        garment_brief="Hoodie",
        template_image_b64=svg_b64
    )

    await ctx.send(ORCHESTRATOR_ADDR, req)
    ctx.logger.info("Sent SVG techpack request!")

    # send only once
    ctx.storage.set("sent", True)


@sender.on_message(model=TechpackRequest)
async def stop_after_send(ctx: Context, sender: str, msg: TechpackRequest):
    if ctx.storage.get("sent"):
        ctx.logger.info("Stopping sender now.")
        raise SystemExit


if __name__ == "__main__":
    fund_agent_if_low(sender.wallet.address())
    sender.run()
