import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designData } = await req.json();
    
    console.log('Generating tech pack for:', designData);

    const systemPrompt = `You are a senior apparel technical designer creating a factory-ready TECH PACK.

You will be given structured design data for a garment (or set, e.g., top + pants). 
Using that data, generate a complete tech pack document in clear, structured MARKDOWN, 
so it can later be converted into a PDF.

The tech pack should follow this structure and tone:

1. HEADER
   - Brand
   - Style Name / Number
   - Category (e.g., Pajama Set, Hoodie, Dress)
   - Gender / Fit (e.g., WOMEN, MEN, UNISEX)
   - Season (e.g., AW25, SS26)
   - Created By
   - Created Date

2. GARMENT OVERVIEW
   - Short description of the style and intended use.
   - Components included (e.g., "TOP + PANTS (AOP)").
   - Base color(s) and main fabric.
   - Overall quality and composition:
     - QUALITY: marketing name (e.g., "Cotton with Elastane")
     - COMPOSITION: exact percentages (e.g., "95% COTTON 5% ELASTANE")
     - GSM or weight.

3. CONSTRUCTION / DESIGN DETAILS
   - Describe the garment in terms a factory understands.
   - Include FRONT and BACK descriptions where applicable.
   - Call out key details in ALL CAPS labels with short explanations, e.g.:
     - V-NECK NECKLINE – clean finish, double topstitch.
     - SECURE TAPE – inside neckline for reinforcement.
     - SATIN DRAWCORD – flat ribbon at waistband with metal tips.
     - POCKETS – side seam pockets with clean finish.
     - DOUBLE STITCHING – hem and sleeve hems.
   - Use bullet points and keep each call-out clear and concise.

4. FABRIC, MATERIALS & TRIMS TABLE
   - Provide a table with rows such as:
     - QUALITY
     - COMPOSITION
     - COLOR
     - GSM
     - THREADS COLOR
     - DRAWCORD
     - EYELETS
     - DRAWCORD ENDINGS
     - LABEL
     - HANGTAG
   - Fill each cell using the given data where possible.
   - Where information is missing, write: "TBD – to be confirmed by designer."

5. ARTWORK & COLORS
   - If there is an all-over print or graphic:
     - Name/ID of the artwork.
     - Print technique (if known; otherwise mark as TBD).
     - Print size (e.g., "Print size: 400 x 435 mm") when provided or estimated.
   - Provide a table of COLOR CHIPS with:
     - Color Name
     - Color Code (e.g., Pantone TCX, HEX, or internal code)
     - Where it is used (e.g., SHELL, RIB, PRINT ACCENT).
   - Clearly state if artwork should match a provided reference file or image.

6. MEASUREMENT SPEC (SIZE CHART)
   - Include a short note: "All measurements in cm unless otherwise specified."
   - Define main measurement points for each component (TOP, BOTTOM, etc.), e.g.:
     - A – Chest width
     - B – Body length
     - C – Bottom opening
     - D – Sleeve length
     - E – Waist width
     - F – Inseam
     - etc.
   - Provide a measurement table with sizes as columns (e.g., XS, S, M, L, XL, XXL)
     and measurement codes as rows (A, B, C, …). 
   - If exact numbers are not provided in the input, propose reasonable base values 
     and grade them logically across sizes, but clearly label them as:
     "(INITIAL SPEC – TO BE VALIDATED IN SAMPLING)".

7. LABEL & BRANDING
   - Describe the main neck label / stamp (size, position, color) and any additional labels.
   - Include dimensions for brand stamps or waterprint labels if known 
     (e.g., "Waterprint stamp: 38 x 31 mm at center back neck").
   - Specify size label system (e.g., S, M, L, XL, XXL).

8. PACKAGING / NOTES (optional section)
   - Any general comments to the factory (folding, packing, special care, etc.).
   - Add a short "NOTES" bullet list, including items that are still TBD or need review.

GENERAL RULES:
- Always answer in English.
- Use **clear headings** and MARKDOWN tables so the document is easy to convert into a PDF.
- Prefer concise bullet points over long paragraphs.
- When data is missing, DO NOT invent arbitrary details without warning. 
  Instead:
  - Either leave as "TBD – to be confirmed by designer"
  - Or if you suggest a default, mark it clearly as an assumption.

Now generate a complete tech pack using the provided DESIGN DATA.`;

    const userPrompt = `DESIGN DATA:
${JSON.stringify(designData, null, 2)}`;

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
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate tech pack', details: errorText }), 
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
        const imageType = designData.designImageUrl.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
        
        doc.addImage(`data:image/${imageType.toLowerCase()};base64,${base64Image}`, imageType, 15, yPosition, 180, 100);
        yPosition += 110;
      } catch (error) {
        console.error('Error adding image to PDF:', error);
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
        message: 'Tech pack generated successfully'
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
