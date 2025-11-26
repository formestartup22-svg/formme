# backend/agents/caller_agent.py

import asyncio
from uagents import Agent, Bureau, Context, Model

from .shared_models import SVGParseTask, SVGParseResult, SectionTask, SectionResponse

REQUESTS = {}   # request_id → asyncio Future


class OrchestrationRequest(Model):
    request_id: str
    task: dict
    target: str
    response_model: str


class OrchestrationResponse(Model):
    request_id: str
    data: dict


caller = Agent(name="caller", seed="caller-seed")


@caller.on_message(model=OrchestrationResponse)
async def handle_response(ctx: Context, sender: str, msg: OrchestrationResponse):
    fut = REQUESTS.get(msg.request_id)
    if fut:
        fut.set_result(msg.data)

async def ask_agent(ctx: Context, req: OrchestrationRequest):
    future = asyncio.get_event_loop().create_future()
    REQUESTS[req.request_id] = future

    await ctx.send(req.target, req)
    result = await future
    del REQUESTS[req.request_id]
    return result

