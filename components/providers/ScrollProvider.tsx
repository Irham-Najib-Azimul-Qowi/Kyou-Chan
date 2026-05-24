'use client'

import React, { createContext, useContext } from 'react'
import { useScroll, useSpring, MotionValue } from 'framer-motion'

interface ScrollContextType {
  scrollY: MotionValue<number>
  scrollYProgress: MotionValue<number>
  smoothProgress: MotionValue<number>
}

const ScrollContext = createContext<ScrollContextType | null>(null)

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollY, scrollYProgress } = useScroll()
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  
  return (
    <ScrollContext.Provider value={{ scrollY, scrollYProgress, smoothProgress }}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScrollContext() {
  const ctx = useContext(ScrollContext)
  if (!ctx) throw new Error('useScrollContext must be used inside ScrollProvider')
  return ctx
}
