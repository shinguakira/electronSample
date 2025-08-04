"use client"

import { useState } from "react"

export function useCalibrationState() {
  const [progress, setProgress] = useState<number>(0)
  const [progressOperation, setProgressOperation] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [configData, setConfigData] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState<number>(0)

  return {
    progress,
    progressOperation,
    errorMessage,
    configData,
    executionTime,
    setProgress,
    setProgressOperation,
    setErrorMessage,
    setConfigData,
    setExecutionTime,
  }
}
