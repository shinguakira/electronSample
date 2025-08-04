"use client"

import { useEffect } from "react"
import { Header } from "./header"
import { ProgressBar } from "./progress-bar"
import { ErrorMessage } from "./error-message"
import { ControlPanel } from "./control-panel"
import { MainContent } from "./main-content"
import { ResultsArea } from "./results-area"
import { PatientImagesBrowser } from "./patient-images-browser"
import { useCalibrationState } from "@/hooks/use-calibration-state"
import { usePythonExecution } from "@/hooks/use-python-execution"
import { useFileSystem } from "@/hooks/use-file-system"

export function EyeCalibrationTool() {
  const {
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
  } = useCalibrationState()

  const {
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
  } = usePythonExecution()

  const { currentFolder, folderContents, openFolderDialog, navigateToParent, openItem, openNotepad } = useFileSystem()

  // 初期化処理
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setProgressOperation("アプリケーションを初期化中...")
        setProgress(50)

        // 設定を読み込み
        const config = await window.ipcRenderer?.invoke("get-config-data")
        setConfigData(config)

        // 初期フォルダを設定
        if (config?.AppSettings?.DefaultFolderPath && config.Features?.OpenLastFolder) {
          // setCurrentFolder は useFileSystem フックで管理
        }

        setProgress(100)
        setTimeout(() => setProgress(0), 1000)
      } catch (error) {
        console.error("初期化エラー:", error)
        setErrorMessage("アプリケーションの初期化に失敗しました")
        setProgress(0)
      }
    }

    initializeApp()
  }, [])

  // 実行時間の更新
  useEffect(() => {
    const updateExecutionTime = async () => {
      try {
        const time = await window.ipcRenderer?.invoke("get-execution-time")
        setExecutionTime(time || 0)
      } catch (error) {
        console.error("実行時間の取得エラー:", error)
      }
    }

    updateExecutionTime()
    const interval = setInterval(updateExecutionTime, 1000)
    return () => clearInterval(interval)
  }, [setExecutionTime])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <Header
          title={configData?.AppSettings?.Title || "眼球カメラキャリブレーションツール"}
          executionTime={executionTime}
        />

        {progress > 0 && <ProgressBar progress={progress} operation={progressOperation} />}

        {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage("")} />}

        <ControlPanel
          isPythonInstalled={isPythonInstalled}
          runningPython={runningPython}
          runningExe={runningExe}
          currentFolder={currentFolder}
          onOpenFolder={openFolderDialog}
          onNavigateToParent={navigateToParent}
          onOpenNotepad={() => openNotepad()}
          onRunCalibration={runPythonCode}
          onSelectPythonFile={selectPythonFile}
          onSelectExeFile={selectExeFile}
        />

        <MainContent
          pythonCode={pythonCode}
          setPythonCode={setPythonCode}
          isPythonInstalled={isPythonInstalled}
          pythonVersion={pythonVersion}
          runningPython={runningPython}
          executionTime={executionTime}
          isTaskRunning={isTaskRunning}
          taskName={taskName}
          taskDescription={taskDescription}
          taskProgress={taskProgress}
          searchOffsetProgress={searchOffsetProgress}
          correctOffsetProgress={correctOffsetProgress}
          correctingCalibrationProgress={correctingCalibrationProgress}
          currentFolder={currentFolder}
        />

        <ResultsArea
          pythonResult={pythonResult}
          exeResult={exeResult}
          exeCommand={exeCommand}
          setExeCommand={setExeCommand}
          runningExe={runningExe}
          onRunCommand={runExeCommand}
          onSelectExeFile={selectExeFile}
        />

        {configData?.Features?.ShowFileBrowser !== false && (
          <PatientImagesBrowser currentFolder={currentFolder} folderContents={folderContents} onOpenItem={openItem} />
        )}
      </div>
    </div>
  )
}
