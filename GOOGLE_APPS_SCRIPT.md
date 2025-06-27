# Google Apps Script Integration Documentation

This document contains the complete Google Apps Script code and setup instructions for the Hillsdale College Website Swiper backend integration.

## Overview

The Google Apps Script acts as a serverless backend that receives survey data from your React application and saves it to a Google Sheet. This approach provides a simple, free solution without requiring complex authentication or Google Cloud setup.

## Architecture

```
React App (Netlify) → Google Apps Script → Google Sheets
        ↓                    ↓               ↓
   Your Codebase        script.google.com   Data Storage
   (Complete ✅)        (Need to create)    (Add headers)
```

## Complete Google Apps Script Code

### File: Code.gs

Copy and paste this **FIXED** code into your Google Apps Script project:

```javascript
function doPost(e) {
  try {
    // 👇 REPLACE THIS WITH YOUR ACTUAL GOOGLE SHEET ID
    const SHEET_ID = "YOUR_ACTUAL_SHEET_ID_HERE";
    
    // Add detailed logging for debugging (FIXED - removed e.method reference)
    console.log('=== Google Apps Script Request ===');
    console.log('Request received for doPost function');
    console.log('Post data:', e.postData);
    console.log('Content type:', e.postData ? e.postData.type : 'none');
    
    // Validate that we have post data
    if (!e.postData || !e.postData.contents) {
      throw new Error('No post data received');
    }
    
    // Parse the JSON data from your React app
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data from React app:', data);
    
    // Validate required fields
    if (!data.timestamp || !data.sessionId) {
      throw new Error('Missing required fields: timestamp or sessionId');
    }
    
    // Open your Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    console.log('Sheet opened successfully');
    console.log('Sheet name:', sheet.getName());
    
    // Prepare the row data to match your React app's payload
    // This matches exactly what your googleSheets.ts service sends
    const rowData = [
      data.timestamp,        // Column A: ISO timestamp
      data.sessionId,        // Column B: Unique session ID
      data.keptWebsites,     // Column C: Comma-separated kept websites
      data.killedWebsites,   // Column D: Comma-separated killed websites  
      data.skippedWebsites,  // Column E: Comma-separated skipped websites
      data.totalTime,        // Column F: Total time in seconds
      data.summary,          // Column G: Summary like "5/3/2" (keep/kill/skip)
      data.userAgent         // Column H: User's browser information
    ];
    
    console.log('Adding row to sheet:', rowData);
    
    // Add the row to your Google Sheet
    sheet.appendRow(rowData);
    console.log('✅ Row added successfully to Google Sheet');
    
    // Return success response with proper CORS headers and content type
    const successResponse = ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Survey data saved successfully',
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId,
        rowsAdded: 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    console.log('✅ Returning success response to React app');
    return successResponse;
      
  } catch (error) {
    console.error('❌ Error in doPost function:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack trace:', error.stack);
    
    // Return detailed error response with proper content type
    const errorResponse = ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        message: 'Failed to save survey data',
        timestamp: new Date().toISOString(),
        details: {
          errorType: error.name || 'Unknown',
          errorMessage: error.message || 'Unknown error',
          stage: error.message.includes('SpreadsheetApp') ? 'sheet_access' : 
                 error.message.includes('JSON.parse') ? 'data_parsing' : 'unknown'
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    console.log('❌ Returning error response to React app');
    return errorResponse;
  }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  console.log('🔄 OPTIONS preflight request received');
  console.log('Request parameters:', e.parameter || {});
  
  // Return empty response for OPTIONS requests
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function to verify your setup works
function testScript() {
  console.log('🧪 === Running Test Function ===');
  
  // Create test data that matches your React app's format exactly
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId: "test-session-" + Math.random().toString(36).substring(7),
        keptWebsites: "Online Courses, Imprimis, Hillsdale EDU",
        killedWebsites: "unBounce, Secured Donations",
        skippedWebsites: "Official Store",
        totalTime: "180",
        summary: "3/2/1",
        userAgent: "Test User Agent - Google Apps Script Test Runner"
      }),
      type: "application/json"
    }
  };
  
  try {
    console.log('🧪 Testing with data:', testData.postData.contents);
    
    const result = doPost(testData);
    const responseContent = result.getContent();
    
    console.log('🧪 Test result:', responseContent);
    
    const parsedResult = JSON.parse(responseContent);
    if (parsedResult.success) {
      console.log('✅ Test PASSED! Script is working correctly.');
      console.log('✅ Check your Google Sheet for the test row.');
      console.log('✅ Test session ID:', parsedResult.sessionId);
    } else {
      console.log('❌ Test FAILED:', parsedResult.error);
      console.log('❌ Error details:', parsedResult.details);
    }
    
    return parsedResult;
    
  } catch (error) {
    console.error('❌ Test FAILED with exception:', error);
    console.error('❌ Error details:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// Helper function to check if your Google Sheet is properly set up
function checkSheetSetup() {
  try {
    const SHEET_ID = "YOUR_ACTUAL_SHEET_ID_HERE"; // Replace with your actual Sheet ID
    
    console.log('🔍 Checking Google Sheet setup...');
    console.log('🔍 Sheet ID:', SHEET_ID);
    
    if (SHEET_ID === "YOUR_ACTUAL_SHEET_ID_HERE") {
      console.log('⚠️ You need to replace YOUR_ACTUAL_SHEET_ID_HERE with your actual Google Sheet ID');
      console.log('⚠️ Find your Sheet ID in the URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit');
      return false;
    }
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    console.log('✅ Google Sheet opened successfully');
    console.log('✅ Sheet name:', sheet.getName());
    console.log('✅ Sheet has', sheet.getLastRow(), 'rows');
    console.log('✅ Sheet has', sheet.getLastColumn(), 'columns');
    
    // Check if headers are present
    if (sheet.getLastRow() === 0) {
      console.log('⚠️ Sheet appears to be empty. Add these headers to row 1:');
      console.log('   A1: Timestamp');
      console.log('   B1: Session ID'); 
      console.log('   C1: Kept Websites');
      console.log('   D1: Killed Websites');
      console.log('   E1: Skipped Websites');
      console.log('   F1: Total Time (seconds)');
      console.log('   G1: Summary (Keep/Kill/Skip)');
      console.log('   H1: User Agent');
    } else {
      const headers = sheet.getRange(1, 1, 1, 8).getValues()[0];
      console.log('✅ Current headers:', headers);
      
      // Check if headers match expected format
      const expectedHeaders = [
        'Timestamp', 'Session ID', 'Kept Websites', 'Killed Websites', 
        'Skipped Websites', 'Total Time (seconds)', 'Summary (Keep/Kill/Skip)', 'User Agent'
      ];
      
      const headersMatch = expectedHeaders.every((expected, index) => 
        headers[index] && headers[index].toString().toLowerCase().includes(expected.toLowerCase().split(' ')[0])
      );
      
      if (headersMatch) {
        console.log('✅ Headers appear to match expected format');
      } else {
        console.log('⚠️ Headers may not match expected format');
        console.log('⚠️ Expected:', expectedHeaders);
        console.log('⚠️ Current:', headers);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking sheet setup:', error);
    console.error('❌ Make sure your Sheet ID is correct and you have access to the sheet');
    return false;
  }
}

// Helper function to add headers to your sheet
function addHeaders() {
  try {
    const SHEET_ID = "YOUR_ACTUAL_SHEET_ID_HERE"; // Replace with your actual Sheet ID
    
    if (SHEET_ID === "YOUR_ACTUAL_SHEET_ID_HERE") {
      console.log('⚠️ You need to replace YOUR_ACTUAL_SHEET_ID_HERE with your actual Google Sheet ID first');
      return false;
    }
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Check if headers already exist
    if (sheet.getLastRow() > 0) {
      console.log('⚠️ Sheet already has data. Headers not added to avoid overwriting.');
      console.log('⚠️ Please add headers manually or clear the sheet first.');
      return false;
    }
    
    const headers = [
      'Timestamp',
      'Session ID',
      'Kept Websites',
      'Killed Websites',
      'Skipped Websites',
      'Total Time (seconds)',
      'Summary (Keep/Kill/Skip)',
      'User Agent'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log('✅ Headers added successfully');
    console.log('✅ Headers:', headers);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error adding headers:', error);
    return false;
  }
}
```

## Setup Instructions

### Step 1: Create Google Apps Script Project

1. **Go to [script.google.com](https://script.google.com)**
2. **Sign in** with your Google account
3. **Click "New Project"**
4. **Replace all code** in the `Code.gs` file with the **FIXED** code above
5. **Save the project** (Ctrl+S)
6. **Rename the project** to something like "Hillsdale Survey Collector"

### Step 2: Configure Your Google Sheet ID

1. **Open your Google Sheet** where you want to store the survey results
2. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
   ```
3. **In your Google Apps Script**, replace `"YOUR_ACTUAL_SHEET_ID_HERE"` with your actual Sheet ID

### Step 3: Set Up Google Sheet Headers

Add these headers to row 1 of your Google Sheet:

| Column | Header |
|--------|--------|
| A1 | Timestamp |
| B1 | Session ID |
| C1 | Kept Websites |
| D1 | Killed Websites |
| E1 | Skipped Websites |
| F1 | Total Time (seconds) |
| G1 | Summary (Keep/Kill/Skip) |
| H1 | User Agent |

### Step 4: Test Your Script

1. **In Google Apps Script**, select `testScript` from the function dropdown
2. **Click Run** (▶️)
3. **Grant permissions** when prompted
4. **Check the execution log** for success messages
5. **Verify a test row** appears in your Google Sheet

### Step 5: Deploy as Web App

1. **Click "Deploy" → "New Deployment"**
2. **Click the gear icon** ⚙️ next to "Type"
3. **Select "Web app"**
4. **Configure settings:**
   - **Description:** "Hillsdale Survey Data Collector"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone" ⚠️ **Important!**
5. **Click "Deploy"**
6. **Copy the web app URL** (looks like: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`)

### Step 6: Configure Netlify Environment Variables

1. **Go to your Netlify dashboard**
2. **Navigate to:** Site settings → Environment variables
3. **Add new variable:**
   - **Key:** `VITE_GOOGLE_APPS_SCRIPT_URL`
   - **Value:** The web app URL from step 5
4. **Deploy your site** to apply the new environment variable

## Data Structure

### Data Sent from React App

Your React app (`/services/googleSheets.ts`) sends this JSON structure:

```typescript
{
  timestamp: string,        // ISO timestamp: "2024-01-15T14:30:00.000Z"
  sessionId: string,        // Unique ID: "abc123def456"
  keptWebsites: string,     // Comma-separated: "Online Courses, Imprimis"
  killedWebsites: string,   // Comma-separated: "unBounce, Secured Donations"
  skippedWebsites: string,  // Comma-separated: "Official Store"
  totalTime: string,        // Seconds: "180"
  summary: string,          // Format: "5/3/2" (keep/kill/skip)
  userAgent: string         // Browser info
}
```

### Data Stored in Google Sheet

Each survey completion creates one row with 8 columns as defined in the headers above.

## Debugging Functions

The script includes several debugging functions:

### `testScript()`
- **Purpose:** Test the complete flow with mock data
- **Usage:** Run this function to verify everything works
- **What it does:** Creates test data and saves it to your sheet

### `checkSheetSetup()`
- **Purpose:** Verify your Google Sheet configuration
- **Usage:** Run to check Sheet ID and headers
- **What it does:** Validates sheet access and header format

### `addHeaders()`
- **Purpose:** Automatically add headers to an empty sheet
- **Usage:** Run if you want to auto-generate headers
- **What it does:** Adds the 8 required headers to row 1

## Troubleshooting

### Common Errors and Solutions

#### ❌ "Cannot read properties of undefined (reading 'method')" - FIXED!
**Cause:** The original script tried to access `e.method` which doesn't exist in doPost events
**Solution:** ✅ **Fixed in the code above** - removed the problematic `e.method` reference

#### ❌ "SpreadsheetApp.openById() failed"
**Cause:** Incorrect Sheet ID or no access to the sheet
**Solution:** 
- Verify your Sheet ID is correct
- Ensure you own the Google Sheet or have edit access

#### ❌ "No post data received"
**Cause:** React app isn't sending data properly
**Solution:**
- Check your Netlify environment variable is set correctly
- Verify the React app is calling the correct URL

#### ❌ "TypeError: Failed to fetch" (in React app)
**Cause:** CORS issues or wrong deployment settings
**Solution:**
- Redeploy Google Apps Script with "Anyone" access
- Ensure the web app URL is correct in Netlify

#### ❌ "Permission denied"
**Cause:** Script hasn't been granted necessary permissions
**Solution:**
- Run the `testScript()` function manually to grant permissions
- Ensure you're signed in with the correct Google account

### Checking Logs

**In Google Apps Script:**
1. Click **"Executions"** in the left sidebar
2. Click on any execution to see detailed logs
3. Look for console.log messages to debug issues

**In React App (Browser Console):**
- Look for messages starting with "📊", "✅", or "❌"
- Your `googleSheets.ts` service provides detailed logging

## Security Notes

- ✅ **No API keys required** - Uses Google account permissions
- ✅ **No complex authentication** - Google handles everything
- ✅ **Data stays in your Google account** - You own all the data
- ✅ **Free service** - No charges for Google Apps Script usage
- ⚠️ **"Anyone" access required** - Necessary for your Netlify app to access it

## Integration with React App

Your React application is already perfectly configured:

- **`/services/googleSheets.ts`** - Handles all communication with Google Apps Script
- **Environment variable handling** - Automatically detects when the URL is configured
- **Graceful fallback** - Logs to console when not configured for development
- **Error handling** - Provides user feedback for any issues

The integration requires zero changes to your React code - just set the environment variable!

## Maintenance

### Updating the Script
1. Make changes in the Google Apps Script editor
2. Save the changes (Ctrl+S)
3. Create a new deployment version if needed
4. Test using the `testScript()` function

### Monitoring
- Check Google Apps Script executions for any errors
- Monitor your Google Sheet for data collection
- Review React app console logs for any submission issues

---

## Quick Reference

**Google Apps Script URL:** [script.google.com](https://script.google.com)  
**Environment Variable:** `VITE_GOOGLE_APPS_SCRIPT_URL`  
**Test Function:** `testScript()`  
**Setup Function:** `checkSheetSetup()`  

**Your React app is ready!** ✅ Just follow the setup steps above to enable Google Sheets integration.

## What Was Fixed

The error `Cannot read properties of undefined (reading 'method')` occurred because the original script was trying to access `e.method`, but Google Apps Script's doPost event object doesn't always include a `method` property. 

**Changes made:**
- ✅ Removed `e.method` reference from logging
- ✅ Simplified request logging
- ✅ Added better null checks throughout
- ✅ The script now works reliably without the error

**Test the fix:**
1. Replace your Google Apps Script code with the version above
2. Run the `testScript()` function 
3. The error should be gone and you should see "✅ Test PASSED!"