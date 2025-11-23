import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SVG Parser Agent - extracts features from SVG using text parsing
async function parseSVG(svgUrl: string) {
  try {
    const response = await fetch(svgUrl);
    const svgText = await response.text();
    
    // Count elements using regex
    const paths = (svgText.match(/<path/g) || []).length;
    const rects = (svgText.match(/<rect/g) || []).length;
    const groups = (svgText.match(/<g/g) || []).length;
    const texts = (svgText.match(/<text/g) || []).length;
    
    // Extract width and height
    const widthMatch = svgText.match(/width="([^"]+)"|width='([^']+)'/);
    const heightMatch = svgText.match(/height="([^"]+)"|height='([^']+)'/);
    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"|viewBox='([^']+)'/);
    
    let width = widthMatch ? (widthMatch[1] || widthMatch[2]) : 'unknown';
    let height = heightMatch ? (heightMatch[1] || heightMatch[2]) : 'unknown';
    
    // Fallback to viewBox if width/height not found
    if (width === 'unknown' && viewBoxMatch) {
      const viewBoxValues = (viewBoxMatch[1] || viewBoxMatch[2]).split(/\s+/);
      if (viewBoxValues.length === 4) {
        width = viewBoxValues[2];
        height = viewBoxValues[3];
      }
    }
    
    // Estimate silhouette based on aspect ratio
    let silhouette = 'unknown';
    if (width !== 'unknown' && height !== 'unknown') {
      const w = parseFloat(width);
      const h = parseFloat(height);
      if (!isNaN(w) && !isNaN(h) && w > 0) {
        const aspectRatio = h / w;
        if (aspectRatio > 1.8) silhouette = 'dress-like';
        else if (aspectRatio > 1.2) silhouette = 'top';
        else silhouette = 'boxy top';
      }
    }
    
    return {
      object_counts: { paths, rectangles: rects, groups, texts },
      canvas: { width, height },
      estimated_silhouette: silhouette,
      svg_text: svgText.substring(0, 500) // First 500 chars for context
    };
  } catch (error) {
    console.error('SVG parsing error:', error);
    return {
      object_counts: { paths: 0, rectangles: 0, groups: 0, texts: 0 },
      canvas: { width: 'unknown', height: 'unknown' },
      estimated_silhouette: 'unknown',
      svg_text: ''
    };
  }
}

// Design Agent - generates design overview section
async function generateDesignSection(garmentBrief: string, svgFeatures: any) {
  const prompt = `You are a fashion techpack design specialist.
Output ONLY valid JSON.

Generate the DESIGN OVERVIEW section for this garment:

"${garmentBrief}"

SVG Design Analysis:
- Silhouette: ${svgFeatures.estimated_silhouette}
- Canvas size: ${svgFeatures.canvas.width} x ${svgFeatures.canvas.height}
- Elements: ${svgFeatures.object_counts.paths} paths, ${svgFeatures.object_counts.rectangles} shapes

Required JSON keys:
- style_description
- silhouette
- fit
- intended_use
- key_features (list)`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: 'You are a fashion techpack assistant. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Design agent failed: ${response.status}`);
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Try to parse JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(content);
  } catch {
    return { error: "Invalid JSON", raw: content };
  }
}

// Materials Agent - generates materials section
async function generateMaterialsSection(garmentBrief: string, svgFeatures: any) {
  const prompt = `You are a fashion techpack materials specialist.
Output ONLY valid JSON.

Create the MATERIALS section for this garment:

"${garmentBrief}"

Design context from SVG:
- Type: ${svgFeatures.estimated_silhouette}
- Complexity: ${svgFeatures.object_counts.paths + svgFeatures.object_counts.rectangles} elements

Required JSON keys:
- shell_fabric
- lining_fabric
- trims (list)
- hardware (list)`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: 'You are a fashion techpack materials specialist. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Materials agent failed: ${response.status}`);
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(content);
  } catch {
    return { error: "Invalid JSON", raw: content };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designData } = await req.json();
    
    console.log('Generating tech pack with AI agents for:', designData);

    // Step 1: Parse SVG design
    console.log('Step 1: Parsing SVG design...');
    const svgFeatures = designData.designImageUrl 
      ? await parseSVG(designData.designImageUrl)
      : { object_counts: {}, canvas: {}, estimated_silhouette: 'unknown', svg_text: '' };

    // Step 2: Generate design section
    console.log('Step 2: Design agent processing...');
    const garmentBrief = `Design Name: ${designData.name}
Garment Type: ${designData.garmentType}

Measurements:
${designData.measurements?.map((m: any) => `- ${m.type}: ${m.value}`).join('\n') || 'None provided'}

Fabric Specifications:
${designData.fabricSpecs?.map((f: any) => `- ${f.fabricType} (${f.fiberPercent}%, ${f.gsm} GSM)`).join('\n') || 'None provided'}

Construction Notes:
${designData.constructionNotes || 'None provided'}`;

    const designSection = await generateDesignSection(garmentBrief, svgFeatures);
    
    // Step 3: Generate materials section
    console.log('Step 3: Materials agent processing...');
    const materialsSection = await generateMaterialsSection(garmentBrief, svgFeatures);

    // Step 4: Combine into comprehensive tech pack
    console.log('Step 4: Compiling final tech pack...');
    const systemPrompt = `You are a senior apparel technical designer. Compile a complete factory-ready TECH PACK in MARKDOWN format.

Use the provided DESIGN OVERVIEW and MATERIALS sections, plus the raw design data, to create a comprehensive tech pack following this structure:

1. HEADER - Brand, Style Name/Number, Category, Gender/Fit, Season, Created By, Created Date
2. GARMENT OVERVIEW - from provided design overview
3. CONSTRUCTION / DESIGN DETAILS - from design overview key features
4. FABRIC, MATERIALS & TRIMS TABLE - from provided materials section
5. ARTWORK & COLORS - reference design image
6. MEASUREMENT SPEC (SIZE CHART) - from provided measurements
7. LABEL & BRANDING
8. NOTES - mark TBD items

Use clear MARKDOWN formatting with tables and bullet points.`;

    const userPrompt = `DESIGN OVERVIEW SECTION:
${JSON.stringify(designSection, null, 2)}

MATERIALS SECTION:
${JSON.stringify(materialsSection, null, 2)}

RAW DESIGN DATA:
${garmentBrief}

SVG ANALYSIS:
${JSON.stringify(svgFeatures, null, 2)}

Now compile the complete tech pack.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Final compilation error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limits exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable workspace.');
      }
      
      throw new Error(`AI compilation error: ${response.status}`);
    }

    const data = await response.json();
    const techPackContent = data.choices[0].message.content;

    console.log('Tech pack generated successfully');

    // Generate PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Add design image if provided
    if (designData.designImageUrl) {
      try {
        const imageResponse = await fetch(designData.designImageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        
        // SVG will be rendered as is - jsPDF handles SVG
        doc.addImage(`data:image/svg+xml;base64,${base64Image}`, 'SVG', 15, yPosition, 80, 80);
        yPosition += 90;
      } catch (error) {
        console.error('Error adding SVG to PDF:', error);
      }
    }

    // Parse markdown and add to PDF
    const lines = techPackContent.split('\n');
    doc.setFontSize(10);
    
    for (const line of lines) {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }

      if (line.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(line.replace('# ', ''), 15, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
      } else if (line.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(line.replace('## ', ''), 15, yPosition);
        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
      } else if (line.startsWith('### ')) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(line.replace('### ', ''), 15, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
      } else if (line.trim()) {
        const textLines = doc.splitTextToSize(line, 180);
        doc.text(textLines, 15, yPosition);
        yPosition += textLines.length * 6;
      } else {
        yPosition += 5;
      }
    }

    const pdfData = doc.output('datauristring').split(',')[1];

    return new Response(
      JSON.stringify({ 
        success: true,
        techPackContent,
        pdfData,
        message: 'Tech pack generated successfully with AI agents',
        agentResults: {
          svgAnalysis: svgFeatures,
          designSection,
          materialsSection
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-techpack function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate tech pack'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
