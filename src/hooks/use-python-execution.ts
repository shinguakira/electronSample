"use client"

import { useState, useEffect } from "react"

interface PythonResult {
  success: boolean
  output: string
  error: string
}

export function usePythonExecution() {
  const [pythonCode, setPythonCode] = useState<string>("")
  const [pythonResult, setPythonResult] = useState<PythonResult | null>(null)
  const [isPythonInstalled, setIsPythonInstalled] = useState<boolean>(false)
  const [pythonVersion, setPythonVersion] = useState<string>("")
  const [runningPython, setRunningPython] = useState<boolean>(false)

  const [exeCommand, setExeCommand] = useState<string>("")
  const [exeResult, setExeResult] = useState<PythonResult | null>(null)
  const [runningExe, setRunningExe] = useState<boolean>(false)

  const [taskProgress, setTaskProgress] = useState<number>(0)
  const [taskName, setTaskName] = useState<string>("")
  const [taskDescription, setTaskDescription] = useState<string>("")
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false)

  const [searchOffsetProgress, setSearchOffsetProgress] = useState<number>(0)
  const [correctOffsetProgress, setCorrectOffsetProgress] = useState<number>(0)
  const [correctingCalibrationProgress, setCorrectingCalibrationProgress] = useState<number>(0)

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

  const runPythonCode = async () => {
    if (runningPython || !isPythonInstalled) return

    setRunningPython(true)
    setPythonResult(null)
    startTaskProgress("Pythonコード実行", "Pythonコードを実行中...")

    setSearchOffsetProgress(0)
    setCorrectOffsetProgress(0)
    setCorrectingCalibrationProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 10 * Math.random()
          return newProgress > 90 ? 90 : newProgress
        })

        setSearchOffsetProgress((prev) => {
          const newProgress = prev + 15 * Math.random()
          return newProgress > 100 ? 100 : newProgress
        })

        setTimeout(() => {
          setCorrectOffsetProgress((prev) => {
            const newProgress = prev + 10 * Math.random()
            return newProgress > 100 ? 100 : newProgress
          })
        }, 500)

        setTimeout(() => {
          setCorrectingCalibrationProgress((prev) => {
            const newProgress = prev + 5 * Math.random()
            return newProgress > 100 ? 100 : newProgress
          })
        }, 1000)
      }, 200)

      const result = await window.ipcRenderer?.invoke("run-python-code", pythonCode)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setSearchOffsetProgress(100)
      setCorrectOffsetProgress(100)
      setCorrectingCalibrationProgress(100)
      setTaskDescription(result?.success ? "Pythonコードが正常に実行されました！" : "Python実行に失敗しました！")
      setPythonResult(result)

      setTimeout(() => {
        completeTaskProgress()
        setRunningPython(false)
      }, 1000)
    } catch (error) {
      failTaskProgress()
      setRunningPython(false)
      setPythonResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const runExeCommand = async () => {
    if (runningExe || !exeCommand) return

    setRunningExe(true)
    setExeResult(null)
    startTaskProgress("コマンド実行", "コマンドを実行中...")

    try {
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 10 * Math.random()
          return newProgress > 90 ? 90 : newProgress
        })
      }, 200)

      const result = await window.ipcRenderer?.invoke("run-exe-command", exeCommand)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setTaskDescription(result?.success ? "コマンドが正常に実行されました！" : "コマンド実行に失敗しました！")
      setExeResult(result)

      setTimeout(() => {
        completeTaskProgress()
        setRunningExe(false)
      }, 1000)
    } catch (error) {
      failTaskProgress()
      setRunningExe(false)
      setExeResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const selectPythonFile = async () => {
    if (runningPython || !isPythonInstalled) return

    const filePath = await window.ipcRenderer?.invoke("open-file-dialog", {
      filters: [{ name: "Python Files", extensions: ["py"] }],
    })

    if (filePath) {
      // ファイルを実行するロジック
    }
  }

  const selectExeFile = async () => {
    if (runningExe) return

    const filePath = await window.ipcRenderer?.invoke("open-file-dialog", {
      filters: [{ name: "Executable Files", extensions: ["exe"] }],
    })

    if (filePath) {
      // EXEファイルを実行するロジック
    }
  }

  return {
    pythonCode,
    pythonResult,
    isPythonInstalled,
    pythonVersion,
    runningPython,
    exeCommand,
    exeResult,
    runningExe,
    taskProgress,
    taskName,
    taskDescription,
    isTaskRunning,
    searchOffsetProgress,
    correctOffsetProgress,
    correctingCalibrationProgress,
    setPythonCode,
    setExeCommand,
    runPythonCode,
    runExeCommand,
    selectPythonFile,
    selectExeFile,
  }
}
