import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NAME_ID_MAP: Record<string, number> = {
  'Ver. Fabião Zagueiro': 3703,
  'Ver. Roberto Chagas': 3709,
  'Ver. Marcão da Academia': 1148
};

const PROCESS_TYPE_ID_MAP: Record<string, number> = {
  'Emenda': 347,
  'Projeto de Lei': 348,
  'Projeto de Lei Complementar': 367
};

interface ScraperRequest {
  name: string;
  processType: string;
  processStart: string; // DD/MM/YYYY
  processEnd: string;   // DD/MM/YYYY
}

const getPropositionsUrl = (nameId: number, processTypeId: number, startDate: string, endDate: string): string => {
  const queryParams = `tipo=${processTypeId}&autor=${nameId}&trainicio=${startDate}&trafinal=${endDate}&procuraTexto=DocumentoInicial`;
  return `https://camarasempapel.camarasjc.sp.gov.br/consulta-producao.aspx?${queryParams}`;
};

const countPropositions = (html: string): number => {
  // Look for the pattern: "Localizada(s) <strong>N</strong> proposição(ões)"
  const regex = /Localizada\(s\)\s*<strong>(\d+)<\/strong>\s*proposição\(ões\)/;
  const match = html.match(regex);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return -1;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, processType, processStart, processEnd }: ScraperRequest = await req.json();

    console.log("Scraping propositions for:", { name, processType, processStart, processEnd });

    // Validate inputs
    if (!NAME_ID_MAP[name]) {
      throw new Error(`Nome de vereador não encontrado: ${name}`);
    }

    if (!PROCESS_TYPE_ID_MAP[processType]) {
      throw new Error(`Tipo de processo não encontrado: ${processType}`);
    }

    const nameId = NAME_ID_MAP[name];
    const processTypeId = PROCESS_TYPE_ID_MAP[processType];

    // Build URL
    const url = getPropositionsUrl(nameId, processTypeId, processStart, processEnd);
    
    console.log("Fetching from URL:", url);

    // Fetch the page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Count propositions
    const count = countPropositions(html);

    if (count === -1) {
      console.warn("Could not find proposition count in HTML");
      return new Response(
        JSON.stringify({ 
          count: 0, 
          message: "Não foi possível extrair o número de proposições" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Found propositions count:", count);

    return new Response(
      JSON.stringify({ 
        count, 
        name, 
        processType, 
        period: { start: processStart, end: processEnd } 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in scrape-propositions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
