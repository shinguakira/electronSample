"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen, ArrowUp, FileText, Play, Upload, Zap } from "lucide-react"

interface ControlPanelProps {
  isPythonInstalled: boolean
  runningAnalysis: boolean
  runningBatch: boolean
  currentFolder: string
  onOpenFolder: () => void
  onNavigateToParent: () => void
  onOpenNotepad: () => void
  onRunAnalysis: () => void
  onSelectScript: () => void
  onSelectBatchFile: () => void
}

export function ControlPanel({
  isPythonInstalled,
  runningAnalysis,
  runningBatch,
  currentFolder,
  onOpenFolder,
  onNavigateToParent,
  onOpenNotepad,
  onRunAnalysis,
  onSelectScript,
  onSelectBatchFile,
}: ControlPanelProps) {
  return (
    <Card className="border-green-200">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Button onClick={onOpenFolder} className="gap-2 bg-green-600 hover:bg-green-700">
              <FolderOpen className="h-4 w-4" />
              ドローン画像を読み込み
            </Button>
            {currentFolder && (
              <Button variant="outline" onClick={onNavigateToParent} className="gap-2 bg-transparent">
                <ArrowUp className="h-4 w-4" />
                親フォルダ
              </Button>
            )}
            <Button variant="outline" onClick={onOpenNotepad} className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              メモ帳を開く
            </Button>
          </div>

          <div className="flex gap-2">
            {isPythonInstalled && (
              <>
                <Button
                  onClick={onRunAnalysis}
                  disabled={runningAnalysis}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  画像分析実行
                </Button>
                <Button
                  variant="outline"
                  onClick={onSelectScript}
                  disabled={runningAnalysis}
                  className="gap-2 bg-transparent"
                >
                  <Upload className="h-4 w-4" />
                  分析スクリプト読み込み
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={onSelectBatchFile}
              disabled={runningBatch}
              className="gap-2 bg-transparent"
            >
              <Zap className="h-4 w-4" />
              バッチ処理実行
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
