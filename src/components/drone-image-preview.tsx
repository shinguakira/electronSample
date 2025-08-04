import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DrillIcon as Drone, Leaf, Bug, BarChart3, Thermometer } from "lucide-react"

interface DroneImagePreviewProps {
  currentFolder: string
}

export function DroneImagePreview({ currentFolder }: DroneImagePreviewProps) {
  return (
    <Card className="h-full border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Drone className="h-5 w-5 text-blue-600" />
          ドローン画像プレビュー
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="rgb" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rgb">RGB</TabsTrigger>
            <TabsTrigger value="ndvi">NDVI</TabsTrigger>
            <TabsTrigger value="thermal">熱画像</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
          </TabsList>

          <TabsContent value="rgb" className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-green-200">
              {currentFolder ? (
                <div className="relative w-full h-full">
                  {/* モック農地画像 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-300 to-green-400">
                    {/* 作物の行を表現 */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-green-600 opacity-70"
                        style={{
                          left: `${10 + i * 10}%`,
                          top: "10%",
                          width: "6%",
                          height: "80%",
                          borderRadius: "2px",
                        }}
                      />
                    ))}
                    {/* 病害部分 */}
                    <div className="absolute bg-yellow-600 opacity-60 rounded-full w-16 h-16 top-1/4 right-1/4" />
                    <div className="absolute bg-brown-600 opacity-60 rounded-full w-12 h-12 bottom-1/3 left-1/3" />
                  </div>
                  {/* グリッドオーバーレイ */}
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="border border-white" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Drone className="h-12 w-12 mx-auto mb-2 text-blue-400" />
                  ドローン画像フォルダを選択してください
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ndvi" className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-red-200 via-yellow-200 to-green-200 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-green-200">
              <div className="absolute inset-0">
                {/* NDVI色彩マップ */}
                <div className="w-full h-full bg-gradient-to-br from-red-400 via-yellow-400 to-green-400 opacity-80">
                  {/* 健康な作物エリア（緑） */}
                  <div className="absolute bg-green-500 opacity-90 rounded-lg w-1/3 h-1/3 top-1/4 left-1/4" />
                  {/* ストレスエリア（黄） */}
                  <div className="absolute bg-yellow-500 opacity-90 rounded-lg w-1/4 h-1/4 top-1/2 right-1/4" />
                  {/* 問題エリア（赤） */}
                  <div className="absolute bg-red-500 opacity-90 rounded-lg w-1/6 h-1/6 bottom-1/4 left-1/3" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>健康 (0.7-1.0)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>注意 (0.3-0.7)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>問題 (0.0-0.3)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="thermal" className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-blue-200 via-purple-200 to-red-200 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 opacity-70">
                {/* 温度分布 */}
                <div className="absolute bg-blue-400 opacity-80 rounded-lg w-1/3 h-1/3 top-1/4 left-1/4" />
                <div className="absolute bg-red-400 opacity-80 rounded-lg w-1/4 h-1/4 top-1/2 right-1/4" />
              </div>
              <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded text-xs">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  <span>15-35°C</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center gap-1 border-green-300">
                  <Leaf className="h-3 w-3" />
                  作物健康度: 78%
                </Badge>
                <Badge variant="outline" className="w-full justify-center gap-1 border-orange-300">
                  <Bug className="h-3 w-3" />
                  病害虫被害: 12%
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center gap-1 border-blue-300">
                  <BarChart3 className="h-3 w-3" />
                  NDVI平均: 0.65
                </Badge>
                <Badge variant="outline" className="w-full justify-center gap-1 border-purple-300">
                  <Thermometer className="h-3 w-3" />
                  平均温度: 24°C
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <h3 className="font-medium">画像処理パラメータ</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>コントラスト調整</label>
                <span className="text-muted-foreground">1.2</span>
              </div>
              <Slider defaultValue={[120]} max={200} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>彩度調整</label>
                <span className="text-muted-foreground">1.1</span>
              </div>
              <Slider defaultValue={[110]} max={200} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>NDVI閾値</label>
                <span className="text-muted-foreground">0.3</span>
              </div>
              <Slider defaultValue={[30]} max={100} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>病害検出感度</label>
                <span className="text-muted-foreground">0.7</span>
              </div>
              <Slider defaultValue={[70]} max={100} step={1} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
