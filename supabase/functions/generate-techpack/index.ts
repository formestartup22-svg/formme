import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced SVG Parser - extracts detailed design features
async function parseSVG(svgUrl: string) {
  try {
    const response = await fetch(svgUrl);
    const svgText = await response.text();
    
    // Count elements
    const paths = (svgText.match(/<path/g) || []).length;
    const rects = (svgText.match(/<rect/g) || []).length;
    const circles = (svgText.match(/<circle/g) || []).length;
    const ellipses = (svgText.match(/<ellipse/g) || []).length;
    const polygons = (svgText.match(/<polygon/g) || []).length;
    const lines = (svgText.match(/<line/g) || []).length;
    const groups = (svgText.match(/<g/g) || []).length;
    const texts = (svgText.match(/<text/g) || []).length;
    
    // Extract colors
    const fillColors = new Set<string>();
    const strokeColors = new Set<string>();
    
    const fillMatches = svgText.matchAll(/fill="([^"]+)"/g);
    for (const match of fillMatches) {
      const color = match[1];
      if (color !== 'none' && !color.includes('url(')) {
        fillColors.add(color);
      }
    }
    
    const strokeMatches = svgText.matchAll(/stroke="([^"]+)"/g);
    for (const match of strokeMatches) {
      const color = match[1];
      if (color !== 'none' && !color.includes('url(')) {
        strokeColors.add(color);
      }
    }
    
    // Extract dimensions
    const widthMatch = svgText.match(/width="([^"]+)"|width='([^']+)'/);
    const heightMatch = svgText.match(/height="([^"]+)"|height='([^']+)'/);
    const viewBoxMatch = svgText.match(/viewBox="([^"]+)"|viewBox='([^']+)'/);
    
    let width = widthMatch ? (widthMatch[1] || widthMatch[2]) : 'unknown';
    let height = heightMatch ? (heightMatch[1] || heightMatch[2]) : 'unknown';
    
    if (width === 'unknown' && viewBoxMatch) {
      const viewBoxValues = (viewBoxMatch[1] || viewBoxMatch[2]).split(/\s+/);
      if (viewBoxValues.length === 4) {
        width = viewBoxValues[2];
        height = viewBoxValues[3];
      }
    }
    
    // Analyze complexity
    const totalElements = paths + rects + circles + ellipses + polygons + lines;
    let complexity = 'simple';
    if (totalElements > 100) complexity = 'highly detailed';
    else if (totalElements > 50) complexity = 'moderately complex';
    else if (totalElements > 20) complexity = 'detailed';
    
    // Estimate silhouette with more precision
    let silhouette = 'unknown';
    let garmentFeatures: string[] = [];
    
    if (width !== 'unknown' && height !== 'unknown') {
      const w = parseFloat(width);
      const h = parseFloat(height);
      if (!isNaN(w) && !isNaN(h) && w > 0) {
        const aspectRatio = h / w;
        if (aspectRatio > 2.0) {
          silhouette = 'full-length dress or gown';
        } else if (aspectRatio > 1.5) {
          silhouette = 'dress or long top';
        } else if (aspectRatio > 1.2) {
          silhouette = 'standard top or shirt';
        } else if (aspectRatio > 0.8) {
          silhouette = 'boxy top or jacket';
        } else {
          silhouette = 'wide garment or pants';
        }
      }
    }
    
    // Detect potential features from SVG structure
    if (svgText.toLowerCase().includes('pocket') || rects > 10) {
      garmentFeatures.push('pockets');
    }
    if (circles > 5 || svgText.toLowerCase().includes('button')) {
      garmentFeatures.push('buttons or closures');
    }
    if (groups > 15) {
      garmentFeatures.push('complex construction details');
    }
    if (texts > 0) {
      garmentFeatures.push('text or branding elements');
    }
    if (lines > 20) {
      garmentFeatures.push('stitching or seam details');
    }
    
    return {
      element_counts: {
        paths,
        rectangles: rects,
        circles,
        ellipses,
        polygons,
        lines,
        groups,
        texts,
        total: totalElements
      },
      colors: {
        fills: Array.from(fillColors).slice(0, 10),
        strokes: Array.from(strokeColors).slice(0, 10),
        color_count: fillColors.size + strokeColors.size
      },
      canvas: { width, height },
      complexity,
      estimated_silhouette: silhouette,
      detected_features: garmentFeatures,
      detail_level: totalElements > 50 ? 'high' : totalElements > 20 ? 'medium' : 'low'
    };
  } catch (error) {
    console.error('SVG parsing error:', error);
    return {
      element_counts: { total: 0 },
      colors: { fills: [], strokes: [], color_count: 0 },
      canvas: { width: 'unknown', height: 'unknown' },
      complexity: 'unknown',
      estimated_silhouette: 'unknown',
      detected_features: [],
      detail_level: 'unknown'
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
- Complexity: ${svgFeatures.complexity}
- Total elements: ${svgFeatures.element_counts.total}
- Color palette: ${svgFeatures.colors.fills.join(', ') || 'Not detected'}
- Detected features: ${svgFeatures.detected_features.join(', ') || 'None'}

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
- Complexity: ${svgFeatures.complexity}
- Detail level: ${svgFeatures.detail_level}
- Colors detected: ${svgFeatures.colors.color_count}
- Features: ${svgFeatures.detected_features.join(', ') || 'Standard garment'}

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

    // Generate Professional PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add page header
    const addHeader = () => {
      doc.setFillColor(52, 76, 61); // Primary green color
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('TECHNICAL SPECIFICATION', margin, 17);
      doc.setTextColor(0, 0, 0);
    };

    // Helper function to add page footer
    const addFooter = (pageNum: number) => {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
      doc.setTextColor(0, 0, 0);
    };

    // Add first page header
    addHeader();
    yPosition = 35;

    // Add design name and info box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(designData.name || 'Untitled Design', margin + 5, yPosition + 10);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Type: ${designData.garmentType || 'Not specified'}`, margin + 5, yPosition + 18);
    doc.setTextColor(0, 0, 0);
    yPosition += 35;

    // Add design sketch section if available
    if (designData.designImageUrl) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Design Sketch', margin, yPosition);
      yPosition += 8;
      
      // Add a placeholder box for the design (since SVG embedding is problematic)
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, 80, 80);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Design Image', margin + 25, yPosition + 40);
      doc.text('(View in digital format)', margin + 10, yPosition + 48);
      doc.setTextColor(0, 0, 0);
      yPosition += 90;
    }

    // Parse and render markdown content with better formatting
    const lines = techPackContent.split('\n');
    let pageNum = 1;
    let inTable = false;
    let tableRows: string[][] = [];

    const checkPageBreak = (spaceNeeded: number) => {
      if (yPosition + spaceNeeded > pageHeight - 30) {
        addFooter(pageNum);
        doc.addPage();
        pageNum++;
        addHeader();
        yPosition = 35;
        return true;
      }
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle section headers
      if (line.startsWith('# ')) {
        checkPageBreak(20);
        doc.setFillColor(52, 76, 61);
        doc.rect(margin, yPosition, contentWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(line.replace('# ', '').toUpperCase(), margin + 5, yPosition + 8);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;
      } 
      // Handle sub-headers
      else if (line.startsWith('## ')) {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(52, 76, 61);
        doc.text(line.replace('## ', ''), margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
      } 
      // Handle sub-sub-headers
      else if (line.startsWith('### ')) {
        checkPageBreak(12);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(line.replace('### ', ''), margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 8;
      }
      // Handle table detection
      else if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        // Skip separator lines
        if (!line.includes('---')) {
          const cells = line.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
          tableRows.push(cells);
        }
      } else {
        // Render accumulated table
        if (inTable && tableRows.length > 0) {
          checkPageBreak(10 + tableRows.length * 7);
          const colWidth = contentWidth / Math.max(...tableRows.map(r => r.length));
          
          tableRows.forEach((row, rowIdx) => {
            const isHeader = rowIdx === 0;
            if (isHeader) {
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yPosition, contentWidth, 7, 'F');
              doc.setFont(undefined, 'bold');
            }
            
            row.forEach((cell, colIdx) => {
              const text = doc.splitTextToSize(cell, colWidth - 4);
              doc.text(text, margin + colIdx * colWidth + 2, yPosition + 5);
            });
            
            if (isHeader) doc.setFont(undefined, 'normal');
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPosition + 7, margin + contentWidth, yPosition + 7);
            yPosition += 7;
          });
          
          inTable = false;
          tableRows = [];
          yPosition += 5;
        }
        
        // Handle bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          checkPageBreak(8);
          const text = line.replace(/^[\-\*]\s*/, '');
          doc.setFontSize(10);
          doc.circle(margin + 2, yPosition - 1, 1, 'F');
          const textLines = doc.splitTextToSize(text, contentWidth - 10);
          doc.text(textLines, margin + 6, yPosition);
          yPosition += Math.max(textLines.length * 5, 6);
        }
        // Handle numbered lists
        else if (line.match(/^\d+\.\s/)) {
          checkPageBreak(8);
          doc.setFontSize(10);
          const textLines = doc.splitTextToSize(line, contentWidth - 10);
          doc.text(textLines, margin + 5, yPosition);
          yPosition += Math.max(textLines.length * 5, 6);
        }
        // Handle regular text
        else if (line.trim()) {
          checkPageBreak(8);
          doc.setFontSize(10);
          const textLines = doc.splitTextToSize(line, contentWidth);
          doc.text(textLines, margin, yPosition);
          yPosition += Math.max(textLines.length * 5, 6);
        } 
        // Handle spacing
        else {
          yPosition += 4;
        }
      }
    }

    // Add final footer
    addFooter(pageNum);

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
