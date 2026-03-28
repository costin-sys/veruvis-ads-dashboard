import { NextResponse } from 'next/server';
import { getActiveToken, checkTokenStatus, refreshAccessToken } from '@/app/lib/meta-token';

const adAccountId = 'act_758453352613130';

async function fetchMetaData(endpoint: string, fields: string, token: string) {
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/${endpoint}?fields=${fields}&access_token=${token}`;

  console.log(`Fetching Meta data: ${endpoint}`);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Meta API Error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    console.log('Meta API called for ad account:', adAccountId, '- days:', days);

    let accessToken = getActiveToken();
    if (!accessToken) {
      throw new Error('META_ACCESS_TOKEN nu este setat.');
    }

    // Auto-refresh dacă tokenul expiră în mai puțin de 7 zile
    try {
      const status = await checkTokenStatus();
      if (status.needsRefresh && !status.isExpired) {
        console.log('[meta] Token expiră în curând, se reînnoiește automat...');
        const refreshed = await refreshAccessToken();
        accessToken = refreshed.newToken;
        console.log('[meta] Token reînnoit automat cu succes.');
      }
    } catch (refreshErr) {
      console.warn('[meta] Auto-refresh eșuat, se continuă cu tokenul curent:', refreshErr);
    }

    const now = new Date();
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dateFrom = daysAgo.toISOString().split('T')[0];
    const dateTo = now.toISOString().split('T')[0];

    console.log(`Fetching data from ${dateFrom} to ${dateTo}`);

    // Fetch account insights (spend, impressions, clicks, etc.)
    console.log('Fetching account insights...');
    const insightsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=spend,impressions,clicks,ctr,campaign_name&date_preset=last_30d&access_token=${accessToken}`;

    const insightsResponse = await fetch(insightsUrl);

    if (!insightsResponse.ok) {
      const error = await insightsResponse.json();
      throw new Error(`Meta Insights API Error: ${error.error?.message || insightsResponse.statusText}`);
    }

    const insightsData = await insightsResponse.json();

    // Calculate totals from insights
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalCtr = 0;
    let metricCount = 0;

    if (insightsData.data && Array.isArray(insightsData.data)) {
      insightsData.data.forEach((item: any) => {
        totalSpend += parseFloat(item.spend || 0);
        totalImpressions += parseInt(item.impressions || 0);
        totalClicks += parseInt(item.clicks || 0);
        totalCtr += parseFloat(item.ctr || 0);
        metricCount++;
      });
    }

    const averageCtr = metricCount > 0 ? (totalCtr / metricCount).toFixed(2) : '0.00';

    console.log('Account insights fetched');
    console.log(`Total spend: ${totalSpend}, Impressions: ${totalImpressions}, Clicks: ${totalClicks}`);

    // Fetch active campaigns
    console.log('Fetching active campaigns...');
    const campaignsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status&effective_status[0]=ACTIVE&access_token=${accessToken}&limit=100`;

    const campaignsResponse = await fetch(campaignsUrl);

    if (!campaignsResponse.ok) {
      const error = await campaignsResponse.json();
      throw new Error(`Meta Campaigns API Error: ${error.error?.message || campaignsResponse.statusText}`);
    }

    const campaignsData = await campaignsResponse.json();
    const activeCampaigns = campaignsData.data ? campaignsData.data.length : 0;

    console.log(`Active campaigns: ${activeCampaigns}`);

    // Fetch campaign details for breakdown
    console.log('Fetching campaign performance...');
    const campaignInsightsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,insights.fields(spend,impressions,clicks,ctr).date_preset(last_30d)&effective_status[0]=ACTIVE&access_token=${accessToken}&limit=10`;

    const campaignInsightsResponse = await fetch(campaignInsightsUrl);

    let topCampaigns = [];
    if (campaignInsightsResponse.ok) {
      const campaignInsightsData = await campaignInsightsResponse.json();

      if (campaignInsightsData.data && Array.isArray(campaignInsightsData.data)) {
        topCampaigns = campaignInsightsData.data
          .map((campaign: any) => {
            const insights = campaign.insights?.data?.[0] || {};
            return {
              name: campaign.name,
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              ctr: parseFloat(insights.ctr || 0).toFixed(2),
            };
          })
          .sort((a: any, b: any) => b.spend - a.spend)
          .slice(0, 5);
      }
    }

    console.log('Meta data fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        totalImpressions,
        totalClicks,
        averageCtr: parseFloat(averageCtr),
        activeCampaigns,
        topCampaigns,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Meta API Error:', errorMessage);
    console.error('Stack:', errorStack);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
