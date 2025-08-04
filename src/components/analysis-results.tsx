"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Leaf, Bug, TrendingUp, AlertTriangle } from "lucide-react"

interface AnalysisResult {
  success: boolean
  output: string
  error: string
}

interface AnalysisResultsProps {
  analysisResult: AnalysisResult | null
  batchResult: AnalysisResult | null
  batchCommand: string
  setBatchCommand: (command: string) => void
  runningBatch: boolean
  onRunBatch: () => void
  onSelectBatchFile: () => void
}

export function AnalysisResults({
  analysisResult,
  batchResult,
  batchCommand,
  setBatchCommand,
  runningBatch,
  onRunBatch,
  onSelectBatchFile,
}: AnalysisResultsProps) {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          農業分析結果
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">分析結果</TabsTrigger>
            <TabsTrigger value="batch">バッチ処理</TabsTrigger>
            <TabsTrigger value="reports">レポート</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {analysisResult ? (
              <div
                className={`p-4 rounded-lg ${
                  analysisResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {analysisResult.success ? analysisResult.output : analysisResult.error}
                </pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    作物健康度指標
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">NDVI平均値:</span>
                        <span className="text-sm">0.652</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        良好
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">ストレス比率:</span>
                        <span className="text-sm">18.3%</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        注意
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">成長率:</span>
                        <span className="text-sm">+12.5%</span>
                      </div>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        上昇
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Bug className="h-4 w-4 text-orange-600" />
                    病害虫検出結果
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">被害面積:</span>
                        <span className="text-sm">2.1 ha</span>
                      </div>
                      <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        要対策
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">病害進行度:</span>
                        <span className="text-sm">中程度</span>
                      </div>
                      <Badge variant="destructive">緊急</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">予防効果:</span>
                        <span className="text-sm">87.2%</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        効果的
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="batch" className="space-y-4">
            {batchResult ? (
              <div
                className={`p-4 rounded-lg ${
                  batchResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <h4 className="font-medium mb-2">{batchResult.success ? "バッチ処理完了:" : "バッチ処理エラー:"}</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {batchResult.success ? batchResult.output : batchResult.error}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={batchCommand}
                  onChange={(e) => setBatchCommand(e.target.value)}
                  disabled={runningBatch}
                  placeholder="バッチ処理コマンドを入力してください（例: python batch_analysis.py --folder /drone_images --output /results）"
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={onRunBatch}
                    disabled={runningBatch || !batchCommand}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    バッチ処理実行
                  </Button>
                  <Button variant="outline" onClick={onSelectBatchFile} disabled={runningBatch} size="sm">
                    バッチファイル選択
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">収穫予測レポート</h4>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>予想収穫量:</span>
                      <span className="font-medium">4.2 トン/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span>品質スコア:</span>
                      <span className="font-medium">A級 (85点)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>収穫適期:</span>
                      <span className="font-medium">2024年10月15日頃</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">推奨対策</h4>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="space-y-2 text-sm">
                    <div>• 東側エリアの追加施肥を推奨</div>
                    <div>• 病害部分への薬剤散布が必要</div>
                    <div>• 灌漑システムの調整を検討</div>
                    <div>• 2週間後の再撮影を推奨</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-2">
          <h3 className="font-medium">分析履歴</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>今日 15:42 - 圃場A - NDVI: 0.652 - 健康度: 78% - 病害: 12%</div>
            <div>今日 14:28 - 圃場B - NDVI: 0.721 - 健康度: 85% - 病害: 5%</div>
            <div>昨日 16:15 - 圃場C - NDVI: 0.598 - 健康度: 72% - 病害: 18%</div>
            <div>昨日 13:30 - バッチ処理完了 - 処理画像数: 156枚 - 処理時間: 23分</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
