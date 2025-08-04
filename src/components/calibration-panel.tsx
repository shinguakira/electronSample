"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface CalibrationPanelProps {
  pythonCode: string
  setPythonCode: (code: string) => void
  isPythonInstalled: boolean
  pythonVersion: string
  runningPython: boolean
  executionTime: number
  isTaskRunning: boolean
  taskName: string
  taskDescription: string
  taskProgress: number
  searchOffsetProgress: number
  correctOffsetProgress: number
  correctingCalibrationProgress: number
}

export function CalibrationPanel({
  pythonCode,
  setPythonCode,
  isPythonInstalled,
  pythonVersion,
  runningPython,
  executionTime,
  isTaskRunning,
  taskName,
  taskDescription,
  taskProgress,
  searchOffsetProgress,
  correctOffsetProgress,
  correctingCalibrationProgress,
}: CalibrationPanelProps) {
  const formatExecutionTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}時間 ${minutes % 60}分 ${seconds % 60}秒`
    } else if (minutes > 0) {
      return `${minutes}分 ${seconds % 60}秒`
    } else {
      return `${seconds}秒`
    }
  }

  const defaultPythonCode = `# 眼球カメラキャリブレーションスクリプト
import cv2
import numpy as np

def process_eye_image(image_path):
    # 画像を読み込み
    img = cv2.imread(image_path)
    
    # キャリブレーション調整を適用
    # 1. 色補正
    # 2. 歪み補正
    # 3. フォーカス測定
    
    # キャリブレーションパラメータと補正された画像を返す
    return {
        "focus_score": 0.92,
        "color_balance": [0.8, 1.0, 1.1],
        "distortion": 0.05,
        "calibrated_image": img
    }

# 選択された画像を処理
result = process_eye_image("patient_image.jpg")
print("キャリブレーション完了！")
print(f"フォーカススコア: {result['focus_score']}")
print(f"色バランス (RGB): {result['color_balance']}")
print(f"歪み係数: {result['distortion']}")`

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>キャリブレーションスクリプト</CardTitle>
          <div className="flex items-center gap-4">
            {isPythonInstalled ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Python {pythonVersion} 検出済み
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Python が見つかりません
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              稼働時間: {formatExecutionTime(executionTime)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isTaskRunning && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">{taskName}</div>
              <div className="text-sm text-muted-foreground">{taskDescription}</div>
            </div>
            <Progress value={taskProgress} className="w-full" />
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>オフセット検索</span>
              <span>{Math.round(searchOffsetProgress)}%</span>
            </div>
            <Progress value={searchOffsetProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>オフセット補正</span>
              <span>{Math.round(correctOffsetProgress)}%</span>
            </div>
            <Progress value={correctOffsetProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>キャリブレーション補正</span>
              <span>{Math.round(correctingCalibrationProgress)}%</span>
            </div>
            <Progress value={correctingCalibrationProgress} className="h-2" />
          </div>
        </div>

        {isPythonInstalled ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">カメラキャリブレーションスクリプト</h4>
                <Badge variant="outline" className="gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Python {pythonVersion} 準備完了
                </Badge>
              </div>

              <Textarea
                value={pythonCode || defaultPythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                disabled={runningPython}
                placeholder="キャリブレーションアルゴリズムを入力してください..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                テンプレート読み込み
              </Button>
              <Button variant="outline" size="sm">
                スクリプト保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <Badge variant="destructive" className="gap-1 mb-2">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              Python がインストールされていないか見つかりません
            </Badge>
            <p className="text-sm text-muted-foreground">
              キャリブレーション機能を使用するには、OpenCV付きのPythonをインストールしてください。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
