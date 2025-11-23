import base64
import xml.etree.ElementTree as ET
from uagents import Agent, Context
from shared_models import SVGParseTask, SVGParseResult

SVG_SEED = "svg-parser-seed"

svg_agent = Agent(
    name="svg_parser_agent",
    port=8003,
    seed=SVG_SEED,
    endpoint=["http://localhost:8003/submit"]
)


def extract_svg_features(svg_text: str) -> dict:
    # parse SVG XML
    try:
        root = ET.fromstring(svg_text)
    except Exception as e:
        return {"error": f"Could not parse SVG: {e}"}

    SVG_NS = "{http://www.w3.org/2000/svg}"

    paths = root.findall(f".//{SVG_NS}path")
    rects = root.findall(f".//{SVG_NS}rect")
    groups = root.findall(f".//{SVG_NS}g")
    texts = root.findall(f".//{SVG_NS}text")

    # -----------------------------------------------
    # Basic object counts
    # -----------------------------------------------
    path_count = len(paths)
    rect_count = len(rects)
    group_count = len(groups)
    text_count = len(texts)

    # -----------------------------------------------
    # Extract bounding boxes (if width/height exist)
    # -----------------------------------------------
    width = root.get("width")
    height = root.get("height")

    # fallback: check viewBox
    view_box = root.get("viewBox")
    if view_box:
        vb_parts = view_box.split()
        if len(vb_parts) == 4:
            width = width or vb_parts[2]
            height = height or vb_parts[3]

    # convert to numeric if possible
    try:
        width = float(width) if width else None
        height = float(height) if height else None
    except:
        width = height = None

    # -----------------------------------------------
    # Silhouette estimation heuristics
    # -----------------------------------------------
    silhouette = "unknown"

    if height and width:
        aspect_ratio = height / width
        # very tall: dresses
        if aspect_ratio > 1.8:
            silhouette = "dress-like"
        # moderate: tops/tees
        elif 1.2 < aspect_ratio <= 1.8:
            silhouette = "top"
        # wide shapes: jackets or boxy tops
        else:
            silhouette = "boxy top"

    # -----------------------------------------------
    # Neckline detection heuristic
    # (based on vertical movement in the first path)
    # -----------------------------------------------
    neckline = "unknown"

    if len(paths) > 0:
        d = paths[0].get("d", "")
        # crude heuristic: look for large downward curve commands
        if "C" in d or "c" in d:
            neckline = "curved"
        if "V" in d or "v" in d:
            neckline = "deep"
        if "L" in d or "l" in d:
            neckline = "straight"

    # -----------------------------------------------
    # Detect possible straps
    # -----------------------------------------------
    straps_present = False
    for r in rects:
        # narrow tall rectangles near top might be straps
        try:
            w = float(r.get("width", 0))
            h = float(r.get("height", 0))
            if h > 2 * w:  # tall + narrow
                straps_present = True
        except:
            pass

    # -----------------------------------------------
    # Detect logos by text or labeled group
    # -----------------------------------------------
    logo_present = False

    for t in texts:
        txt = "".join(t.itertext()).strip().lower()
        if "logo" in txt:
            logo_present = True

    for g in groups:
        gid = g.get("id", "").lower()
        if "logo" in gid:
            logo_present = True

    # -----------------------------------------------
    # Final JSON structure
    # -----------------------------------------------
    features = {
        "object_counts": {
            "paths": path_count,
            "rectangles": rect_count,
            "groups": group_count,
            "texts": text_count,
        },
        "canvas": {
            "width": width,
            "height": height,
        },
        "estimated_silhouette": silhouette,
        "neckline": neckline,
        "straps_present": straps_present,
        "logo_detected": logo_present,
    }

    return features


@svg_agent.on_message(model=SVGParseTask)
async def handle_svg(ctx: Context, sender: str, msg: SVGParseTask):
    ctx.logger.info(f"[SVG Parser] Received SVG for processing from: {sender}")

    # Decode base64 SVG
    try:
        svg_text = base64.b64decode(msg.svg_b64).decode("utf-8")
    except Exception as e:
        await ctx.send(
            sender,
            SVGParseResult(features={"error": f"Could not decode SVG: {e}"})
        )
        return

    # Extract features
    features = extract_svg_features(svg_text)

    await ctx.send(
        sender,
        SVGParseResult(features=features)
    )


if __name__ == "__main__":
    svg_agent.run()
