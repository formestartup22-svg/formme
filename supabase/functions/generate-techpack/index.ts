import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const prompt = `You are a professional fashion technical designer. Generate a comprehensive fashion tech pack based on the following information:

Design Name: ${designData.name || 'Not specified'}
Garment Type: ${designData.garmentType || 'T-Shirt'}
Fabric: ${designData.fabric || 'Not specified'}
GSM: ${designData.gsm || 'Not specified'}
Print Type: ${designData.print || 'Not specified'}
Measurements:
- Chest Width: ${designData.measurements?.chestWidth || 'Not specified'} inches
- Length: ${designData.measurements?.length || 'Not specified'} inches
- Sleeve Length: ${designData.measurements?.sleeveLength || 'Not specified'} inches
Construction Notes: ${designData.constructionNotes || 'None provided'}

Please create a detailed tech pack that includes:

1. **DESIGN OVERVIEW**
   - Style number and description
   - Season/collection
   - Target market

2. **FABRIC SPECIFICATIONS**
   - Fabric type and composition
   - GSM/weight
   - Width
   - Care instructions
   - Color/print details

3. **MEASUREMENTS & SIZE CHART**
   - Detailed graded measurement chart (XS, S, M, L, XL)
   - All critical measurements (chest, length, sleeves, neck, shoulders)
   - Tolerance (+/- specifications)

4. **CONSTRUCTION DETAILS**
   - Stitch types (e.g., 301 lockstitch, 504 overlock)
   - Seam allowances
   - Seam specifications by location
   - Hem details

5. **BILL OF MATERIALS (BOM)**
   - Main fabric quantity
   - Thread type and color
   - Labels (care, size, brand)
   - Trims and accessories
   - Packaging requirements

6. **QUALITY CONTROL CHECKPOINTS**
   - Pre-production checks
   - In-line inspection points
   - Final inspection criteria

7. **PRODUCTION NOTES**
   - Special instructions
   - Critical quality points
   - Sample approval requirements

Format the response in a clear, professional manner suitable for manufacturer communication. Use bullet points, tables where appropriate, and clear sections. Be specific with industry-standard terminology.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert fashion technical designer with 20+ years of experience creating comprehensive tech packs for garment manufacturing. Provide detailed, industry-standard specifications.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
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

    return new Response(
      JSON.stringify({ 
        success: true,
        techPackContent,
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
