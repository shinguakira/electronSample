import { Card, CardContent } from "@/components/ui/card"
import { Clock, DrillIcon as Drone } from "lucide-react"

interface HeaderProps {
  title: string
  sessionTime: number
}

export function Header({ title, sessionTime }: HeaderProps) {
  const formatSessionTime = (milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    }

    const seconds = Math.floor(milliseconds / 1000) % 60
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))

    if (hours > 0) {
      return `${hours}時間 ${minutes}分 ${seconds}秒`
    } else if (minutes > 0) {
      return `${minutes}分 ${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Drone className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>セッション時間: {formatSessionTime(sessionTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">CV</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
