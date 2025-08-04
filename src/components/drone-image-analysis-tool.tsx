"use client"

import { useEffect } from "react"
import { Header } from "./header"
import { ProgressBar } from "./progress-bar"
import { ErrorMessage } from "./error-message"
import { ControlPanel } from "./control-panel"
import { MainContent } from "./main-content"
import { AnalysisResults } from "./analysis-results"
import { DroneImagesBrowser } from "./drone-images-browser"
import { useAnalysisState } from "@/hooks/use-analysis-state"
import { useImageProcessing } from "@/hooks/use-image-processing"
import { useFileSystem } from "@/hooks/use-file-system"

export function DroneImageAnalysisTool() {
  const {
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
  } = useAnalysisState()

  const {
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
  } = useImageProcessing()

  const { currentFolder, folderContents, openFolderDialog, navigateToParent, openItem, openNotepad } = useFileSystem()

  // 初期化処理
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setProgressOperation("農業ドローン分析ツールを初期化中...")
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

  // セッション時間の更新
  useEffect(() => {
    const updateSessionTime = async () => {
      try {
        const time = await window.ipcRenderer?.invoke("get-session-time")
        setSessionTime(time || 0)
      } catch (error) {
        console.error("セッション時間の取得エラー:", error)
      }
    }

    updateSessionTime()
    const interval = setInterval(updateSessionTime, 1000)
    return () => clearInterval(interval)
  }, [setSessionTime])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <Header title={configData?.AppSettings?.Title || "農業ドローン画像分析ツール"} sessionTime={sessionTime} />

        {progress > 0 && <ProgressBar progress={progress} operation={progressOperation} />}

        {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage("")} />}

        <ControlPanel
          isPythonInstalled={isPythonInstalled}
          runningAnalysis={runningAnalysis}
          runningBatch={runningBatch}
          currentFolder={currentFolder}
          onOpenFolder={openFolderDialog}
          onNavigateToParent={navigateToParent}
          onOpenNotepad={() => openNotepad()}
          onRunAnalysis={runImageAnalysis}
          onSelectScript={selectAnalysisScript}
          onSelectBatchFile={selectBatchFile}
        />

        <MainContent
          analysisScript={analysisScript}
          setAnalysisScript={setAnalysisScript}
          isPythonInstalled={isPythonInstalled}
          pythonVersion={pythonVersion}
          runningAnalysis={runningAnalysis}
          sessionTime={sessionTime}
          isTaskRunning={isTaskRunning}
          taskName={taskName}
          taskDescription={taskDescription}
          taskProgress={taskProgress}
          ndviProgress={ndviProgress}
          cropHealthProgress={cropHealthProgress}
          pestDetectionProgress={pestDetectionProgress}
          currentFolder={currentFolder}
        />

        <AnalysisResults
          analysisResult={analysisResult}
          batchResult={batchResult}
          batchCommand={batchCommand}
          setBatchCommand={setBatchCommand}
          runningBatch={runningBatch}
          onRunBatch={runBatchProcessing}
          onSelectBatchFile={selectBatchFile}
        />

        {configData?.Features?.ShowFileBrowser !== false && (
          <DroneImagesBrowser currentFolder={currentFolder} folderContents={folderContents} onOpenItem={openItem} />
        )}
      </div>
    </div>
  )
}
