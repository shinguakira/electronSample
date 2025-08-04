import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  progress: number
  operation: string
}

export function ProgressBar({ progress, operation }: ProgressBarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">{operation}</div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
