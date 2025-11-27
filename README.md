# Welcome to Formme!

The key to turning your designs into a reality. 

**If you’re here for the technical breakdown, skip straight to our Fetch.ai implementation.**  
[Jump to Fetch.ai Implementation](#fetcha-i-implementation)

## Inspiration
We interviewed 30+ independent designers and emerging brands. Almost all of them said the same thing: “I can create… but I can’t produce.” Turning a sketch into a garment was slow, confusing, and disconnected — and that’s the problem we set out to solve.

## What it does
Formme helps designers go from idea to production by:

- Generating clear, structured tech packs
- Standardizing materials, measurements, and construction details
- Improving communication with manufacturers
- Keeping the whole workflow in one place

## How we built it
We combined:

- AI-driven parsing of sketches + design details
- A structured tech pack generator
- A matching algorithm to best match designers with their manufacturer
- Clean UI for better communication


## Challenges we ran into
Standardizing tech packs across different design styles Making a complex process feel simple Turning vague sketches into precise production details Designing a UX that doesn’t overwhelm new designers

## Accomplishments that we're proud of
Built a tech pack generator designers actually enjoy using Created a smooth end-to-end flow from sketch → spec Validated the problem through 30+ interviews Turned messy production processes into clear, structured steps

## What we learned
Most designers struggle with production, not creativity Clear communication is more valuable than more tools Standardization removes huge bottlenecks Designers want confidence, not complexity

## What's next for formme
Support more garment types + variations Build a vetted manufacturer network Add pricing/MOQ estimates and sample tracking Improve real-time collaboration for designers + factories


<a id="fetcha-i-implementation"></a>
## Fetch.ai Implementation

To power Formme’s end-to-end workflow, we built a lightweight multi-agent system using Fetch.ai, with all agents running locally for speed, privacy, and full control.
All agents live inside the /supabase/backend/agents directory.

To run Formme, developers must run these agents locally and provide a valid Gemini API key, which powers the LLM reasoning each agent uses to interpret sketches, generate structured data, and coordinate the pipeline.

### Our Agents

1. SVG Parser Agent
   
**Path:** [/supabase/backend/agents/svg_parser_agent](https://github.com/formestartup22-svg/formme/blob/main/supabase/backend/agents/svg_parser.py)
Extracts structure from sketches/SVGs — paths, shapes, groups, and annotations — and converts raw visuals into machine-readable features.

2. Design Agent
   
**Path:** [/supabase/backend/agents/design_agent](https://github.com/formestartup22-svg/formme/blob/main/supabase/backend/agents/design_agent.py)
Takes parsed SVG features + any designer notes and turns them into structured design specifications: silhouettes, components, and construction details.

3. Materials Agent
   
**Path:** [/supabase/backend/agents/materials_agent](https://github.com/formestartup22-svg/formme/blob/main/supabase/backend/agents/materials_agent.py)
Standardizes materials, trims, fabrics, and finishes using a consistent vocabulary so every tech pack is clear and production-ready.

### How the Pipeline Works

The agents communicate through message-passing to form a chain:
SVG Parser Agent → Design Agent → Materials Agent,
transforming messy sketches and scattered notes into clean, structured tech-pack components.


