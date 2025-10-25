import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords } = await req.json();
    
    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gerando post com palavras-chave:', keywords);

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados contextuais de atividade parlamentar
    const { data: scoresData } = await supabase
      .from('scores_vereador')
      .select(`
        score_total,
        num_acoes_avaliadas,
        score_medio,
        councilor:councilors(name, party)
      `)
      .order('score_total', { ascending: false })
      .limit(10);

    // Buscar dados de segurança pública
    const { data: safetyData } = await supabase
      .from('safety_incidents')
      .select('incident_type, incident_date, neighborhood')
      .order('created_at', { ascending: false })
      .limit(50);

    // Preparar contexto para a IA
    const parlamentaryContext = scoresData && scoresData.length > 0
      ? `\n\nDADOS DE ATIVIDADE PARLAMENTAR DISPONÍVEIS:\n` +
        `Top 5 vereadores por score de qualidade:\n` +
        scoresData.slice(0, 5).map((s: any, i: number) => 
          `${i + 1}. ${s.councilor?.name || 'N/A'} (${s.councilor?.party || 'N/A'}): Score ${s.score_total.toFixed(1)} (${s.num_acoes_avaliadas} ações avaliadas)`
        ).join('\n')
      : '';

    const safetyContext = safetyData && safetyData.length > 0
      ? `\n\nDADOS DE SEGURANÇA PÚBLICA DISPONÍVEIS:\n` +
        `Incidentes recentes por tipo:\n` +
        Object.entries(
          safetyData.reduce((acc: Record<string, number>, inc: any) => {
            acc[inc.incident_type] = (acc[inc.incident_type] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => `- ${type}: ${count} ocorrências`).join('\n')
      : '';

    const keywordList = keywords.join(', ');
    const systemPrompt = `Você é um jornalista especializado em política municipal e análise de dados públicos de São José dos Campos.${parlamentaryContext}${safetyContext}

IMPORTANTE:
- Se houver dados disponíveis acima, utilize-os para enriquecer o artigo com informações factuais
- Analise tendências e padrões nos dados apresentados quando disponíveis
- Mantenha um tom jornalístico, objetivo e profissional
- Forneça insights baseados nos dados reais quando existirem
- Se não houver dados suficientes sobre o tema específico, foque na análise conceitual
- O artigo deve ter entre 600-900 palavras
- Use subtítulos para organizar o conteúdo
- Retorne apenas o conteúdo em HTML simples (use tags <h2>, <p>, <strong>, <em>)`;

    const userPrompt = `Escreva um artigo de blog sobre: ${keywordList}`;

    console.log('Calling Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
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
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar conteúdo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content;

    // Clean the content to remove markdown code blocks
    generatedContent = generatedContent.replace(/```html/g, '').replace(/```/g, '').trim();

    console.log('Blog post generated successfully with contextual data');

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-blog function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
