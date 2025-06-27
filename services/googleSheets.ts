interface SurveyResult {
  timestamp: string
  sessionId: string
  keptWebsites: string[]
  killedWebsites: string[]
  skippedWebsites: string[]
  totalTime: number
  userAgent: string
}

interface GoogleSheetsResponse {
  success: boolean
  error?: string
}

// Environment variable access with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  try {
    // Check if we're in a Vite environment with import.meta.env
    if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
      return (globalThis as any).import.meta.env[key] || fallback
    }
    // Fallback for other environments
    return fallback
  } catch {
    return fallback
  }
}

class GoogleSheetsService {
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async submitResults(
    keptWebsites: Array<{id: number, name: string}>,
    killedWebsites: Array<{id: number, name: string}>,
    skippedWebsites: Array<{id: number, name: string}>,
    startTime: number
  ): Promise<GoogleSheetsResponse> {
    try {
      const apiKey = getEnvVar('VITE_GOOGLE_SHEETS_API_KEY', 'YOUR_API_KEY_HERE')
      const spreadsheetId = getEnvVar('VITE_GOOGLE_SPREADSHEET_ID', 'YOUR_SPREADSHEET_ID_HERE')
      const range = 'Sheet1!A:H'
      
      const now = new Date()
      const totalTime = Math.round((now.getTime() - startTime) / 1000) // Time in seconds
      
      const result: SurveyResult = {
        timestamp: now.toISOString(),
        sessionId: this.generateSessionId(),
        keptWebsites: keptWebsites.map(w => w.name),
        killedWebsites: killedWebsites.map(w => w.name),
        skippedWebsites: skippedWebsites.map(w => w.name),
        totalTime,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      }

      // If running in development or API key not set, just log to console
      if (apiKey === 'YOUR_API_KEY_HERE' || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        console.log('Survey Results (would be sent to Google Sheets):', result)
        return { success: true }
      }

      // Prepare the row data for Google Sheets
      const rowData = [
        result.timestamp,
        result.sessionId,
        result.keptWebsites.join(', '),
        result.killedWebsites.join(', '),
        result.skippedWebsites.join(', '),
        result.totalTime.toString(),
        `${result.keptWebsites.length}/${result.killedWebsites.length}/${result.skippedWebsites.length}`,
        result.userAgent
      ]

      // Use Google Sheets API to append the data
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to submit to Google Sheets: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  // Helper method to create the initial header row in Google Sheets
  async createHeaders(): Promise<GoogleSheetsResponse> {
    try {
      const apiKey = getEnvVar('VITE_GOOGLE_SHEETS_API_KEY', 'YOUR_API_KEY_HERE')
      const spreadsheetId = getEnvVar('VITE_GOOGLE_SPREADSHEET_ID', 'YOUR_SPREADSHEET_ID_HERE')
      
      const headers = [
        'Timestamp',
        'Session ID',
        'Kept Websites',
        'Killed Websites',
        'Skipped Websites',
        'Total Time (seconds)',
        'Summary (Keep/Kill/Skip)',
        'User Agent'
      ]

      if (apiKey === 'YOUR_API_KEY_HERE' || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        console.log('Headers that would be created:', headers)
        return { success: true }
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:H1?valueInputOption=RAW&key=${apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [headers]
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to create headers: ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error creating headers:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()