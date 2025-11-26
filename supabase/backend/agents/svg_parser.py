from uagents import Agent, Context
from shared_models import SVGParseTask, SVGParseResult
import base64
import re
from xml.etree import ElementTree as ET
import os

SVG_SEED = "svg-parse-seed-123"

# Create agent with Agentverse mailbox
svg_agent = Agent(
    name="svg_parse_agent",
    port=8003,
    seed=SVG_SEED,
    endpoint=["http://localhost:8003/submit"],
    mailbox=f"{os.getenv('AGENTVERSE_API_KEY')}@https://agentverse.ai" if os.getenv('AGENTVERSE_API_KEY') else None
)


def parse_svg(svg_text: str) -> dict:
    """
    Enhanced SVG parser that extracts detailed design features
    """
    try:
        # Parse XML
        root = ET.fromstring(svg_text)
        
        # Define SVG namespace
        ns = {'svg': 'http://www.w3.org/2000/svg'}
        
        # Count elements
        paths = len(root.findall('.//svg:path', ns)) + len(root.findall('.//path'))
        rects = len(root.findall('.//svg:rect', ns)) + len(root.findall('.//rect'))
        circles = len(root.findall('.//svg:circle', ns)) + len(root.findall('.//circle'))
        ellipses = len(root.findall('.//svg:ellipse', ns)) + len(root.findall('.//ellipse'))
        polygons = len(root.findall('.//svg:polygon', ns)) + len(root.findall('.//polygon'))
        lines = len(root.findall('.//svg:line', ns)) + len(root.findall('.//line'))
        groups = len(root.findall('.//svg:g', ns)) + len(root.findall('.//g'))
        texts = len(root.findall('.//svg:text', ns)) + len(root.findall('.//text'))
        
        # Extract colors using regex (more reliable for various SVG formats)
        fill_colors = set()
        stroke_colors = set()
        
        fill_matches = re.findall(r'fill="([^"]+)"', svg_text)
        for color in fill_matches:
            if color not in ['none', 'transparent'] and not color.startswith('url('):
                fill_colors.add(color)
        
        stroke_matches = re.findall(r'stroke="([^"]+)"', svg_text)
        for color in stroke_matches:
            if color not in ['none', 'transparent'] and not color.startswith('url('):
                stroke_colors.add(color)
        
        # Extract dimensions
        width = root.get('width', 'unknown')
        height = root.get('height', 'unknown')
        viewbox = root.get('viewBox', '')
        
        if width == 'unknown' and viewbox:
            viewbox_values = viewbox.split()
            if len(viewbox_values) == 4:
                width = viewbox_values[2]
                height = viewbox_values[3]
        
        # Analyze complexity
        total_elements = paths + rects + circles + ellipses + polygons + lines
        
        if total_elements > 100:
            complexity = 'highly detailed'
        elif total_elements > 50:
            complexity = 'moderately complex'
        elif total_elements > 20:
            complexity = 'detailed'
        else:
            complexity = 'simple'
        
        # Estimate silhouette
        silhouette = 'unknown'
        if width != 'unknown' and height != 'unknown':
            try:
                w = float(re.sub(r'[^\d.]', '', width))
                h = float(re.sub(r'[^\d.]', '', height))
                if w > 0:
                    aspect_ratio = h / w
                    if aspect_ratio > 2.0:
                        silhouette = 'full-length dress or gown'
                    elif aspect_ratio > 1.5:
                        silhouette = 'dress or long top'
                    elif aspect_ratio > 1.2:
                        silhouette = 'standard top or shirt'
                    elif aspect_ratio > 0.8:
                        silhouette = 'boxy top or jacket'
                    else:
                        silhouette = 'wide garment or pants'
            except (ValueError, ZeroDivisionError):
                pass
        
        # Detect garment features
        garment_features = []
        svg_lower = svg_text.lower()
        
        if 'pocket' in svg_lower or rects > 10:
            garment_features.append('pockets')
        if circles > 5 or 'button' in svg_lower:
            garment_features.append('buttons or closures')
        if groups > 15:
            garment_features.append('complex construction details')
        if texts > 0:
            garment_features.append('text or branding elements')
        if lines > 20:
            garment_features.append('stitching or seam details')
        
        return {
            "element_counts": {
                "paths": paths,
                "rectangles": rects,
                "circles": circles,
                "ellipses": ellipses,
                "polygons": polygons,
                "lines": lines,
                "groups": groups,
                "texts": texts,
                "total": total_elements
            },
            "colors": {
                "fills": list(fill_colors)[:10],
                "strokes": list(stroke_colors)[:10],
                "color_count": len(fill_colors) + len(stroke_colors)
            },
            "canvas": {
                "width": width,
                "height": height
            },
            "complexity": complexity,
            "estimated_silhouette": silhouette,
            "detected_features": garment_features,
            "detail_level": "high" if total_elements > 50 else "medium" if total_elements > 20 else "low"
        }
        
    except Exception as e:
        print(f"SVG parsing error: {e}")
        return {
            "element_counts": {"total": 0},
            "colors": {"fills": [], "strokes": [], "color_count": 0},
            "canvas": {"width": "unknown", "height": "unknown"},
            "complexity": "unknown",
            "estimated_silhouette": "unknown",
            "detected_features": [],
            "detail_level": "unknown",
            "error": str(e)
        }


@svg_agent.on_message(model=SVGParseTask)
async def handle_svg_parse(ctx: Context, sender: str, msg: SVGParseTask):
    """
    Receives base64-encoded SVG, parses it, and returns structured features
    """
    ctx.logger.info(f"📊 Received SVG parse request from {sender}")
    
    try:
        # Decode base64 SVG
        svg_text = base64.b64decode(msg.svg_b64).decode('utf-8')
        
        # Parse SVG
        features = parse_svg(svg_text)
        
        ctx.logger.info(f"✅ SVG parsed: {features['element_counts']['total']} elements, "
                       f"{features['complexity']} complexity")
        
        # Send response back
        await ctx.send(
            sender,
            SVGParseResult(features=features)
        )
        
    except Exception as e:
        ctx.logger.error(f"❌ SVG parsing failed: {e}")
        await ctx.send(
            sender,
            SVGParseResult(features={"error": str(e)})
        )


@svg_agent.on_rest_get("/health", response=dict)
async def health_check(ctx: Context):
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent": "svg_parse_agent",
        "port": 8003,
        "agentverse_connected": bool(os.getenv('AGENTVERSE_API_KEY'))
    }


@svg_agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info(f"🚀 SVG Parse Agent started")
    ctx.logger.info(f"📍 Agent address: {ctx.agent.address}")
    if os.getenv('AGENTVERSE_API_KEY'):
        ctx.logger.info(f"🌐 Agentverse mailbox: ENABLED")
    else:
        ctx.logger.warning(f"⚠️  Agentverse mailbox: DISABLED (no API key)")
    ctx.logger.info(f"🔗 Local endpoint: http://localhost:8003")


if __name__ == "__main__":
    svg_agent.run()