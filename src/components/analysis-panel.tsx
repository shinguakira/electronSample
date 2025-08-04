"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, Leaf, Bug, BarChart3 } from "lucide-react"

interface AnalysisPanelProps {
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
}

export function AnalysisPanel({
  analysisScript,
  setAnalysisScript,
  isPythonInstalled,
  pythonVersion,
  runningAnalysis,
  sessionTime,
  isTaskRunning,
  taskName,
  taskDescription,
  taskProgress,
  ndviProgress,
  cropHealthProgress,
  pestDetectionProgress,
}: AnalysisPanelProps) {
  const formatSessionTime = (milliseconds: number): string => {
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

  const defaultAnalysisScript = `# 農業ドローン画像分析スクリプト
import cv2
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

def analyze_crop_health(image_path):
    # ドローン画像を読み込み
    img = cv2.imread(image_path)
    
    # NDVI計算（正規化植生指数）
    # NIR（近赤外）とRED（赤）バンドを使用
    nir = img[:,:,2].astype(float)  # 近赤外バンド
    red = img[:,:,0].astype(float)  # 赤バンド
    
    # NDVI = (NIR - RED) / (NIR + RED)
    ndvi = np.divide(nir - red, nir + red, 
                     out=np.zeros_like(nir), where=(nir + red) != 0)
    
    # 作物健康度分析
    healthy_threshold = 0.3
    stressed_threshold = 0.1
    
    healthy_pixels = np.sum(ndvi > healthy_threshold)
    stressed_pixels = np.sum(ndvi < stressed_threshold)
    total_pixels = ndvi.size
    
    health_score = healthy_pixels / total_pixels
    stress_ratio = stressed_pixels / total_pixels
    
    # 病害虫検出（色彩分析）
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 異常な色域を検出
    brown_lower = np.array([10, 50, 20])
    brown_upper = np.array([20, 255, 200])
    brown_mask = cv2.inRange(hsv, brown_lower, brown_upper)
    
    pest_damage_ratio = np.sum(brown_mask > 0) / total_pixels
    
    return {
        "ndvi_mean": float(np.mean(ndvi)),
        "health_score": float(health_score),
        "stress_ratio": float(stress_ratio),
        "pest_damage_ratio": float(pest_damage_ratio),
        "crop_status": "健康" if health_score > 0.7 else "注意" if health_score > 0.4 else "要対策",
        "ndvi_image": ndvi
    }

# 分析実行
result = analyze_crop_health("drone_field_image.jpg")
print("ドローン画像分析完了！")
print(f"NDVI平均値: {result['ndvi_mean']:.3f}")
print(f"作物健康度: {result['health_score']:.1%}")
print(f"ストレス比率: {result['stress_ratio']:.1%}")
print(f"病害虫被害率: {result['pest_damage_ratio']:.1%}")
print(f"作物状態: {result['crop_status']}")`

  return (
    <Card className="h-full border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            農業画像分析スクリプト
          </CardTitle>
          <div className="flex items-center gap-4">
            {isPythonInstalled ? (
              <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-3 w-3" />
                Python {pythonVersion} + OpenCV
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Python が見つかりません
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              稼働時間: {formatSessionTime(sessionTime)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isTaskRunning && (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="font-medium text-green-800">{taskName}</div>
              <div className="text-sm text-green-600">{taskDescription}</div>
            </div>
            <Progress value={taskProgress} className="w-full" />
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>NDVI計算</span>
              </div>
              <span>{Math.round(ndviProgress)}%</span>
            </div>
            <Progress value={ndviProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>作物健康度分析</span>
              </div>
              <span>{Math.round(cropHealthProgress)}%</span>
            </div>
            <Progress value={cropHealthProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-orange-600" />
                <span>病害虫検出</span>
              </div>
              <span>{Math.round(pestDetectionProgress)}%</span>
            </div>
            <Progress value={pestDetectionProgress} className="h-2" />
          </div>
        </div>

        {isPythonInstalled ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">ドローン画像分析アルゴリズム</h4>
                <Badge variant="outline" className="gap-1 border-green-300">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Python {pythonVersion} + OpenCV 準備完了
                </Badge>
              </div>

              <Textarea
                value={analysisScript || defaultAnalysisScript}
                onChange={(e) => setAnalysisScript(e.target.value)}
                disabled={runningAnalysis}
                placeholder="農業画像分析アルゴリズムを入力してください..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-green-300 text-green-700 bg-transparent">
                NDVIテンプレート読み込み
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 bg-transparent">
                病害虫検出テンプレート
              </Button>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 bg-transparent">
                スクリプト保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 rounded-lg text-center border border-red-200">
            <Badge variant="destructive" className="gap-1 mb-2">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              Python + OpenCV がインストールされていません
            </Badge>
            <p className="text-sm text-muted-foreground">
              農業画像分析機能を使用するには、Python、OpenCV、NumPy、scikit-learnをインストールしてください。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
