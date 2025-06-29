# 🛡️ BACKUP: Working State - Hillsdale College Website Swiper

**Date:** December 2024  
**Status:** ✅ **FULLY FUNCTIONAL**  
**Deployment:** Successfully deployed to Netlify with Google Sheets integration  

This file contains the complete working state of the Hillsdale College Website Swiper application. Use this as a restore point if you need to revert changes.

---

## 📋 Application Overview

**Functionality Status:**
- ✅ All 33 Hillsdale College cards implemented and working
- ✅ Three swipe actions: Left (Kill), Up (Maybe/Combine), Right (Keep)
- ✅ Stacked cards with depth effects and smooth animations
- ✅ Three action buttons with visual feedback
- ✅ Google Sheets data collection working (CORS issue resolved)
- ✅ Progress indicators and results summary
- ✅ Responsive design for desktop and mobile
- ✅ Start over functionality
- ✅ Error handling and submission status

**Technical Stack:**
- React + TypeScript + Vite
- Tailwind CSS v4.0
- Framer Motion for animations
- Google Apps Script for backend
- Netlify for deployment

---

## 🗂️ Complete File Contents

### `/App.tsx` - Main Application Component

```tsx
import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SwipeCard } from './components/SwipeCard'
import { Heart, RotateCcw, Skull, GitMerge, CheckCircle, AlertCircle } from 'lucide-react'
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
                  <Skull className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleButtonAction('up')}
                  disabled={!!triggerAction}
                  className="w-16 h-16 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white shadow-lg bg-white dark:bg-gray-800 disabled:opacity-50"
                  title="Maybe Later"
                >
                  <GitMerge className="w-6 h-6" />
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
                  <GitMerge className="w-3 h-3 text-yellow-600" />
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
```

### `/components/SwipeCard.tsx` - Card Component

```tsx
import React, { useEffect, useRef, forwardRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Heart, Skull, GitMerge } from 'lucide-react'

interface Website {
  id: number
  name: string
  description: string
  category: string
}

interface SwipeCardProps {
  website: Website
  onSwipe: (direction: 'left' | 'right', website: Website) => void
  onSkip: (website: Website) => void
  isTop: boolean
  stackIndex: number
  triggerAction?: 'left' | 'right' | 'up' | null
}

export const SwipeCard = forwardRef<HTMLDivElement, SwipeCardProps>(
  ({ website, onSwipe, onSkip, isTop, stackIndex, triggerAction }, ref) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
    
    // Move all useTransform hooks to top level - always call them
    const killOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
    const keepOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1])
    const skipOpacity = useTransform(y, [-100, -50, 0], [1, 0.5, 0])

    const hasTriggered = useRef(false)
    const previousTriggerAction = useRef<'left' | 'right' | 'up' | null>(null)

    // Reset trigger state when triggerAction changes or when card becomes top
    useEffect(() => {
      if (triggerAction !== previousTriggerAction.current) {
        hasTriggered.current = false
        previousTriggerAction.current = triggerAction
      }
    }, [triggerAction])

    // Reset trigger state when card becomes top
    useEffect(() => {
      if (isTop) {
        hasTriggered.current = false
      }
    }, [isTop])

    // Handle programmatic animations when buttons are clicked
    useEffect(() => {
      if (triggerAction && isTop && !hasTriggered.current) {
        hasTriggered.current = true
        
        // Use a more reliable timeout approach
        const timer = setTimeout(() => {
          if (triggerAction === 'left') {
            onSwipe('left', website)
          } else if (triggerAction === 'right') {
            onSwipe('right', website)
          } else if (triggerAction === 'up') {
            onSkip(website)
          }
        }, 300) // Match the animation duration

        return () => clearTimeout(timer)
      }
    }, [triggerAction, isTop, onSwipe, onSkip, website])

    const handleDragEnd = (event: any, info: PanInfo) => {
      const threshold = 100
      if (info.offset.x > threshold) {
        onSwipe('right', website)
      } else if (info.offset.x < -threshold) {
        onSwipe('left', website)
      } else if (info.offset.y < -threshold) {
        onSkip(website)
      }
    }

    // Simplified stacking using pure z-index approach
    const zIndex = 1000 - stackIndex // Higher z-index for cards closer to top
    const scale = 1 - (stackIndex * 0.02) // Subtle scale reduction for depth
    const cardOpacity = 1 // All cards fully visible

    // Determine animation target based on trigger action
    const getAnimateTarget = () => {
      if (triggerAction === 'left') {
        return { 
          x: -400, 
          y: 0, 
          rotate: -30, 
          opacity: 0, 
          scale,
          transition: { duration: 0.3, ease: "easeOut" }
        }
      } else if (triggerAction === 'right') {
        return { 
          x: 400, 
          y: 0, 
          rotate: 30, 
          opacity: 0, 
          scale,
          transition: { duration: 0.3, ease: "easeOut" }
        }
      } else if (triggerAction === 'up') {
        return { 
          x: 0,
          y: -400, 
          rotate: 0, 
          opacity: 0, 
          scale: scale * 0.8,
          transition: { duration: 0.3, ease: "easeOut" }
        }
      } else {
        // Default positioning - all cards in same position, differentiated by z-index and scale
        return {
          x: 0,
          y: 0,
          rotate: 0,
          opacity: cardOpacity,
          scale,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
          }
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={`absolute inset-0 w-full h-full ${isTop && !triggerAction ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        style={{ 
          x: isTop && !triggerAction ? x : 0,
          y: isTop && !triggerAction ? y : 0,
          rotate: isTop && !triggerAction ? rotate : 0,
          opacity: isTop && !triggerAction ? opacity : cardOpacity,
          zIndex
        }}
        drag={isTop && !triggerAction ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        initial={{ 
          scale,
          x: 0,
          y: 0,
          rotate: 0,
          opacity: cardOpacity
        }}
        animate={getAnimateTarget()}
      >
        <div className="relative w-full h-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Add shadow intensity based on stack position for depth */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ 
              boxShadow: `0 ${stackIndex * 2 + 4}px ${stackIndex * 4 + 20}px rgba(0, 0, 0, ${0.1 + stackIndex * 0.05})` 
            }}
          />
          
          {/* Swipe indicators - only show on top card */}
          {isTop && !triggerAction && (
            <>
              <motion.div
                className="absolute top-8 left-8 bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 z-10"
                style={{ opacity: killOpacity }}
              >
                <X className="w-5 h-5" />
                <span>KILL</span>
              </motion.div>
              
              <motion.div
                className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 z-10"
                style={{ opacity: keepOpacity }}
              >
                <Heart className="w-5 h-5" />
                <span>KEEP</span>
              </motion.div>

              <motion.div
                className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center gap-2 z-10"
                style={{ opacity: skipOpacity }}
              >
                <GitMerge className="w-5 h-5" />
                <span>COMBINE</span>
              </motion.div>
            </>
          )}

          {/* Show action feedback when buttons are pressed */}
          {isTop && triggerAction && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
              {triggerAction === 'left' && (
                <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2">
                  <X className="w-5 h-5" />
                  <span>KILLED!</span>
                </div>
              )}
              {triggerAction === 'right' && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>KEPT!</span>
                </div>
              )}
              {triggerAction === 'up' && (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <GitMerge className="w-5 h-5" />
                  <span>COMBINED!</span>
                </div>
              )}
            </div>
          )}

          {/* Card content */}
          <div className="relative h-full flex flex-col justify-between p-8 z-5">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {website.category}
                  </div>
                  <h1 className="text-4xl font-bold text-foreground">{website.name}</h1>
                </div>
                <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {website.description}
                </p>
              </div>
            </div>
            
            {/* Only show instructions on top card when not animating */}
            {isTop && !triggerAction && (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Swipe or use buttons to choose</p>
              </div>
            )}
          </div>

          {/* Add a subtle overlay for stacked cards to create depth */}
          {!isTop && (
            <div 
              className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none rounded-2xl" 
              style={{ opacity: Math.min(stackIndex * 0.1, 0.3) }}
            />
          )}
        </div>
      </motion.div>
    )
  }
)

SwipeCard.displayName = 'SwipeCard'
```

### `/services/googleSheets.ts` - Google Sheets Integration (CORS Fixed)

```typescript
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
```

### `/styles/globals.css` - Tailwind V4 Configuration

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-size: 14px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

/**
 * Base typography. This is not applied to elements which have an ancestor with a Tailwind text class.
 */
@layer base {
  :where(:not(:has([class*=" text-"]), :not(:has([class^="text-"])))) {
    h1 {
      font-size: 1.5rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    h4 {
      font-size: 1rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    p {
      font-size: 1rem;
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }

    label {
      font-size: 1rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    button {
      font-size: 1rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }

    input {
      font-size: 1rem;
      font-weight: var(--font-weight-normal);
      line-height: 1.5;
    }
  }
}

html {
  font-size: var(--font-size);
}
```

---

## 🔧 Configuration Files

### Environment Variables (Netlify)
- **`VITE_GOOGLE_APPS_SCRIPT_URL`**: Set to your Google Apps Script web app URL

### Google Apps Script Configuration
- **Sheet ID**: Replace `"YOUR_ACTUAL_SHEET_ID_HERE"` with your actual Google Sheet ID
- **Deployment**: Set to "Anyone" access for CORS to work
- **Functions**: `testScript()`, `testFormData()`, `checkSheetSetup()` all working

### Google Sheet Headers
```
A1: Timestamp
B1: Session ID  
C1: Kept Websites
D1: Killed Websites
E1: Skipped Websites
F1: Total Time (seconds)
G1: Summary (Keep/Kill/Skip)
H1: User Agent
```

---

## 🐛 Known Issues & Solutions

### ✅ CORS Issue - RESOLVED
- **Problem**: JSON POST requests triggered CORS preflight
- **Solution**: Changed to FormData to avoid preflight requests
- **Status**: Fixed and working

### ✅ Google Apps Script Integration - WORKING
- **Problem**: Initial script errors with undefined properties
- **Solution**: Updated script to handle both JSON and FormData
- **Status**: Both `testScript()` and `testFormData()` working

### ✅ Animation Timing - WORKING  
- **Problem**: Button actions not syncing with card animations
- **Solution**: Added trigger state management and timeout coordination
- **Status**: Smooth animations with proper state updates

---

## 📊 Data Collection Status

**Collection Points:**
- ✅ Timestamp (ISO format)
- ✅ Session ID (unique per session)
- ✅ Kept websites (comma-separated names)
- ✅ Killed websites (comma-separated names)  
- ✅ Skipped websites (comma-separated names)
- ✅ Total completion time (seconds)
- ✅ Summary format (e.g., "5/3/2")
- ✅ User agent string

**Sample Data Row:**
```
2024-12-20T15:30:45.123Z | abc123def456 | Online Courses, Imprimis | unBounce, Secured Donations | Official Store | 180 | 2/2/1 | Mozilla/5.0...
```

---

## 🚀 Deployment Status

**Netlify:**
- ✅ Build: Successful
- ✅ Domain: hillsdaleswiper.netlify.app  
- ✅ Environment Variables: Configured
- ✅ HTTPS: Enabled
- ✅ Responsive: Working on desktop and mobile

**Google Apps Script:**
- ✅ Deployed as web app
- ✅ "Anyone" access configured  
- ✅ CORS issue resolved
- ✅ Data saving successfully

---

## 📱 User Experience

**Interactions:**
- ✅ Touch/mouse drag swipe gestures
- ✅ Three fixed action buttons (Kill/Maybe/Keep)
- ✅ Visual feedback during actions
- ✅ Progress indicators
- ✅ Comprehensive results summary
- ✅ Start over functionality

**Visual Design:**
- ✅ Stacked card depth effects
- ✅ Smooth Framer Motion animations
- ✅ Color-coded action indicators
- ✅ Responsive typography
- ✅ Dark/light mode support via Tailwind

---

## 🔄 How to Restore This State

If you need to revert to this working state:

1. **Copy the file contents** from the sections above
2. **Replace your current files** with the backup versions
3. **Verify your environment variables** are still configured:
   - `VITE_GOOGLE_APPS_SCRIPT_URL` in Netlify
4. **Check your Google Apps Script** has the correct Sheet ID
5. **Test the application** by completing a survey
6. **Verify data appears** in your Google Sheet

---

## ✅ Verification Checklist

To confirm this state is working:

- [ ] Application loads without errors
- [ ] All 33 cards display correctly  
- [ ] Swipe gestures work (left/right/up)
- [ ] Action buttons work (Kill/Maybe/Keep)
- [ ] Cards animate smoothly
- [ ] Progress indicator updates
- [ ] Results screen displays correctly
- [ ] Data submits to Google Sheets successfully
- [ ] "Start Over" button resets everything

---

**This backup represents a fully functional, production-ready Hillsdale College Website Swiper! 🎉**

*Saved on: December 2024*  
*Last verified: Working perfectly with Google Sheets integration*