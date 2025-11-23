import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { garmentBrief, templateImageB64, designId } = await req.json();

    if (!garmentBrief) {
      throw new Error("garmentBrief is required");
    }

    console.log("Starting agent orchestration for design:", designId);
    console.log("Garment brief:", garmentBrief);

    // Here we would trigger the Python orchestrator
    // For now, we'll use a Python subprocess to start the orchestrator
    
    // Build the command to run the orchestrator
    const pythonPath = "/usr/bin/python3";
    const orchestratorPath = "./supabase/functions/generate-techpack/orchestrator.py";
    
    // Start the orchestrator as a background process
    const command = new Deno.Command(pythonPath, {
      args: [orchestratorPath],
      env: {
        GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") || "",
        GARMENT_BRIEF: garmentBrief,
        TEMPLATE_IMAGE_B64: templateImageB64 || "",
        DESIGN_ID: designId || "",
      },
      stdout: "piped",
      stderr: "piped",
    });

    // Run the process
    const process = command.spawn();
    
    // Don't wait for completion - let it run in background
    process.status.then((status) => {
      console.log("Orchestrator process completed with status:", status.code);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Agent orchestration started",
        designId: designId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error starting agents:', error);
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
