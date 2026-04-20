import { ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OtpMethod {
  id: string
  label: string
  icon: string
  description?: string
}

interface OtpMethodModalProps {
  methods: OtpMethod[]
  isSendingOtp: boolean
  onSelect: (methodId: string) => void
  onClose: () => void
}

export function OtpMethodModal({ methods, isSendingOtp, onSelect, onClose }: OtpMethodModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-sm border-border bg-card shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Send verification code</CardTitle>
          <CardDescription>Choose how you'd like to receive your code</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {methods.map((method) => (
            <Button
              key={method.id}
              type="button"
              variant="outline"
              onClick={() => onSelect(method.id)}
              disabled={isSendingOtp}
              className={cn(
                "h-auto w-full justify-start gap-3 rounded-xl p-4 text-left",
                isSendingOtp && "cursor-not-allowed opacity-60"
              )}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{method.icon}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{method.label}</span>
                {method.description && (
                  <span className="block text-xs text-muted-foreground">{method.description}</span>
                )}
              </span>
              {isSendingOtp ? (
                <Loader2 className="animate-spin text-muted-foreground" />
              ) : (
                <ChevronRight className="text-muted-foreground" />
              )}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSendingOtp}
            className="mt-1 w-full text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
