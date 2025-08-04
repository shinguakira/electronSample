import { AnalysisPanel } from "./analysis-panel"
import { DroneImagePreview } from "./drone-image-preview"

interface MainContentProps {
  analysisScript: string
  setAnalysisScript: (script: string) => void
  isPythonInstalled: boolean
  pythonVersion: string
  runningAnalysis: boolean
  sessionTime: number
  isTaskRunning: boolean
  taskName: string
  taskDescription: string
  taskProgress: number
  ndviProgress: number
  cropHealthProgress: number
  pestDetectionProgress: number
  currentFolder: string
}

export function MainContent(props: MainContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AnalysisPanel {...props} />
      <DroneImagePreview currentFolder={props.currentFolder} />
    </div>
  )
}
