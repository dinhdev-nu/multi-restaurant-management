import { useNavigate } from "react-router-dom"

import AppImage from "@/components/AppImage"
import Icon from "@/components/AppIcon"
import Button from "@/features/pos/components/Button"

import type { OrderingMenuItem } from "../types"

interface MenuGridProps {
  menuItems: OrderingMenuItem[]
  onAddToCart: (item: OrderingMenuItem) => void
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)

const getStockStatusColor = (stock: number): string => {
  if (stock === 0) return "bg-error text-error-foreground"
  if (stock <= 5) return "bg-warning text-warning-foreground"
  return "bg-success text-success-foreground"
}

const getStockStatusText = (stock: number): string => {
  if (stock === 0) return "Hết hàng"
  if (stock <= 5) return "Sắp hết"
  return "Còn hàng"
}

const MenuGrid = ({ menuItems, onAddToCart }: MenuGridProps) => {
  const navigate = useNavigate()

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted/30">
          <Icon name="UtensilsCrossed" size={64} className="text-muted-foreground opacity-50" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Không có món nào</h3>
        <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          Danh mục này hiện chưa có món ăn. Vui lòng chọn danh mục khác hoặc thêm món mới.
        </p>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate("/menu-management")}
          >
            Thêm món mới
          </Button>
          <Button
            variant="default"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={() => window.location.reload()}
          >
            Tải lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {menuItems.map((item) => {
        const stock = item.stock_quantity ?? 0
        const isUnavailable = stock === 0 || item.status === "unavailable"

        return (
          <div
            key={item._id}
            className={`overflow-hidden rounded-lg border border-border bg-card transition-smooth hover-scale ${isUnavailable ? "opacity-60" : ""}`}
          >
            <div className="relative">
              <div className="h-32 w-full overflow-hidden">
                <AppImage
                  src={item.image ?? "/assets/images/placeholder.png"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${getStockStatusColor(stock)}`}
              >
                {getStockStatusText(stock)}
              </div>
            </div>

            <div className="flex flex-col p-3">
              <h3 className="mb-1 line-clamp-2 text-sm font-medium text-card-foreground">{item.name}</h3>
              <div className="mb-2 h-5">
                {item.description && <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>}
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddToCart(item)}
                  disabled={isUnavailable}
                  className="hover-scale"
                >
                  <Icon name="Plus" size={16} className="md:mr-1.5" />
                  <span className="hidden md:inline">Thêm</span>
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MenuGrid