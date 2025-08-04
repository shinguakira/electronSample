import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface ImagePreviewPanelProps {
  currentFolder: string
}

export function ImagePreviewPanel({ currentFolder }: ImagePreviewPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>画像プレビュー</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {currentFolder ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* モック眼球画像 */}
              <div className="relative">
                <div className="w-32 h-32 bg-blue-100 rounded-full border-4 border-blue-300 relative">
                  <div className="w-16 h-16 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                {/* キャリブレーショングリッド */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-30">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="border border-red-400" />
                  ))}
                </div>
                {/* 十字線 */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500" />
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">患者画像フォルダを選択して画像を読み込んでください</div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">キャリブレーションパラメータ</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>フォーカス調整</label>
                <span className="text-muted-foreground">0.75</span>
              </div>
              <Slider defaultValue={[75]} max={100} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>色バランス</label>
                <span className="text-muted-foreground">1.0</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label>歪み補正</label>
                <span className="text-muted-foreground">0.2</span>
              </div>
              <Slider defaultValue={[20]} max={100} step={1} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
