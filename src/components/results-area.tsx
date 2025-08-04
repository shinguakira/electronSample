"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface PythonResult {
  success: boolean
  output: string
  error: string
}

interface ResultsAreaProps {
  pythonResult: PythonResult | null
  exeResult: PythonResult | null
  exeCommand: string
  setExeCommand: (command: string) => void
  runningExe: boolean
  onRunCommand: () => void
  onSelectExeFile: () => void
}

export function ResultsArea({
  pythonResult,
  exeResult,
  exeCommand,
  setExeCommand,
  runningExe,
  onRunCommand,
  onSelectExeFile,
}: ResultsAreaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>キャリブレーション結果</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">分析結果</h3>
            {pythonResult ? (
              <div
                className={`p-4 rounded-lg ${pythonResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {pythonResult.success ? pythonResult.output : pythonResult.error}
                </pre>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">フォーカススコア:</span>
                    <span className="text-sm">0.92</span>
                  </div>
                  <Badge variant="default">良好</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">色バランス (RGB):</span>
                    <span className="text-sm">[0.8, 1.0, 1.1]</span>
                  </div>
                  <Badge variant="secondary">調整</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">歪み:</span>
                    <span className="text-sm">0.05</span>
                  </div>
                  <Badge variant="default">良好</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">EXE実行</h3>
            {exeResult ? (
              <div
                className={`p-4 rounded-lg ${exeResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <h4 className="font-medium mb-2">{exeResult.success ? "出力:" : "エラー:"}</h4>
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {exeResult.success ? exeResult.output : exeResult.error}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={exeCommand}
                  onChange={(e) => setExeCommand(e.target.value)}
                  disabled={runningExe}
                  placeholder="実行するコマンドを入力してください..."
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button onClick={onRunCommand} disabled={runningExe || !exeCommand} size="sm">
                    コマンド実行
                  </Button>
                  <Button variant="outline" onClick={onSelectExeFile} disabled={runningExe} size="sm">
                    EXEファイル選択
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="font-medium">実行履歴</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>今日 14:32 - 患者ID: 12345 - フォーカス: 0.92 - 色: [0.8, 1.0, 1.1]</div>
            <div>今日 14:15 - EXE実行: notepad.exe - 結果: 成功</div>
            <div>今日 13:50 - 患者ID: 12343 - フォーカス: 0.95 - 色: [1.0, 1.0, 1.0]</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
