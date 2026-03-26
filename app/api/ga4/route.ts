import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

const propertyId = process.env.GA4_PROPERTY_ID;

let client: BetaAnalyticsDataClient | null = null;

function initializeClient() {
  if (client) return client;

  try {
    const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_JSON;

    if (!credentialsJson) {
      throw new Error('GA4_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    console.log('Loading GA4 credentials from environment variable');
    const credentials = JSON.parse(credentialsJson);
    console.log('Credentials loaded successfully for:', credentials.client_email);

    client = new BetaAnalyticsDataClient({
      credentials,
    });

    return client;
  } catch (error) {
    console.error('Failed to initialize GA4 client:', error);
    throw error;
  }
}

async function runReport(
  metrics: Array<{ name: string }>,
  dimensions: Array<{ name: string }> = [],
  limit: number = 10000,
  days: number = 30
) {
  const analyticsClient = initializeClient();
  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const request = {
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: daysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      },
    ],
    metrics,
    ...(dimensions.length > 0 && { dimensions }),
    limit,
  };

  console.log('Running report with request:', JSON.stringify(request, null, 2));

  const response = await analyticsClient.runReport(request);
  return response;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    console.log('GA4 API called - propertyId:', propertyId, '- days:', days);

    // Key metrics
    console.log('Fetching sessions...');
    const sessionsReport = await runReport([{ name: 'sessions' }], [], 10000, days);
    const sessions =
      sessionsReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0';
    console.log('Sessions:', sessions);

    console.log('Fetching users...');
    const usersReport = await runReport([{ name: 'activeUsers' }], [], 10000, days);
    const users = usersReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0';
    console.log('Users:', users);

    console.log('Fetching pageviews...');
    const pageviewsReport = await runReport([{ name: 'screenPageViews' }], [], 10000, days);
    const pageviews =
      pageviewsReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0';
    console.log('Pageviews:', pageviews);

    console.log('Fetching bounce rate...');
    const bounceRateReport = await runReport([{ name: 'bounceRate' }], [], 10000, days);
    const bounceRate =
      parseFloat(bounceRateReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0').toFixed(2);
    console.log('Bounce rate:', bounceRate);

    console.log('Fetching session duration...');
    const sessionDurationReport = await runReport([{ name: 'averageSessionDuration' }], [], 10000, days);
    const avgSessionDuration = parseFloat(
      sessionDurationReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0'
    ).toFixed(2);
    console.log('Avg session duration:', avgSessionDuration);

    // Top pages
    console.log('Fetching top pages...');
    const topPagesReport = await runReport(
      [{ name: 'screenPageViews' }],
      [{ name: 'pagePath' }],
      10,
      days
    );
    const topPages = (topPagesReport[0]?.rows || [])
      .slice(0, 10)
      .map((row: any) => ({
        page: row.dimensionValues[0].value,
        views: row.metricValues[0].value,
      }));
    console.log('Top pages count:', topPages.length);

    // Daily sessions chart
    console.log('Fetching daily sessions...');
    const dailyReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'date' }],
      days > 30 ? days : 31,
      days
    );
    const dailyData = (dailyReport[0]?.rows || [])
      .map((row: any) => {
        const dateStr = row.dimensionValues[0].value;
        return {
          date: `${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
          sessions: parseInt(row.metricValues[0].value),
        };
      })
      .slice(0, days);
    console.log('Daily data points:', dailyData.length);

    // Traffic sources
    console.log('Fetching traffic sources...');
    const trafficReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'sessionSource' }],
      100,
      days
    );
    const trafficData = (trafficReport[0]?.rows || [])
      .map((row: any) => ({
        source: row.dimensionValues[0].value,
        sessions: parseInt(row.metricValues[0].value),
      }))
      .sort((a: any, b: any) => b.sessions - a.sessions)
      .slice(0, 5);
    console.log('Traffic sources count:', trafficData.length);

    // Device category
    console.log('Fetching device data...');
    const deviceReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'deviceCategory' }],
      10000,
      days
    );
    const deviceData = (deviceReport[0]?.rows || []).map((row: any) => ({
      name: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value),
    }));
    console.log('Device categories:', deviceData.length);

    // Countries
    console.log('Fetching countries...');
    const countriesReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'country' }],
      100,
      days
    );
    const countriesData = (countriesReport[0]?.rows || [])
      .map((row: any) => ({
        country: row.dimensionValues[0].value,
        sessions: parseInt(row.metricValues[0].value),
      }))
      .sort((a: any, b: any) => b.sessions - a.sessions)
      .slice(0, 5);
    console.log('Countries count:', countriesData.length);

    // Landing pages
    console.log('Fetching landing pages...');
    const landingPagesReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'pageTitle' }],
      100,
      days
    );
    const landingPages = (landingPagesReport[0]?.rows || [])
      .map((row: any) => ({
        page: row.dimensionValues[0].value,
        sessions: row.metricValues[0].value,
      }))
      .slice(0, 5);
    console.log('Landing pages count:', landingPages.length);

    // Exit pages - using pageTitle as exit pages
    console.log('Fetching exit pages (using pageTitle)...');
    const exitPagesReport = await runReport(
      [{ name: 'sessions' }],
      [{ name: 'pageTitle' }],
      100,
      days
    );
    const exitPages = (exitPagesReport[0]?.rows || [])
      .map((row: any) => ({
        page: row.dimensionValues[0].value,
        sessions: row.metricValues[0].value,
      }))
      .slice(5, 10);
    console.log('Exit pages count:', exitPages.length);

    // Events
    console.log('Fetching events...');
    const eventsReport = await runReport(
      [{ name: 'eventCount' }],
      [{ name: 'eventName' }],
      100,
      days
    );
    const events = (eventsReport[0]?.rows || [])
      .map((row: any) => ({
        event: row.dimensionValues[0].value,
        count: parseInt(row.metricValues[0].value),
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);
    console.log('Events count:', events.length);

    console.log('GA4 data fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        sessions: parseInt(sessions),
        users: parseInt(users),
        pageviews: parseInt(pageviews),
        bounceRate: parseFloat(bounceRate),
        avgSessionDuration: parseFloat(avgSessionDuration),
        topPages,
        dailyData,
        trafficData,
        deviceData,
        countriesData,
        landingPages,
        exitPages,
        events,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('GA4 API Error:', errorMessage);
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
