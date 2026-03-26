# Meta Ads Integration Setup Guide

## Overview

The dashboard now includes a Meta Ads section that displays performance metrics from your Meta Ads account (act_758453352613130) for the last 30 days.

### Metrics Displayed

- **Total Spend**: Total campaign spending in USD
- **Impressions**: Total ad impressions
- **Clicks**: Total ad clicks
- **Average CTR**: Average click-through rate
- **Active Campaigns**: Number of active campaigns
- **Top 5 Campaigns**: Detailed breakdown of top campaigns by spending

## Getting Your Meta Access Token

### Step 1: Create a Facebook App

1. Go to [Meta Developers](https://developers.facebook.com)
2. Click "Get Started" or sign in to your account
3. Navigate to "Apps" → "Create App"
4. Choose "Business" as the app type
5. Fill in the app details and create the app

### Step 2: Add Marketing API

1. In your app dashboard, click "Add Product"
2. Search for "Marketing API"
3. Click "Set Up" to add it to your app

### Step 3: Get Your Access Token

#### Option A: Generate Personal Token (for development/testing)

1. Go to your app's **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**
3. Go to **Tools** → **Graph API Explorer**
4. Select your app from the dropdown
5. Click "Generate Access Token"
6. Grant permissions:
   - `ads_read`
   - `business_management`
7. Copy the generated token

#### Option B: Generate Long-Lived Token (for production)

1. Get a short-lived token using Option A
2. Use this token to generate a long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

Replace:
- `YOUR_APP_ID`: Your app's ID
- `YOUR_APP_SECRET`: Your app's secret
- `SHORT_LIVED_TOKEN`: The token from Option A

3. Use the `access_token` from the response

### Step 4: Verify Access Token Permissions

Make sure your token has these required permissions:
- `ads_read` - to read ad account data
- `business_management` - to access business accounts

To check your token's permissions:
```bash
curl -X GET "https://graph.facebook.com/debug_token?input_token=YOUR_ACCESS_TOKEN&access_token=YOUR_ACCESS_TOKEN"
```

## Local Development Setup

1. Open `.env.local` in your project
2. Add or update the Meta access token:

```
META_ACCESS_TOKEN=your_access_token_here
```

3. Restart your development server:

```bash
npm run dev
```

4. Visit `http://localhost:3000` - the Meta Ads section should now display your data

## Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `META_ACCESS_TOKEN`
   - **Value**: (paste your access token)
4. Select which environments it applies to (Production, Preview, Development)
5. Click **Save**
6. Redeploy your project

## Troubleshooting

### "Invalid OAuth access token" Error

- **Cause**: The access token in `.env.local` or Vercel is invalid or expired
- **Solution**:
  - Generate a new long-lived token (Option B above)
  - Update `.env.local` or Vercel environment variables
  - Restart the development server or redeploy

### "Invalid Ad Account ID" Error

- **Cause**: The ad account ID (`act_758453352613130`) may not be accessible with your token
- **Solution**:
  - Verify you have admin access to this ad account in Meta Ads Manager
  - Check that your app has the `ads_read` permission
  - Ensure your token hasn't expired

### No Data Displayed

- **Cause**: Your campaigns may not have any data for the last 30 days, or the connection failed
- **Solution**:
  - Check the browser console for error messages
  - Verify the access token is set correctly
  - Check Vercel Function Logs for detailed error messages

### "Warning: Could not load Meta Ads data"

- **Cause**: The API returned an error but GA4 data loaded fine
- **Solution**:
  - The Meta integration is optional - your dashboard works without it
  - Check your access token is valid
  - Review troubleshooting steps above

## API Endpoints

### `/api/meta` - Fetch Meta Ads Data

**Method**: GET
**Parameters**: None (configuration is in environment variables)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalSpend": 1234.56,
    "totalImpressions": 50000,
    "totalClicks": 2500,
    "averageCtr": 5.00,
    "activeCampaigns": 8,
    "topCampaigns": [
      {
        "name": "Campaign Name",
        "spend": 500.00,
        "impressions": 15000,
        "clicks": 750,
        "ctr": "5.00"
      }
    ],
    "dateRange": {
      "from": "2026-02-24",
      "to": "2026-03-26"
    }
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Meta API Error: [error message]"
}
```

## Important Notes

⚠️ **Security**:
- Never commit your access token to version control
- Keep your access token confidential
- Use long-lived tokens for production
- Rotate tokens periodically for security

✅ **Permissions**:
- Your app must have business account access
- The ad account must be accessible to your business account
- Your user account must have admin permissions on the ad account

📊 **Data Accuracy**:
- Data is from the last 30 days
- Metrics are aggregated across all active campaigns
- Updates may take 24-48 hours in Meta's reporting system

## Migration from Local to Production

1. Generate a long-lived token (if using short-lived token locally)
2. Update Vercel environment variables with new token
3. Redeploy your application
4. Monitor Vercel logs for any errors
5. Test the Meta Ads section on your live deployment

## Support

For issues with:
- **Meta API**: [Meta Business Help Center](https://www.facebook.com/help)
- **Dashboard**: Check the application logs and error messages
- **Access Token Issues**: Review Meta's [access token documentation](https://developers.facebook.com/docs/facebook-login/access-tokens)
