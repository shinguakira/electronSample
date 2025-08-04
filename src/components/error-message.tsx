"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onClose: () => void
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
