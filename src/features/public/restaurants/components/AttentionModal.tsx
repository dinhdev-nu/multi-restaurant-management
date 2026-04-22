import type { LucideIcon } from "lucide-react"
import { ArrowRight, BarChart3, Star, Users, X } from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface AttentionModalProps {
    isOpen: boolean
    onClose: () => void
    onOpenCreatePage: () => void
}

interface FeatureItem {
    icon: LucideIcon
    title: string
    description: string
}

const FEATURES: FeatureItem[] = [
    {
        icon: BarChart3,
        title: "Quản lý thông minh",
        description: "Theo dõi doanh thu, đơn hàng và khách hàng một cách dễ dàng",
    },
    {
        icon: Users,
        title: "Tiếp cận khách hàng",
        description: "Kết nối với hàng nghìn khách hàng tiềm năng trong khu vực",
    },
    {
        icon: Star,
        title: "Nâng cao uy tín",
        description: "Xây dựng thương hiệu và nhận đánh giá từ khách hàng",
    },
]

export default function AttentionModal({ isOpen, onClose, onOpenCreatePage }: AttentionModalProps) {
    const handleCreateRestaurant = () => {
        onClose()
        onOpenCreatePage()
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose()
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-0 shadow-xl"
            >
                <div className="relative border-b border-border bg-card px-6 py-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="text-center">
                        <DialogTitle className="mb-2 text-lg font-semibold text-foreground">Bạn có nhà hàng riêng?</DialogTitle>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Tham gia hệ thống quản lý hiện đại và kết nối với hàng nghìn khách hàng
                        </p>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <div className="space-y-4">
                        {FEATURES.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div key={feature.title} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-sm font-medium text-foreground">{feature.title}</h3>
                                        <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="border-t border-border bg-muted/40 px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Để sau
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateRestaurant}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <span>Đăng ký ngay</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
