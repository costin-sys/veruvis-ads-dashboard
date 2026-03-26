import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface AnalysisRequest {
  ga4Data: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: Array<{ page: string; views: string }>;
  };
  metaData: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    averageCtr: number;
    activeCampaigns: number;
    topCampaigns: Array<{
      name: string;
      spend: number;
      impressions: number;
      clicks: number;
      ctr: string;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Analyze API called');
    console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);

    const body: AnalysisRequest = await request.json();
    console.log('Request body received:', { batches: body });

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('Anthropic client initialized');

    const prompt = `Tu ești un expert în marketing digital și optimizare PPC cu experiență în gestionarea agenților de publicitate. Analizează aceste date de marketing și oferă un raport detaliat în limba română în EXACT două secțiuni delimitate clar.

**Date GA4:**
- Sesiuni: ${body.ga4Data.sessions.toLocaleString()}
- Utilizatori: ${body.ga4Data.users.toLocaleString()}
- Pagini vizitate: ${body.ga4Data.pageviews.toLocaleString()}
- Rata de revenire: ${body.ga4Data.bounceRate}%
- Durată medie sesiune: ${body.ga4Data.avgSessionDuration}s
- Top pagini: ${body.ga4Data.topPages.slice(0, 3).map(p => `${p.page} (${p.views} vizualizări)`).join(', ')}

**Date Meta Ads:**
- Buget total cheltuit: $${body.metaData.totalSpend.toFixed(2)}
- Impresii totale: ${body.metaData.totalImpressions.toLocaleString()}
- Clicuri totale: ${body.metaData.totalClicks.toLocaleString()}
- CTR mediu: ${body.metaData.averageCtr.toFixed(2)}%
- CPC mediu: $${(body.metaData.totalSpend / Math.max(body.metaData.totalClicks, 1)).toFixed(2)}
- Campanii active: ${body.metaData.activeCampaigns}
- Top campanii: ${body.metaData.topCampaigns.slice(0, 3).map(c => `${c.name} ($${c.spend.toFixed(2)}, ${c.clicks} clicks, CTR: ${c.ctr})`).join('; ')}

Oferă raportul în EXACT format de mai jos (cu liniile separatoare):

---SECȚIUNEA 1: ANALIZA DATELOR---

📊 Ce merge bine
- 2-3 puncte specifice despre performance pozitiv

⚠️ Îngrijorări
- 2-3 puncte despre challenge-uri observate în date

💡 Recomandări concrete
- 3-5 acțiuni specifice și rapide de implementat

---SECȚIUNEA 2: GHID PENTRU AGENȚIE---

🎯 Întrebări concrete pentru agenție
Pune următoarele 3-5 întrebări specifice bazate pe datele reale:
- (Fiecare întrebare să se bazeze pe metricele concrete din date)

⚡ Lucruri de optimizat IMEDIAT
- 2-3 acțiuni concrete pe care agenția trebuie să le facă urgent

🔥 Oportunități neexploatate
- 1-2 oportunități pe care le-ai identifica în datele disponibile

🚨 Semnal de alarmă
${body.metaData.averageCtr < 0.5 ? '⚠️ CTR sub 0.5% - Suggest creative/audience refresh urgent' : body.metaData.averageCtr > 2 ? '✅ CTR peste 2% - Campania performează excelent' : '📊 CTR în interval normal'} | ${body.ga4Data.bounceRate > 70 ? '⚠️ Bounce rate mare (>70%) - Check landing page quality' : body.ga4Data.bounceRate < 40 ? '✅ Bounce rate bun (<40%)' : '📊 Bounce rate moderat'}

Fii specific, practic și orientat spre rezultate. Folosește emojis. Respectă EXACT formatul cu cele două secțiuni delimitate de liniile separatoare.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Message created successfully');
    console.log('Message content:', message.content);

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('Analysis text extracted, length:', analysis.length);

    // Parse the two sections from the response
    const sections = analysis.split('---SECȚIUNEA 2: GHID PENTRU AGENȚIE---');
    const analysisSection = sections[0].replace('---SECȚIUNEA 1: ANALIZA DATELOR---', '').trim();
    const agencyGuideSection = sections[1]?.trim() || '';

    console.log('Sections parsed:', { analysisLength: analysisSection.length, agencyGuideLength: agencyGuideSection.length });

    const responseData = {
      success: true,
      analysis: analysisSection,
      agencyGuide: agencyGuideSection,
    };

    console.log('Sending response:', responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analysis',
      },
      { status: 500 }
    );
  }
}
