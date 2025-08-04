"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderIcon, FileIcon, ImageIcon } from "lucide-react"

interface FolderItem {
  name: string
  isDirectory: boolean
  path: string
}

interface PatientImagesBrowserProps {
  currentFolder: string
  folderContents: FolderItem[]
  onOpenItem: (item: FolderItem) => void
}

export function PatientImagesBrowser({ currentFolder, folderContents, onOpenItem }: PatientImagesBrowserProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>患者画像</CardTitle>
      </CardHeader>

      <CardContent>
        {folderContents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folderContents.map((item, index) => {
              const isImage =
                item.name.toLowerCase().endsWith(".jpg") ||
                item.name.toLowerCase().endsWith(".png") ||
                item.name.toLowerCase().endsWith(".bmp")

              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted bg-transparent"
                  onClick={() => onOpenItem(item)}
                >
                  {isImage ? (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 opacity-50" />
                    </div>
                  ) : item.isDirectory ? (
                    <FolderIcon className="h-16 w-16 text-blue-500" />
                  ) : (
                    <FileIcon className="h-16 w-16 text-muted-foreground" />
                  )}
                  <div className="text-xs text-center truncate w-full">{item.name}</div>
                  {isImage && <div className="text-xs text-blue-600 font-medium">選択</div>}
                </Button>
              )
            })}
          </div>
        ) : currentFolder ? (
          <div className="text-center py-8 text-muted-foreground">このフォルダに画像が見つかりません</div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">患者画像フォルダを選択してください</div>
        )}
      </CardContent>
    </Card>
  )
}
