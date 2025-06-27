# Website Swiper - Deployment Guide

This guide will help you deploy the Website Swiper app to Netlify with Google Sheets integration.

## Prerequisites

1. A Netlify account
2. A Google account with access to Google Sheets
3. Node.js 18+ installed locally (for testing)

## Part 1: Setting up Google Sheets

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Website Swiper Results" (or any name you prefer)
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`
   - The ID is: `1ABC123DEF456GHI789JKL`

### 2. Set up Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this for Netlify)
4. **Important**: Restrict the API key:
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API" from the list
   - Under "Website restrictions", add your Netlify domain (e.g., `your-site-name.netlify.app`)

### 4. Make the spreadsheet public (for API access)

1. Open your Google Sheet
2. Click "Share" in the top right
3. Change access to "Anyone with the link can view"
4. Copy the sharing link

### 5. Create headers (optional)

Add these headers to row 1 of your spreadsheet:
- A1: Timestamp
- B1: Session ID  
- C1: Kept Websites
- D1: Killed Websites
- E1: Skipped Websites
- F1: Total Time (seconds)
- G1: Summary (Keep/Kill/Skip)
- H1: User Agent

## Part 2: Deploy to Netlify

### 1. Prepare your code

1. Make sure all your files are ready
2. Test locally by running `npm run dev`

### 2. Deploy to Netlify

#### Option A: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option B: Manual Deployment
1. Run `npm run build` locally
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the `dist` folder to the deployment area

### 3. Configure Environment Variables

1. In your Netlify site dashboard, go to "Site settings" > "Environment variables"
2. Add these variables:
   - `VITE_GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key
   - `VITE_GOOGLE_SPREADSHEET_ID`: Your spreadsheet ID

### 4. Redeploy

After adding environment variables, trigger a new deployment:
- If using Git: Push a new commit or click "Trigger deploy" in Netlify
- If manual: Upload the dist folder again

## Part 3: Testing

1. Visit your deployed site
2. Complete a survey by swiping through all cards
3. Check your Google Sheet to see if the data was recorded
4. If there are issues, check the browser console for errors

## Troubleshooting

### Common Issues

1. **"Failed to submit to Google Sheets" error**
   - Check that your API key is correct
   - Verify the spreadsheet ID is correct
   - Make sure the spreadsheet is public
   - Check that the Google Sheets API is enabled

2. **CORS errors**
   - Ensure your API key is restricted to your domain
   - The Google Sheets API should handle CORS automatically

3. **Environment variables not working**
   - Make sure they start with `VITE_`
   - Redeploy after adding environment variables
   - Check the variable names match exactly

### Development Mode

When running locally without proper API credentials, the app will:
- Log results to the browser console instead of Google Sheets
- Show a success message
- Continue to work normally

This allows you to test the app functionality before setting up the full integration.

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Restrict your API key to only the necessary APIs and domains
- Consider setting up more sophisticated authentication for production use

## Sample Environment Variables File

Create a `.env.local` file for local development (DO NOT commit this):

```env
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

## Data Format

The app will log the following data to your Google Sheet:
- **Timestamp**: When the survey was completed
- **Session ID**: Unique identifier for each session
- **Kept Websites**: List of websites the user chose to keep
- **Killed Websites**: List of websites the user chose to kill
- **Skipped Websites**: List of websites the user chose to skip
- **Total Time**: Time taken to complete survey (in seconds)
- **Summary**: Quick count format (e.g., "3/2/1" for 3 kept, 2 killed, 1 skipped)
- **User Agent**: Browser/device information for analytics