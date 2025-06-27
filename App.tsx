import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SwipeCard } from './components/SwipeCard'
import { Heart, RotateCcw, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './components/ui/button'
import { googleSheetsService } from './services/googleSheets'

interface Website {
  id: number
  name: string
  description: string
  category: string
}

const mockWebsites: Website[] = [
  {
    id: 1,
    name: "Online Courses",
    description: "Access to Hillsdale's acclaimed online courses covering history, literature, politics, and more",
    category: "Education"
  },
  {
    id: 2,
    name: "Secured Donations",
    description: "Secure donation platform supporting Hillsdale College's mission and programs",
    category: "Fundraising"
  },
  {
    id: 3,
    name: "unBounce",
    description: "Landing page optimization and marketing tools for college communications",
    category: "Technology"
  },
  {
    id: 4,
    name: "Hillsdale EDU",
    description: "Main educational platform and academic resources for students and faculty",
    category: "Education"
  },
  {
    id: 5,
    name: "Imprimis",
    description: "Hillsdale's monthly speech digest featuring lectures from leading conservative thinkers",
    category: "Publications"
  },
  {
    id: 6,
    name: "Chargers",
    description: "Hillsdale College athletic teams and sports programs",
    category: "Athletics"
  },
  {
    id: 7,
    name: "Official Store",
    description: "Official Hillsdale College merchandise, apparel, and branded items",
    category: "Merchandise"
  },
  {
    id: 8,
    name: "Freedom Library",
    description: "Digital library of resources on American history, constitution, and freedom",
    category: "Library"
  },
  {
    id: 9,
    name: "Hillsdale K12",
    description: "K-12 education resources and curriculum support for classical education",
    category: "Education"
  },
  {
    id: 10,
    name: "Hillsdale DC",
    description: "Washington D.C. campus and programs for government and policy studies",
    category: "Campus"
  },
  {
    id: 11,
    name: "The Collegian",
    description: "Student-run newspaper covering campus news, sports, and student life",
    category: "Publications"
  },
  {
    id: 12,
    name: "Blake Center for Faith and Freedom",
    description: "Academic center exploring the intersection of faith, freedom, and public policy",
    category: "Academic Center"
  },
  {
    id: 13,
    name: "Events",
    description: "Campus events, lectures, conferences, and special programs",
    category: "Campus Life"
  },
  {
    id: 14,
    name: "Radio Free Hillsdale Hour",
    description: "Weekly radio program discussing current events and conservative principles",
    category: "Media"
  },
  {
    id: 15,
    name: "Military History and Grand Strategy",
    description: "Academic program studying military history and strategic thinking",
    category: "Academic Program"
  },
  {
    id: 16,
    name: "Choral Scholars Program",
    description: "Elite vocal scholarship program combining musical excellence with liberal arts education",
    category: "Arts"
  },
  {
    id: 17,
    name: "Halter Membership",
    description: "Exclusive membership program for Hillsdale supporters and alumni",
    category: "Community"
  },
  {
    id: 18,
    name: "Experimental Philosophy of Religion",
    description: "Innovative academic program exploring religious questions through philosophical methods",
    category: "Academic Program"
  },
  {
    id: 19,
    name: "Center for Commerce and Freedom",
    description: "Research center studying free market economics and business principles",
    category: "Academic Center"
  },
  {
    id: 20,
    name: "Charger Athletics",
    description: "Comprehensive athletics program with NCAA Division II sports teams",
    category: "Athletics"
  },
  {
    id: 21,
    name: "Nimrod Center",
    description: "Academic center focused on outdoor education and environmental studies",
    category: "Academic Center"
  },
  {
    id: 22,
    name: "Slate",
    description: "Student publication covering campus culture, opinions, and creative writing",
    category: "Publications"
  },
  {
    id: 23,
    name: "Hillsdale College Podcast Network",
    description: "Network of podcasts featuring faculty, students, and thought leaders",
    category: "Media"
  },
  {
    id: 24,
    name: "Churchill",
    description: "Winston Churchill studies program and historical research initiative",
    category: "Academic Program"
  },
  {
    id: 25,
    name: "Statesmanship",
    description: "Program developing principled leadership and public service skills",
    category: "Academic Program"
  },
  {
    id: 26,
    name: "k12 at Home",
    description: "Homeschool curriculum and resources based on classical education principles",
    category: "Education"
  },
  {
    id: 27,
    name: "Jobs at Hillsdale",
    description: "Employment opportunities and career services at Hillsdale College",
    category: "Employment"
  },
  {
    id: 28,
    name: "Graduate School of Education",
    description: "Master's degree programs for educators focused on classical pedagogy",
    category: "Education"
  },
  {
    id: 29,
    name: "Halter Shooting Sports",
    description: "Competitive shooting sports program and training facilities",
    category: "Recreation"
  },
  {
    id: 30,
    name: "Academy",
    description: "Pre-college academic programs and preparatory courses",
    category: "Education"
  },
  {
    id: 31,
    name: "Dow Center",
    description: "Academic center for entrepreneurship and business education",
    category: "Academic Center"
  },
  {
    id: 32,
    name: "Mossey Library",
    description: "Main campus library with extensive research collections and study spaces",
    category: "Library"
  },
  {
    id: 33,
    name: "Rockwell",
    description: "Campus facility or program supporting student activities and services",
    category: "Campus Life"
  }
]

const App: React.FC = () => {
  const [websites] = useState<Website[]>(mockWebsites)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [keptWebsites, setKeptWebsites] = useState<Website[]>([])
  const [killedWebsites, setKilledWebsites] = useState<Website[]>([])
  const [skippedWebsites, setSkippedWebsites] = useState<Website[]>([])
  const [triggerAction, setTriggerAction] = useState<'left' | 'right' | 'up' | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Track start time when component mounts
  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  // Submit results when all cards are swiped
  const submitResults = useCallback(async (): Promise<void> => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await googleSheetsService.submitResults(
        keptWebsites,
        killedWebsites,
        skippedWebsites,
        startTime
      )

      if (result.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result.error || 'Failed to submit results')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }, [keptWebsites, killedWebsites, skippedWebsites, startTime])

  useEffect(() => {
    const hasMoreCards = currentIndex < websites.length
    const hasResults = keptWebsites.length > 0 || killedWebsites.length > 0 || skippedWebsites.length > 0
    
    if (!hasMoreCards && !submitted && !isSubmitting && hasResults) {
      submitResults()
    }
  }, [currentIndex, websites.length, submitted, isSubmitting, submitResults])

  const handleSwipe = (direction: 'left' | 'right', website: Website): void => {
    if (direction === 'right') {
      setKeptWebsites(prev => [...prev, website])
    } else {
      setKilledWebsites(prev => [...prev, website])
    }
    
    setCurrentIndex(prev => prev + 1)
    setTriggerAction(null) // Reset trigger after action
  }

  const handleSkip = (website: Website): void => {
    setSkippedWebsites(prev => [...prev, website])
    setCurrentIndex(prev => prev + 1)
    setTriggerAction(null) // Reset trigger after action
  }

  const handleButtonAction = (action: 'left' | 'right' | 'up'): void => {
    const currentWebsite = websites[currentIndex]
    if (currentWebsite && !triggerAction) {
      setTriggerAction(action)
      // The actual state updates will be handled by the card's animation callbacks
    }
  }

  const resetStack = (): void => {
    setCurrentIndex(0)
    setKeptWebsites([])
    setKilledWebsites([])
    setSkippedWebsites([])
    setTriggerAction(null)
    setStartTime(Date.now())
    setSubmitted(false)
    setSubmitError(null)
  }

  const hasMoreCards = currentIndex < websites.length
  // Show all remaining cards instead of limiting to 3
  const remainingWebsites = websites.slice(currentIndex)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 text-center border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Hillsdale College Website Swiper</h1>
        <p className="text-muted-foreground mt-1">Swipe to curate your Hillsdale experience</p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {hasMoreCards ? (
          <>
            {/* Card stack - show ALL remaining cards */}
            <div className="relative w-full max-w-md h-96 mb-8">
              <AnimatePresence mode="popLayout">
                {remainingWebsites.map((website, index) => {
                  const isTop = index === 0
                  const stackIndex = index
                  
                  return (
                    <SwipeCard
                      key={website.id}
                      website={website}
                      onSwipe={handleSwipe}
                      onSkip={handleSkip}
                      isTop={isTop}
                      stackIndex={stackIndex}
                      triggerAction={isTop ? triggerAction : null}
                    />
                  )
                })}
              </AnimatePresence>
            </div>

            {/* FIXED THREE ACTION BUTTONS */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
              <div className="flex items-center justify-center gap-8 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-2xl border-2 border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleButtonAction('left')}
                  disabled={!!triggerAction}
                  className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-lg bg-white dark:bg-gray-800 disabled:opacity-50"
                  title="Kill Website"
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleButtonAction('up')}
                  disabled={!!triggerAction}
                  className="w-16 h-16 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white shadow-lg bg-white dark:bg-gray-800 disabled:opacity-50"
                  title="Maybe Later"
                >
                  <HelpCircle className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleButtonAction('right')}
                  disabled={!!triggerAction}
                  className="w-16 h-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white shadow-lg bg-white dark:bg-gray-800 disabled:opacity-50"
                  title="Keep Website"
                >
                  <Heart className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Button labels */}
            <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50">
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <span className="w-16 text-center font-medium">Kill</span>
                <span className="w-16 text-center font-medium">Maybe</span>
                <span className="w-16 text-center font-medium">Keep</span>
              </div>
            </div>

            {/* Stack indicator showing number of cards remaining */}
            <div className="absolute top-20 right-6 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-sm text-muted-foreground">
              {remainingWebsites.length} cards
            </div>
          </>
        ) : (
          /* Results screen */
          <div className="text-center space-y-6 max-w-md">
            {/* Submission status */}
            {isSubmitting && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Saving your results...</span>
                </div>
              </div>
            )}

            {submitted && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span>Results saved successfully!</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to save results</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                <Button 
                  onClick={submitResults} 
                  size="sm" 
                  className="mt-2"
                  disabled={isSubmitting}
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">All Done!</h2>
              <p className="text-muted-foreground">Here's your Hillsdale College curation summary</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1 mb-2">
                  <Heart className="w-3 h-3 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200 text-xs">Kept</span>
                </div>
                <div className="text-xl font-bold text-green-800 dark:text-green-200 mb-1">
                  {keptWebsites.length}
                </div>
                <div className="space-y-1 text-green-700 dark:text-green-300 text-xs">
                  {keptWebsites.slice(0, 2).map(site => (
                    <div key={site.id} className="truncate">{site.name}</div>
                  ))}
                  {keptWebsites.length > 2 && (
                    <div className="text-xs">+{keptWebsites.length - 2} more</div>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-1 mb-2">
                  <HelpCircle className="w-3 h-3 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200 text-xs">Maybe</span>
                </div>
                <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                  {skippedWebsites.length}
                </div>
                <div className="space-y-1 text-yellow-700 dark:text-yellow-300 text-xs">
                  {skippedWebsites.slice(0, 2).map(site => (
                    <div key={site.id} className="truncate">{site.name}</div>
                  ))}
                  {skippedWebsites.length > 2 && (
                    <div className="text-xs">+{skippedWebsites.length - 2} more</div>
                  )}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-1 mb-2">
                  <X className="w-3 h-3 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200 text-xs">Killed</span>
                </div>
                <div className="text-xl font-bold text-red-800 dark:text-red-200 mb-1">
                  {killedWebsites.length}
                </div>
                <div className="space-y-1 text-red-700 dark:text-red-300 text-xs">
                  {killedWebsites.slice(0, 2).map(site => (
                    <div key={site.id} className="truncate">{site.name}</div>
                  ))}
                  {killedWebsites.length > 2 && (
                    <div className="text-xs">+{killedWebsites.length - 2} more</div>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              onClick={resetStack}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {hasMoreCards && (
        <div className="p-6 pb-32">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{currentIndex + 1} of {websites.length}</span>
              <span>{websites.length - currentIndex - 1} remaining</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / websites.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App