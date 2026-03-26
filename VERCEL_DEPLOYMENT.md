# Vercel Deployment Guide for GA4 Dashboard

## Prerequisites

Before deploying to Vercel, ensure you have:
- A Vercel account (https://vercel.com)
- Git repository set up
- GA4 service account credentials (ga4-key.json)

## Step 1: Prepare Your Repository

Add the files to git (but NOT the ga4-key.json file, which should remain in .gitignore):

```bash
git add app/ package.json package-lock.json .env.local .gitignore
git commit -m "Add GA4 dashboard with Vercel-compatible credentials"
git push
```

## Step 2: Convert GA4 Credentials to Environment Variable

The GA4 credentials are stored as a JSON string in the `GA4_SERVICE_ACCOUNT_JSON` environment variable.

To get the JSON string from your ga4-key.json file:

```bash
# On macOS/Linux:
cat ga4-key.json | tr -d '\n' | pbcopy

# On Windows (PowerShell):
(Get-Content ga4-key.json -Raw) -replace '\n', '' | Set-Clipboard

# Or use cat directly:
cat ga4-key.json
# Then copy the entire output as one line
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
5. Add Environment Variables:
   - Click "Add" under Environment Variables
   - Name: `GA4_PROPERTY_ID`
   - Value: `324100242`
   - Name: `GA4_SERVICE_ACCOUNT_JSON`
   - Value: (paste the entire JSON string from Step 2)

**Important**: The `GA4_SERVICE_ACCOUNT_JSON` must be a valid JSON string on a single line. Do NOT include line breaks in the environment variable.

6. Click "Deploy"

## Step 4: Verify Deployment

After deployment:
1. Visit your Vercel project URL
2. The dashboard should load and fetch GA4 data automatically
3. Check Vercel Logs if there are any issues:
   - Go to Deployments → Select latest deployment → Logs → Function logs

## Troubleshooting

### "GA4_SERVICE_ACCOUNT_JSON environment variable is not set"

- Check that the environment variable is set in Vercel Project Settings
- Redeploy after setting the environment variable

### API returns 500 error

- Check the function logs in Vercel
- Verify the JSON string is valid (no line breaks)
- Verify GA4_PROPERTY_ID is correct

### Credentials format issue

If the JSON string appears truncated or invalid:
- Remove special characters by minifying the JSON first:
```bash
node -e "console.log(JSON.stringify(require('./ga4-key.json')))"
```
- Copy the output and paste it as the environment variable value

## Local Development

For local development, keep using `.env.local`:
- The ga4-key.json file is read as JSON string and placed in GA4_SERVICE_ACCOUNT_JSON
- See `.env.local` for the current format
- Remember: ga4-key.json is in .gitignore and won't be committed

## Production Monitoring

Monitor your GA4 API usage in Vercel:
- Go to your project → Analytics
- Check function execution times and errors
- All GA4 API calls are logged in Vercel Function Logs
