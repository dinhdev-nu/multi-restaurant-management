import { ArrowRight } from "lucide-react"

interface CreateRestaurantBannerProps {
    onOpenCreatePage: () => void
}

export default function CreateRestaurantBanner({ onOpenCreatePage }: CreateRestaurantBannerProps) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:bg-accent/30">
            <div className="mb-3">
                <h3 className="font-semibold text-foreground">Bạn là chủ nhà hàng?</h3>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Tham gia POS Manager để quản lý nhà hàng chuyên nghiệp và tiếp cận hàng nghìn khách hàng
            </p>

            <div className="space-y-2">
                <button
                    onClick={onOpenCreatePage}
                    className="group flex w-full items-center justify-center space-x-2 rounded-2xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                >
                    <span>Tạo nhà hàng</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    )
}
