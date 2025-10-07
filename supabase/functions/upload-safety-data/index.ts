import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  latitude: number;
  longitude: number;
  nature: string;
  date: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Database service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const requestData: RequestData = await req.json();
    const { latitude, longitude, nature, date } = requestData;

    // Validate required fields
    if (!latitude || !longitude || !nature || !date) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    const incidentDate = new Date(date);
    if (isNaN(incidentDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Data inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing safety incident:', {
      latitude,
      longitude,
      nature,
      date
    });

    // Insert the safety incident
    const { data: newIncident, error: insertError } = await supabaseClient
      .from('safety_incidents')
      .insert({
        incident_type: nature,
        latitude,
        longitude,
        incident_date: date,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating incident:', insertError);
      throw insertError;
    }

    console.log('Safety incident recorded successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: newIncident 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-safety-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.cause : undefined 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});