# AI Analysis Feature - Debugging Guide

## ✅ What Was Implemented

The AI analysis feature has been fully implemented with comprehensive debugging:

### Backend Changes (app/api/analyze/route.ts)
- ✅ Receives GA4 and Meta Ads data via POST
- ✅ Validates ANTHROPIC_API_KEY environment variable
- ✅ Creates Anthropic client and calls Claude API
- ✅ Generates two sections of analysis (Data Analysis + Agency Guide)
- ✅ Comprehensive console.log statements for debugging

### Frontend Changes (app/page.tsx)
- ✅ `handleAnalyze` function with detailed logging
- ✅ Error state display (red alert box)
- ✅ Loading state (spinning button)
- ✅ Success state (blue + orange analysis panels)
- ✅ Data validation before sending to API

## 🔴 Most Common Issue

**The button doesn't work because ANTHROPIC_API_KEY is missing!**

### Solution: Add Your Anthropic API Key

1. **Get your API key:**
   - Go to https://console.anthropic.com
   - Create API key
   - Copy the key (starts with `sk_`)

2. **Add to .env.local:**
   ```
   ANTHROPIC_API_KEY=sk_your_actual_key_here
   ```

   Replace the commented line:
   ```
   # ANTHROPIC_API_KEY=sk_your_key_here
   ```

3. **Restart dev server:**
   ```
   npm run dev
   ```

## 🐛 Troubleshooting Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab and click "Analizează datele cu AI" button

You should see:
```
Handle analyze called
Data available: {data: {...}, metaData: {...}}
Sending payload to /api/analyze: {...}
```

### Step 2: Check Network Tab
DevTools → Network tab → look for `/api/analyze` request
- ✅ Status 200 = Success (check response)
- ❌ Status 500 = Server error (check next step)
- ❌ No request = handleAnalyze not called (check onClick binding)

### Step 3: Check Server Logs
When running `npm run dev`, watch the terminal for console.log output:

```
Analyze API called
ANTHROPIC_API_KEY exists: false  <-- THIS IS THE PROBLEM!
```

If it says `false`, the API key is missing from .env.local

### Step 4: Check Error Message
Look for red alert box on page after clicking button. It should display:
- `"ANTHROPIC_API_KEY environment variable is not set"` → Add API key to .env.local
- `"Failed to authenticate"` → Check API key is correct
- Network error → Check internet connection

## 🔍 Expected Flow

### When Button Clicked:
1. ✅ Browser console shows: "Handle analyze called"
2. ✅ Browser console shows: "Data available: {...}"
3. ✅ Browser console shows: "Sending payload to /api/analyze: {...}"
4. ✅ Server receives POST request
5. ✅ Server validates ANTHROPIC_API_KEY exists
6. ✅ Server calls Anthropic API
7. ✅ Server receives response from Claude
8. ✅ Server returns two sections
9. ✅ Frontend displays blue panel (Analysis) + orange panel (Agency Guide)

### When Something Fails:
1. ✅ Red alert box appears with error message
2. ✅ Browser console shows error details
3. ✅ Server logs show what went wrong

## 📋 Environment Setup Checklist

- [ ] ANTHROPIC_API_KEY added to .env.local
- [ ] API key starts with `sk_`
- [ ] Dev server restarted after .env.local change
- [ ] No trailing/leading spaces in API key
- [ ] Browser cache cleared (Ctrl+Shift+Delete or DevTools → Application → Clear Site Data)

## 🚀 Testing the Feature

Once .env.local is set up:

1. Go to http://localhost:3000
2. Wait for GA4 and Meta Ads data to load
3. Click "Analizează datele cu AI" button
4. Button should show loading state
5. After 10-30 seconds, two panels appear:
   - **Blue panel** (📊 Analiza datelor)
   - **Orange panel** (📋 Ce să ceri agenției)

## 📊 Console Output Examples

### ✅ SUCCESS
```
Handle analyze called
Data available: {data: {sessions: 1234, ...}, metaData: {...}}
Sending payload to /api/analyze: {ga4Data: {...}, metaData: {...}}
Response status: 200
Response result: {success: true, analysis: "...", agencyGuide: "..."}
Analysis successful
```

### ❌ MISSING API KEY
```
Analyze API called
ANTHROPIC_API_KEY exists: false
Analysis error: ANTHROPIC_API_KEY environment variable is not set
Response status: 500
```

### ❌ INVALID API KEY
```
Analyze API called
ANTHROPIC_API_KEY exists: true
Analysis error: Invalid API key provided
Response status: 500
```

## 🔧 Advanced Debugging

### If data doesn't load:
- Check if GA4_PROPERTY_ID is correct in .env.local
- Check if GA4_SERVICE_ACCOUNT_JSON is valid JSON
- Check if META_ACCESS_TOKEN has expired
- Check browser Network tab for /api/ga4 and /api/meta errors

### If build fails:
```bash
npm run build
```
Should show ✓ without errors

### If dev server crashes:
1. Kill all Node processes
2. Delete `node_modules/.bin/next`
3. Run `npm run dev` again

## 📞 Need Help?

1. Check browser console (F12)
2. Check server logs in terminal
3. Check .env.local has correct values
4. Read error message carefully
5. Follow troubleshooting steps above
