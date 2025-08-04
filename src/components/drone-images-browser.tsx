"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderIcon, FileIcon, ImageIcon, DrillIcon as Drone } from "lucide-react"

interface FolderItem {
  name: string
  isDirectory: boolean
  path: string
}

interface DroneImagesBrowserProps {
  currentFolder: string
  folderContents: FolderItem[]
  onOpenItem: (item: FolderItem) => void
}

export function DroneImagesBrowser({ currentFolder, folderContents, onOpenItem }: DroneImagesBrowserProps) {
  const getImageType = (filename: string) => {
    const lower = filename.toLowerCase()
    if (lower.includes("ndvi")) return "NDVI"
    if (lower.includes("thermal") || lower.includes("temp")) return "熱画像"
    if (lower.includes("rgb")) return "RGB"
    if (lower.includes("multispectral")) return "マルチスペクトル"
    return "RGB"
  }

  const getImageBadgeColor = (type: string) => {
    switch (type) {
      case "NDVI":
        return "bg-green-100 text-green-800 border-green-300"
      case "熱画像":
        return "bg-red-100 text-red-800 border-red-300"
      case "マルチスペクトル":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Drone className="h-5 w-5 text-green-600" />
          ドローン画像ライブラリ
        </CardTitle>
      </CardHeader>

      <CardContent>
        {folderContents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folderContents.map((item, index) => {
              const isImage =
                item.name.toLowerCase().endsWith(".jpg") ||
                item.name.toLowerCase().endsWith(".png") ||
                item.name.toLowerCase().endsWith(".tiff") ||
                item.name.toLowerCase().endsWith(".bmp")

              const imageType = isImage ? getImageType(item.name) : null

              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted bg-transparent border-green-200"
                  onClick={() => onOpenItem(item)}
                >
                  {isImage ? (
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-green-200">
                      <ImageIcon className="h-8 w-8 text-green-600" />
                      {/* モック画像プレビュー */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-50" />
                      {imageType === "NDVI" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-300 via-yellow-300 to-green-300 opacity-60" />
                      )}
                      {imageType === "熱画像" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-red-300 opacity-60" />
                      )}
                    </div>
                  ) : item.isDirectory ? (
                    <FolderIcon className="h-16 w-16 text-green-500" />
                  ) : (
                    <FileIcon className="h-16 w-16 text-muted-foreground" />
                  )}

                  <div className="text-xs text-center truncate w-full">{item.name}</div>

                  {isImage && imageType && (
                    <Badge variant="outline" className={`text-xs ${getImageBadgeColor(imageType)}`}>
                      {imageType}
                    </Badge>
                  )}

                  {isImage && <div className="text-xs text-green-600 font-medium">分析対象</div>}
                </Button>
              )
            })}
          </div>
        ) : currentFolder ? (
          <div className="text-center py-8 text-muted-foreground">
            <Drone className="h-12 w-12 mx-auto mb-2 text-green-400" />
            このフォルダにドローン画像が見つかりません
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Drone className="h-12 w-12 mx-auto mb-2 text-green-400" />
            ドローン画像フォルダを選択してください
          </div>
        )}
      </CardContent>
    </Card>
  )
}
