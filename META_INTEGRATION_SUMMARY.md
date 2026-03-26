# Meta Ads Integration - Summary

## What Was Added

### 1. New API Route: `/api/meta`
- **File**: `app/api/meta/route.ts`
- **Purpose**: Fetches Meta Ads data from Facebook Graph API
- **Data Fetched** (last 30 days):
  - Total spend (USD)
  - Total impressions
  - Total clicks
  - Average CTR
  - Number of active campaigns
  - Top 5 campaigns breakdown

### 2. Updated Dashboard Component
- **File**: `app/page.tsx`
- **Changes**:
  - Added `MetaData` interface
  - Added Meta data state management
  - Added error handling for Meta API
  - Displays Meta Ads section below GA4 section with:
    - 5 metric cards (Spend, Impressions, Clicks, Avg CTR, Active Campaigns)
    - Top 5 Campaigns table showing performance details

### 3. Environment Configuration
- **File**: `.env.local`
- **Added**: `META_ACCESS_TOKEN=your_meta_access_token_here`
- **Purpose**: Stores Meta API authentication token

### 4. Dependencies
- **Installed**: None new (uses native fetch API)
- **Already Available**:
  - `facebook-nodejs-business-sdk` (installed but uses REST API directly)
  - Recharts (for future charts if needed)

## Features

### Dashboard Section: "Meta Ads Performance"
Located below the GA4 section with:

**Metric Cards** (same styling as GA4):
- 🔴 Total Spend (pink)
- 🔵 Impressions (cyan)
- 🔷 Clicks (indigo)
- ✨ Average CTR (lime)
- 🎯 Active Campaigns (rose)

**Data Table**: Top 5 campaigns showing:
- Campaign name
- Spend (USD)
- Impressions
- Clicks
- CTR (%)

**Account Info**: Displays ad account ID and date range

## API Structure

### Request
```
GET /api/meta
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "totalSpend": 1234.56,
    "totalImpressions": 50000,
    "totalClicks": 2500,
    "averageCtr": 5.00,
    "activeCampaigns": 8,
    "topCampaigns": [...],
    "dateRange": {
      "from": "2026-02-24",
      "to": "2026-03-26"
    }
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Meta API Error: [error message]"
}
```

## Technical Details

### API Endpoints Used
1. `/insights` - Gets aggregated metrics for the ad account
2. `/campaigns` - Gets list of active campaigns
3. `/campaigns` with insights - Gets per-campaign performance data

### Rate Limits
- Meta Graph API has rate limits (varies by subscription)
- Dashboard makes 3 API calls per request
- Consider caching results if rate limits are hit

### Error Handling
- Missing token displays warning section
- Invalid token shows detailed error message
- GA4 section functions independently of Meta

## Deployment

### For Vercel
1. See `VERCEL_DEPLOYMENT.md` for GA4 setup
2. See `META_SETUP.md` for Meta access token setup
3. Add `META_ACCESS_TOKEN` to Vercel environment variables
4. Both APIs will fail gracefully if tokens are missing/invalid

### Environment Variables Required
- `GA4_PROPERTY_ID`: Google Analytics property ID
- `GA4_SERVICE_ACCOUNT_JSON`: GA4 service account credentials (JSON string)
- `META_ACCESS_TOKEN`: Meta/Facebook access token (for ad account access)

## Usage

### Local Development
1. Set `META_ACCESS_TOKEN` in `.env.local`
2. Run `npm run dev`
3. Access `http://localhost:3000`

### Production (Vercel)
1. Set `META_ACCESS_TOKEN` in Vercel environment variables
2. Deploy with `git push`
3. Access your production URL

## Future Enhancements

Possible additions:
- Campaign performance charts (line graph of spend over time)
- Cost per click (CPC) and cost per impression (CPM) metrics
- Campaign breakdown by objective or platform
- Conversion data (if using conversion tracking)
- Year-over-year comparison
- Budget remaining / daily budget display

## Files Modified

| File | Changes |
|------|---------|
| `app/api/meta/route.ts` | **NEW** - Meta API implementation |
| `app/page.tsx` | Added Meta data fetching & display section |
| `.env.local` | Added `META_ACCESS_TOKEN` variable |
| `package.json` | Added `facebook-nodejs-business-sdk` (optional) |

## Getting Started with Meta Integration

1. Read `META_SETUP.md` for complete setup instructions
2. Generate your Meta access token
3. Update `.env.local` with the token
4. Restart development server
5. Dashboard will show Meta Ads data

## Troubleshooting

See `META_SETUP.md` troubleshooting section for:
- Invalid access token errors
- Missing ad account access
- No data displays
- Warning messages

---

**Status**: ✅ Ready for local testing with valid access token
**Production Ready**: ✅ Yes, with proper environment variable configuration
