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

class GoogleSheetsService {
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getApiKey(): string {
    return import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || ''
  }

  private getSpreadsheetId(): string {
    return import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || ''
  }

  private isDevelopment(): boolean {
    return import.meta.env.DEV || false
  }

  private hasValidConfig(): boolean {
    const apiKey = this.getApiKey()
    const spreadsheetId = this.getSpreadsheetId()
    return apiKey.length > 0 && spreadsheetId.length > 0
  }

  async submitResults(
    keptWebsites: Array<{id: number, name: string}>,
    killedWebsites: Array<{id: number, name: string}>,
    skippedWebsites: Array<{id: number, name: string}>,
    startTime: number
  ): Promise<GoogleSheetsResponse> {
    try {
      const now = new Date()
      const totalTime = Math.round((now.getTime() - startTime) / 1000)
      
      const result: SurveyResult = {
        timestamp: now.toISOString(),
        sessionId: this.generateSessionId(),
        keptWebsites: keptWebsites.map(w => w.name),
        killedWebsites: killedWebsites.map(w => w.name),
        skippedWebsites: skippedWebsites.map(w => w.name),
        totalTime,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      }

      // If in development or no valid config, log to console
      if (this.isDevelopment() || !this.hasValidConfig()) {
        console.log('Survey Results (Development Mode):', result)
        console.log('Config status:', { 
          isDev: this.isDevelopment(), 
          hasConfig: this.hasValidConfig() 
        })
        return { success: true }
      }

      // Prepare row data for Google Sheets
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

      const apiKey = this.getApiKey()
      const spreadsheetId = this.getSpreadsheetId()
      const range = 'Sheet1!A:H'

      console.log('Submitting to Google Sheets...')

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
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}. Response: ${errorText}`)
      }

      console.log('Successfully submitted to Google Sheets')
      return { success: true }

    } catch (error) {
      console.error('Error submitting to Google Sheets:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  async createHeaders(): Promise<GoogleSheetsResponse> {
    try {
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

      if (this.isDevelopment() || !this.hasValidConfig()) {
        console.log('Headers that would be created:', headers)
        return { success: true }
      }

      const apiKey = this.getApiKey()
      const spreadsheetId = this.getSpreadsheetId()

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
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Failed to create headers: ${response.status} ${response.statusText}. Response: ${errorText}`)
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