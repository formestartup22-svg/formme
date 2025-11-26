from uagents import Model

class TechpackRequest(Model):
    garment_brief: str
    template_image_b64: str | None = None  # optional for now

class SectionTask(Model):
    section: str              # "design" or "materials"
    garment_brief: str
    template_image_b64: str | None = None

class SectionResponse(Model):
    section: str
    content: dict            # structured output from each agent


class SVGParseTask(Model):
    svg_b64: str  # SVG content encoded as base64
    garment_brief: str = ""  # optional, helpful for context


class SVGParseResult(Model):
    features: dict  # extracted structured JSON
