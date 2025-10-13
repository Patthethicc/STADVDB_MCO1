"use client"
import React, { createContext, useContext, useState, useCallback } from "react"

interface HeaderTitleContextType {
  title: string
  setTitle: (title: string) => void
}

const HeaderTitleContext = createContext<HeaderTitleContextType | undefined>(undefined)

export function HeaderTitleProvider({ children, defaultTitle = "" }: { children: React.ReactNode, defaultTitle?: string }) {
  const [title, setTitle] = useState(defaultTitle)
  // Memoize setTitle to avoid unnecessary rerenders
  const setHeaderTitle = useCallback((t: string) => setTitle(t), [])
  return (
    <HeaderTitleContext.Provider value={{ title, setTitle: setHeaderTitle }}>
      {children}
    </HeaderTitleContext.Provider>
  )
}

export function useHeaderTitle() {
  const ctx = useContext(HeaderTitleContext)
  if (!ctx) throw new Error("useHeaderTitle must be used within a HeaderTitleProvider")
  return ctx
}
