import { useNavigate } from 'react-router-dom';
import Image from '@/components/AppImage';
import Button from '../../../components/Button.tsx';
import Icon from '@/components/AppIcon';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  stock_quantity?: number;
  status?: 'available' | 'unavailable';
}

interface MenuGridProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getStockStatusColor = (stock: number): string => {
  if (stock === 0) return 'bg-error text-error-foreground';
  if (stock <= 5) return 'bg-warning text-warning-foreground';
  return 'bg-success text-success-foreground';
};

const getStockStatusText = (stock: number): string => {
  if (stock === 0) return 'Hết hàng';
  if (stock <= 5) return 'Sắp hết';
  return 'Còn hàng';
};

const MenuGrid = ({ menuItems, onAddToCart }: MenuGridProps) => {
  const navigate = useNavigate();

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-32 h-32 bg-muted/30 rounded-full flex items-center justify-center mb-6">
          <Icon name="UtensilsCrossed" size={64} className="text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Không có món nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Danh mục này hiện chưa có món ăn. Vui lòng chọn danh mục khác hoặc thêm món mới.
        </p>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/menu-management')}
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
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menuItems?.map((item) => {
        const stock = item?.stock_quantity ?? 0;
        const isUnavailable = stock === 0 || item?.status === 'unavailable';

        return (
          <div
            key={item?._id}
            className={`bg-card border border-border rounded-lg overflow-hidden hover-scale transition-smooth ${isUnavailable ? 'opacity-60' : ''}`}
          >
            <div className="relative">
              <div className="w-full h-32 overflow-hidden">
                <Image
                  src={item?.image ?? '/assets/images/placeholder.png'}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stock)}`}>
                {getStockStatusText(stock)}
              </div>
            </div>

            <div className="p-3 flex flex-col">
              <h3 className="font-medium text-card-foreground text-sm mb-1 line-clamp-2">
                {item?.name}
              </h3>
              <div className="h-5 mb-2">
                {item?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{item?.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-semibold text-primary">{formatPrice(item?.price)}</span>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => onAddToCart(item)}
                  disabled={isUnavailable}
                  className="hover-scale"
                >
                  Thêm
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuGrid;
