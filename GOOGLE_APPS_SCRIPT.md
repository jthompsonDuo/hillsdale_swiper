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

## Complete Google Apps Script Code (CORS Fixed)

### File: Code.gs

Copy and paste this **CORS-FIXED** code into your Google Apps Script project:

```javascript
function doPost(e) {
  try {
    // 👇 REPLACE THIS WITH YOUR ACTUAL GOOGLE SHEET ID
    const SHEET_ID = "YOUR_ACTUAL_SHEET_ID_HERE";
    
    // Add detailed logging for debugging
    console.log('=== Google Apps Script Request ===');
    console.log('Request received for doPost function');
    console.log('Post data:', e.postData);
    console.log('Parameters:', e.parameter);
    console.log('Content type:', e.postData ? e.postData.type : 'none');
    
    // **CORS FIX: Handle both JSON and FormData**
    let data;
    
    if (e.postData && e.postData.contents) {
      // Handle JSON data (from testScript)
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Parsed JSON data:', data);
      } catch (jsonError) {
        console.log('Not JSON data, checking parameters...');
        data = null;
      }
    }
    
    if (!data && e.parameter) {
      // Handle FormData (from React app - CORS fix)
      data = {
        timestamp: e.parameter.timestamp,
        sessionId: e.parameter.sessionId,
        keptWebsites: e.parameter.keptWebsites,
        killedWebsites: e.parameter.killedWebsites,
        skippedWebsites: e.parameter.skippedWebsites,
        totalTime: e.parameter.totalTime,
        summary: e.parameter.summary,
        userAgent: e.parameter.userAgent
      };
      console.log('Using FormData parameters:', data);
    }
    
    if (!data) {
      throw new Error('No valid data received (neither JSON nor FormData)');
    }
    
    // Validate required fields
    if (!data.timestamp || !data.sessionId) {
      throw new Error('Missing required fields: timestamp or sessionId');
    }
    
    // Open your Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    console.log('Sheet opened successfully');
    console.log('Sheet name:', sheet.getName());
    
    // Prepare the row data
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
    
    // Return success response with proper content type
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

// **CORS FIX: Handle GET requests too (just in case)**
function doGet(e) {
  console.log('GET request received with parameters:', e.parameter);
  
  // For GET requests, return a simple response
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Hillsdale Survey Data Collector is running',
      timestamp: new Date().toISOString(),
      note: 'Use POST method to submit survey data'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
    console.log('🧪 Testing with JSON data:', testData.postData.contents);
    
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

// Test function specifically for FormData (simulates React app)
function testFormData() {
  console.log('🧪 === Running FormData Test Function ===');
  
  // Create test data that matches your React app's FormData format
  const testData = {
    parameter: {
      timestamp: new Date().toISOString(),
      sessionId: "test-formdata-" + Math.random().toString(36).substring(7),
      keptWebsites: "Online Courses, Imprimis, Hillsdale EDU",
      killedWebsites: "unBounce, Secured Donations",
      skippedWebsites: "Official Store",
      totalTime: "180",
      summary: "3/2/1",
      userAgent: "Test User Agent - FormData Test"
    }
  };
  
  try {
    console.log('🧪 Testing with FormData parameters:', testData.parameter);
    
    const result = doPost(testData);
    const responseContent = result.getContent();
    
    console.log('🧪 FormData test result:', responseContent);
    
    const parsedResult = JSON.parse(responseContent);
    if (parsedResult.success) {
      console.log('✅ FormData Test PASSED! React app integration should work.');
      console.log('✅ Check your Google Sheet for the test row.');
      console.log('✅ Test session ID:', parsedResult.sessionId);
    } else {
      console.log('❌ FormData Test FAILED:', parsedResult.error);
      console.log('❌ Error details:', parsedResult.details);
    }
    
    return parsedResult;
    
  } catch (error) {
    console.error('❌ FormData Test FAILED with exception:', error);
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
4. **Replace all code** in the `Code.gs` file with the **CORS-FIXED** code above
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

**Run both test functions to verify everything works:**

1. **Test JSON format (like testScript):**
   - Select `testScript` from the function dropdown
   - Click Run (▶️)
   - Check for "✅ Test PASSED!" in the logs

2. **Test FormData format (like React app):**
   - Select `testFormData` from the function dropdown
   - Click Run (▶️)
   - Check for "✅ FormData Test PASSED!" in the logs

3. **Grant permissions** when prompted
4. **Verify test rows** appear in your Google Sheet

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

## CORS Fix Explanation

### What Was Wrong
Your React app was sending JSON POST requests, which trigger CORS preflight OPTIONS requests. Google Apps Script doesn't handle these preflight requests properly by default.

### How We Fixed It

**1. React App (Fixed):**
- ✅ Now sends `FormData` instead of JSON
- ✅ `FormData` requests don't trigger CORS preflight
- ✅ No `Content-Type` header needed (browser sets it automatically)

**2. Google Apps Script (Updated):**
- ✅ Handles both JSON (for testing) and FormData (for React app)
- ✅ Added `doGet` function for additional compatibility
- ✅ Added `testFormData` function to test the React app format

### Why This Works
- **FormData POST requests** are "simple requests" that don't trigger CORS preflight
- **No custom headers** needed, avoiding CORS complexity
- **Same functionality** as before, just different transport format

## Data Structure

### Data Sent from React App (NEW FORMAT)

Your React app now sends FormData with these fields:

```
timestamp: "2024-01-15T14:30:00.000Z"
sessionId: "abc123def456"
keptWebsites: "Online Courses, Imprimis"
killedWebsites: "unBounce, Secured Donations"
skippedWebsites: "Official Store"
totalTime: "180"
summary: "5/3/2"
userAgent: "Mozilla/5.0..."
```

### Data Stored in Google Sheet

Each survey completion creates one row with 8 columns as defined in the headers above.

## Debugging Functions

The script includes several debugging functions:

### `testScript()`
- **Purpose:** Test with JSON data (like internal testing)
- **Usage:** Run this function to verify basic script functionality

### `testFormData()` - **NEW!**
- **Purpose:** Test with FormData (like your React app)
- **Usage:** Run this to verify React app integration will work
- **What it does:** Simulates exactly what your React app sends

### `checkSheetSetup()`
- **Purpose:** Verify your Google Sheet configuration
- **Usage:** Run to check Sheet ID and headers

### `addHeaders()`
- **Purpose:** Automatically add headers to an empty sheet
- **Usage:** Run if you want to auto-generate headers

## Testing Your Fix

After updating both files:

1. **Deploy your updated Google Apps Script**
2. **Deploy your updated React app** (it will happen automatically)
3. **Complete a survey** on your Netlify site
4. **Check for success messages** in browser console
5. **Verify data appears** in your Google Sheet

**Expected console messages:**
```
📊 Submitting to Google Sheets via Apps Script...
🎯 Target URL: https://script.google.com/macros/s/.../exec
🔄 Using FormData to avoid CORS preflight
✅ Successfully submitted to Google Sheets via Apps Script
```

## Quick Reference

**Google Apps Script URL:** [script.google.com](https://script.google.com)  
**Environment Variable:** `VITE_GOOGLE_APPS_SCRIPT_URL`  
**Test Functions:** `testScript()` and `testFormData()`  
**Setup Function:** `checkSheetSetup()`  

**CORS Issue:** ✅ **FIXED** - React app now uses FormData instead of JSON to avoid preflight requests!