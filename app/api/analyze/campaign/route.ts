import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

interface UncheckedItem {
  title: string;
  category: string;
  description: string;
}

interface Campaign {
  name: string;
  ctr: number;
  cpc: number;
  spend: number;
  impressions: number;
  clicks: number;
}

interface Benchmarks {
  ctr: { min: number; max: number };
  cpc: { min: number; max: number };
}

interface Metric {
  metric: string;
  currentWeek: number;
  previousWeek: number;
  change: number;
  changePercent: number;
}

interface GA4DataPoint {
  day: string;
  currentWeek: number;
  previousWeek: number;
}

interface RequestBody {
  type: string;
  step?: number;
  stepTitle?: string;
  selections?: string[];
  industry?: string;
  uncheckedItems?: UncheckedItem[];
  campaign?: Campaign;
  benchmarks?: Benchmarks;
  metrics?: Metric[];
  ga4Data?: GA4DataPoint[];
  metaData?: GA4DataPoint[];
}

function buildSystemPrompt(): string {
  return `Ești un expert în publicitate digitală și marketing de performanță pentru industria sănătății și wellness din România. 
  
Răspunde ÎNTOTDEAUNA în limba ROMÂNĂ, cu termeni specifici industriei sănătății/wellness.

Când solicit sfaturi la etapele campaniilor, oferi recomandări concrete și practice.
Când analizezi o campanie, identifici rapid problemele și oferi soluții actionabile.
Când analizezi checkliste, prioritizezi ce e cel mai important.
Când raportezi, oferești perspective executiv-friendly cu recomandări clare.

Tone: profesional, concis, practic, bazat pe date.
Toate răspunsurile trebuie să fie în limba română.`;
}

async function handleMetaStepAdvice(body: RequestBody): Promise<string> {
  const prompt = `Pentru sector sănătate/wellness din România:

Step ${body.step}: "${body.stepTitle}"
Selectări făcute: ${body.selections?.join(', ') || 'niciunul'}

Oferi un sfat de 3-4 propoziții specific pentru aplicație Meta Ads cu accent pe best practices pentru industria de sănătate/wellness. 
Sfatul trebuie să fie concret și actionabil.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

async function handleGoogleStepAdvice(body: RequestBody): Promise<string> {
  const prompt = `Pentru sector sănătate/wellness din România:

Step ${body.step}: "${body.stepTitle}"
Selectări făcute: ${body.selections?.join(', ') || 'niciunul'}

Oferi un sfat de 3-4 propoziții specific pentru aplicație Google Ads cu accent pe best practices pentru industria de sănătate/wellness. 
Sfatul trebuie să fie concret și actionabil.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

async function handleChecklistAnalysis(body: RequestBody): Promise<{ recommendations: string }> {
  const itemsList = body.uncheckedItems
    ?.map((item) => `- ${item.category}: ${item.title} (${item.description})`)
    .join('\n') || '';

  const prompt = `Analizează aceste iteme nebifate din checklist-ul campaniei (sănătate/wellness):

${itemsList}

Prioritizează ce este cel mai important să se completeze ACUM și oferi 3-5 recomandări concrete, prioritizate.
Răspuns să fie direct: "1. [Prioritate 1] - [Explicație] 2. [Prioritate 2] ..." etc.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });

  return {
    recommendations: message.content[0].type === 'text' ? message.content[0].text : '',
  };
}

async function handleCampaignDiagnosis(body: RequestBody): Promise<{ diagnosis: string }> {
  const campaign = body.campaign;
  const benchmarks = body.benchmarks;

  if (!campaign || !benchmarks) {
    return { diagnosis: 'Date insuficiente pentru diagnostic.' };
  }

  const prompt = `Diagnostichează această campanie Meta Ads (sănătate/wellness):

Campanie: ${campaign.name}
CTR: ${campaign.ctr}% (benchmark: ${benchmarks.ctr.min}-${benchmarks.ctr.max}%)
CPC: ${campaign.cpc} RON (benchmark: ${benchmarks.cpc.min}-${benchmarks.cpc.max} RON)
Spend: ${campaign.spend} RON
Impressions: ${campaign.impressions}
Clicks: ${campaign.clicks}

Oferi diagnoza în 4-5 propoziții: ce merge rău și 2-3 schimbări concrete pe care să le facă ACUM pentru a îmbunătăți performanța.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });

  return {
    diagnosis: message.content[0].type === 'text' ? message.content[0].text : '',
  };
}

async function handleWeeklyReport(
  body: RequestBody
): Promise<{
  summary: string;
  recommendations: string[];
}> {
  const metrics = body.metrics || [];
  const metricsString = metrics
    .map(
      (m) =>
        `${m.metric}: ${m.currentWeek} (${m.changePercent > 0 ? '+' : ''}${m.changePercent.toFixed(1)}%)`
    )
    .join('\n');

  const prompt = `Generează un raport săptămânal executive pentru o agenție de marketing (sănătate/wellness):

Metrici GA4 & Meta:
${metricsString}

1. Sumar executiv pe 2-3 propoziții: ce s-a întâmplat săptămâna aceasta cel mai important?
2. 3 acțiuni prioritare pentru săptămâna următoare.

Format răspunsul ca JSON:
{
  "summary": "...",
  "recommendations": ["1. ...", "2. ...", "3. ..."]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: prompt }],
  });

  interface ParsedResponse {
    summary?: string;
    recommendations?: string[];
  }

  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed: ParsedResponse = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (error) {
    console.error('Error parsing response:', error);
  }

  return {
    summary: 'Raportul a fost generat cu succes.',
    recommendations: [],
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RequestBody = await request.json();

    let result: string | { recommendations: string } | { diagnosis: string } | {
      summary: string;
      recommendations: string[];
    } | null = null;

    switch (body.type) {
      case 'meta-step-advice':
        result = await handleMetaStepAdvice(body);
        return NextResponse.json({ success: true, advice: result });

      case 'google-step-advice':
        result = await handleGoogleStepAdvice(body);
        return NextResponse.json({ success: true, advice: result });

      case 'checklist-analysis':
        result = await handleChecklistAnalysis(body);
        return NextResponse.json({
          success: true,
          recommendations: (result as { recommendations: string }).recommendations,
        });

      case 'campaign-diagnosis':
        result = await handleCampaignDiagnosis(body);
        return NextResponse.json({
          success: true,
          diagnosis: (result as { diagnosis: string }).diagnosis,
        });

      case 'weekly-report':
        result = await handleWeeklyReport(body);
        return NextResponse.json({
          success: true,
          summary: (result as { summary: string; recommendations: string[] }).summary,
          recommendations: (result as { summary: string; recommendations: string[] })
            .recommendations,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Campaign analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Eroare la analiză',
      },
      { status: 500 }
    );
  }
}
