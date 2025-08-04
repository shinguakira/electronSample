"use client"

import { useState } from "react"

export function useAnalysisState() {
  const [progress, setProgress] = useState<number>(0)
  const [progressOperation, setProgressOperation] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [configData, setConfigData] = useState<any>(null)
  const [sessionTime, setSessionTime] = useState<number>(0)

  return {
    progress,
    progressOperation,
    errorMessage,
    configData,
    sessionTime,
    setProgress,
    setProgressOperation,
    setErrorMessage,
    setConfigData,
    setSessionTime,
  }
}
