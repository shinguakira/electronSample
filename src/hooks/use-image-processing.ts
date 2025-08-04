"use client"

import { useState, useEffect } from "react"

interface AnalysisResult {
  success: boolean
  output: string
  error: string
}

export function useImageProcessing() {
  const [analysisScript, setAnalysisScript] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isPythonInstalled, setIsPythonInstalled] = useState<boolean>(false)
  const [pythonVersion, setPythonVersion] = useState<string>("")
  const [runningAnalysis, setRunningAnalysis] = useState<boolean>(false)

  const [batchCommand, setBatchCommand] = useState<string>("")
  const [batchResult, setBatchResult] = useState<AnalysisResult | null>(null)
  const [runningBatch, setRunningBatch] = useState<boolean>(false)

  const [taskProgress, setTaskProgress] = useState<number>(0)
  const [taskName, setTaskName] = useState<string>("")
  const [taskDescription, setTaskDescription] = useState<string>("")
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false)

  const [ndviProgress, setNdviProgress] = useState<number>(0)
  const [cropHealthProgress, setCropHealthProgress] = useState<number>(0)
  const [pestDetectionProgress, setPestDetectionProgress] = useState<number>(0)

  useEffect(() => {
    const checkPythonInstalled = async () => {
      try {
        const result = await window.ipcRenderer?.invoke("check-python-installed")
        setIsPythonInstalled(result?.installed || false)
        setPythonVersion(result?.version || "")
      } catch (error) {
        console.error("Python インストール確認エラー:", error)
        setIsPythonInstalled(false)
      }
    }

    checkPythonInstalled()
  }, [])

  const startTaskProgress = (name: string, description: string) => {
    setTaskName(name)
    setTaskDescription(description)
    setTaskProgress(0)
    setIsTaskRunning(true)
  }

  const completeTaskProgress = () => {
    setTaskProgress(100)
    setTimeout(() => {
      setIsTaskRunning(false)
    }, 1500)
  }

  const failTaskProgress = () => {
    setTaskProgress(100)
    setTaskDescription((prev) => `${prev} - 失敗`)
    setTimeout(() => {
      setIsTaskRunning(false)
    }, 1500)
  }

  const runImageAnalysis = async () => {
    if (runningAnalysis || !isPythonInstalled) return

    setRunningAnalysis(true)
    setAnalysisResult(null)
    startTaskProgress("ドローン画像分析", "農業画像を分析中...")

    setNdviProgress(0)
    setCropHealthProgress(0)
    setPestDetectionProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 8 * Math.random()
          return newProgress > 90 ? 90 : newProgress
        })

        setNdviProgress((prev) => {
          const newProgress = prev + 12 * Math.random()
          return newProgress > 100 ? 100 : newProgress
        })

        setTimeout(() => {
          setCropHealthProgress((prev) => {
            const newProgress = prev + 10 * Math.random()
            return newProgress > 100 ? 100 : newProgress
          })
        }, 300)

        setTimeout(() => {
          setPestDetectionProgress((prev) => {
            const newProgress = prev + 8 * Math.random()
            return newProgress > 100 ? 100 : newProgress
          })
        }, 600)
      }, 200)

      const result = await window.ipcRenderer?.invoke("run-image-analysis", analysisScript)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setNdviProgress(100)
      setCropHealthProgress(100)
      setPestDetectionProgress(100)
      setTaskDescription(result?.success ? "ドローン画像分析が完了しました！" : "画像分析に失敗しました！")
      setAnalysisResult(result)

      setTimeout(() => {
        completeTaskProgress()
        setRunningAnalysis(false)
      }, 1000)
    } catch (error) {
      failTaskProgress()
      setRunningAnalysis(false)
      setAnalysisResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const runBatchProcessing = async () => {
    if (runningBatch || !batchCommand) return

    setRunningBatch(true)
    setBatchResult(null)
    startTaskProgress("バッチ処理", "複数画像を一括処理中...")

    try {
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 5 * Math.random()
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const result = await window.ipcRenderer?.invoke("run-batch-processing", batchCommand)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setTaskDescription(result?.success ? "バッチ処理が完了しました！" : "バッチ処理に失敗しました！")
      setBatchResult(result)

      setTimeout(() => {
        completeTaskProgress()
        setRunningBatch(false)
      }, 1000)
    } catch (error) {
      failTaskProgress()
      setRunningBatch(false)
      setBatchResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const selectAnalysisScript = async () => {
    if (runningAnalysis || !isPythonInstalled) return

    const filePath = await window.ipcRenderer?.invoke("open-file-dialog", {
      filters: [{ name: "Python Files", extensions: ["py"] }],
    })

    if (filePath) {
      // スクリプトファイルを読み込むロジック
    }
  }

  const selectBatchFile = async () => {
    if (runningBatch) return

    const filePath = await window.ipcRenderer?.invoke("open-file-dialog", {
      filters: [{ name: "Batch Files", extensions: ["bat", "sh"] }],
    })

    if (filePath) {
      // バッチファイルを実行するロジック
    }
  }

  return {
    analysisScript,
    analysisResult,
    isPythonInstalled,
    pythonVersion,
    runningAnalysis,
    batchCommand,
    batchResult,
    runningBatch,
    taskProgress,
    taskName,
    taskDescription,
    isTaskRunning,
    ndviProgress,
    cropHealthProgress,
    pestDetectionProgress,
    setAnalysisScript,
    setBatchCommand,
    runImageAnalysis,
    runBatchProcessing,
    selectAnalysisScript,
    selectBatchFile,
  }
}
