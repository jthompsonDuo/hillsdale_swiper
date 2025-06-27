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

  private getWebAppUrl(): string {
    return import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || ''
  }

  private isDevelopment(): boolean {
    return import.meta.env.DEV || false
  }

  private hasValidConfig(): boolean {
    const webAppUrl = this.getWebAppUrl()
    return webAppUrl.length > 0 && webAppUrl.includes('script.google.com')
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
          hasConfig: this.hasValidConfig(),
          webAppUrl: this.getWebAppUrl()
        })
        return { success: true }
      }

      // Prepare data for Google Apps Script
      const payload = {
        timestamp: result.timestamp,
        sessionId: result.sessionId,
        keptWebsites: result.keptWebsites.join(', '),
        killedWebsites: result.killedWebsites.join(', '),
        skippedWebsites: result.skippedWebsites.join(', '),
        totalTime: result.totalTime.toString(),
        summary: `${result.keptWebsites.length}/${result.killedWebsites.length}/${result.skippedWebsites.length}`,
        userAgent: result.userAgent
      }

      const webAppUrl = this.getWebAppUrl()

      console.log('Submitting to Google Apps Script...')

      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Google Apps Script error: ${response.status} ${response.statusText}. Response: ${errorText}`)
      }

      const responseData = await response.json()
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Unknown error from Google Apps Script')
      }

      console.log('Successfully submitted to Google Sheets via Apps Script')
      return { success: true }

    } catch (error) {
      console.error('Error submitting to Google Sheets:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  // Keep this method for potential future use, but it's not needed with Apps Script approach
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

      // For Apps Script approach, headers should be manually added to the sheet
      // or you can extend the Apps Script to handle header creation
      console.log('Note: Headers should be manually added to your Google Sheet:', headers)
      return { success: true }

    } catch (error) {
      console.error('Error with headers:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()