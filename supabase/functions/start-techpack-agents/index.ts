import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { garmentBrief, svgUrl, designId } = await req.json();

    if (!garmentBrief) {
      throw new Error("garmentBrief is required");
    }

    console.log("Starting techpack generation for design:", designId);
    console.log("Garment brief:", garmentBrief);
    console.log("SVG URL:", svgUrl);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Call Gemini API directly to analyze the design and generate techpack sections
    const prompt = `You are a fashion techpack AI assistant. Analyze this garment design and create a comprehensive techpack.

${garmentBrief}

Please provide a detailed techpack with the following sections:

1. DESIGN OVERVIEW:
   - Style description
   - Silhouette
   - Fit
   - Intended use
   - Key features

2. MATERIALS:
   - Shell fabric recommendations
   - Lining fabric (if applicable)
   - Trims needed
   - Hardware specifications

3. CONSTRUCTION NOTES:
   - Sewing techniques
   - Assembly instructions
   - Quality control points

Format the response as structured JSON with these three main sections.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log("Techpack generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Techpack generation completed",
        designId: designId,
        techpackContent: generatedText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating techpack:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
