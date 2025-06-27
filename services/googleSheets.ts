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
    try {
      return import.meta.env?.VITE_GOOGLE_APPS_SCRIPT_URL || ''
    } catch (error) {
      console.warn('Could not access VITE_GOOGLE_APPS_SCRIPT_URL:', error)
      return ''
    }
  }

  private isDevelopment(): boolean {
    try {
      // Check multiple ways to determine if we're in development
      const isViteDev = import.meta.env?.DEV === true
      const isModeDevv = import.meta.env?.MODE === 'development'
      const isNodeDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
      
      // Check hostname for localhost
      let isLocalhost = false
      try {
        isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost') ||
                     window.location.hostname.endsWith('.local')
      } catch (e) {
        // Can't access window.location, assume not localhost
      }
      
      return isViteDev || isModeDevv || isNodeDev || isLocalhost
    } catch (error) {
      console.warn('Could not determine development mode:', error)
      return false
    }
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

      const isDev = this.isDevelopment()
      const hasConfig = this.hasValidConfig()
      const webAppUrl = this.getWebAppUrl()

      // Enhanced debugging information
      console.log('Google Sheets Service Debug Info:', {
        isDev,
        hasConfig,
        webAppUrl: webAppUrl ? 'Set (length: ' + webAppUrl.length + ')' : 'Not set',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        envMode: import.meta.env?.MODE || 'unknown',
        envDev: import.meta.env?.DEV || 'unknown'
      })

      // If in development or no valid config, log to console
      if (isDev || !hasConfig) {
        console.log('Survey Results (Development/No Config Mode):', result)
        
        if (!hasConfig) {
          console.warn('⚠️  Google Sheets submission skipped: No valid Google Apps Script URL configured')
          console.log('💡 To enable Google Sheets submission:')
          console.log('   1. Create a Google Apps Script web app')
          console.log('   2. Set VITE_GOOGLE_APPS_SCRIPT_URL in your Netlify environment variables')
          console.log('   3. URL should look like: https://script.google.com/macros/s/[SCRIPT_ID]/exec')
        }
        
        if (isDev) {
          console.log('🔧 Running in development mode - data logged to console only')
        }
        
        return { success: true }
      }

      // **CORS FIX: Use FormData instead of JSON to avoid preflight request**
      const formData = new FormData()
      formData.append('timestamp', result.timestamp)
      formData.append('sessionId', result.sessionId)
      formData.append('keptWebsites', result.keptWebsites.join(', '))
      formData.append('killedWebsites', result.killedWebsites.join(', '))
      formData.append('skippedWebsites', result.skippedWebsites.join(', '))
      formData.append('totalTime', result.totalTime.toString())
      formData.append('summary', `${result.keptWebsites.length}/${result.killedWebsites.length}/${result.skippedWebsites.length}`)
      formData.append('userAgent', result.userAgent)

      console.log('📊 Submitting to Google Sheets via Apps Script...')
      console.log('🎯 Target URL:', webAppUrl)
      console.log('🔄 Using FormData to avoid CORS preflight')

      const response = await fetch(webAppUrl, {
        method: 'POST',
        body: formData // Send as FormData instead of JSON
        // No Content-Type header - let browser set it for FormData
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Google Apps Script error: ${response.status} ${response.statusText}. Response: ${errorText}`)
      }

      const responseData = await response.json()
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Unknown error from Google Apps Script')
      }

      console.log('✅ Successfully submitted to Google Sheets via Apps Script')
      return { success: true }

    } catch (error) {
      console.error('❌ Error submitting to Google Sheets:', error)
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

      const isDev = this.isDevelopment()
      const hasConfig = this.hasValidConfig()

      if (isDev || !hasConfig) {
        console.log('Headers that would be created:', headers)
        return { success: true }
      }

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