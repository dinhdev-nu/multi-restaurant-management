import Button from '../../../components/Button.tsx';
import Input from '../../../components/Input.tsx';
import Icon from '@/components/AppIcon';

interface QuickAddItem {
  _id: string;
  name: string;
  price: number;
  icon: string;
}

interface QuickActionsProps {
  onBarcodeSearch: (query: string) => void;
  onCustomerSearch: (query: string) => void;
  onQuickAdd: (item: QuickAddItem) => void;
  onShowRecentOrders: () => void;
  isShowingRecentOrders?: boolean;
  draftOrdersCount?: number;
}

const quickAddItems: QuickAddItem[] = [
  { _id: 'water', name: 'Nước suối', price: 10000, icon: 'Droplets' },
  { _id: 'tissue', name: 'Khăn giấy', price: 5000, icon: 'Package' },
  { _id: 'bag', name: 'Túi nilon', price: 2000, icon: 'ShoppingBag' },
];

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const QuickActions = ({
  onQuickAdd,
  onShowRecentOrders,
  isShowingRecentOrders = false,
  draftOrdersCount = 0,
}: QuickActionsProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Tìm món ăn hoặc mã vạch..."
            className="w-full"
          />
        </div>
        <Button variant="outline" size="icon" className="hover-scale">
          <Icon name="Search" size={20} />
        </Button>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant="outline"
          size="sm"
          iconName="QrCode"
          iconPosition="left"
          className="whitespace-nowrap hover-scale flex-shrink-0"
        >
          Quét mã
        </Button>

        <Button
          variant="outline"
          size="sm"
          iconName="UserPlus"
          iconPosition="left"
          className="whitespace-nowrap hover-scale flex-shrink-0"
        >
          Khách hàng
        </Button>

        <Button
          variant={isShowingRecentOrders ? 'default' : 'outline'}
          size="sm"
          iconName="Bell"
          iconPosition="left"
          onClick={onShowRecentOrders}
          className="whitespace-nowrap hover-scale flex-shrink-0 relative"
        >
          Đơn cần xác nhận
          {draftOrdersCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-warning text-warning-foreground rounded-full text-[10px] font-bold">
              {draftOrdersCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          iconName="Star"
          iconPosition="left"
          className="whitespace-nowrap hover-scale flex-shrink-0"
        >
          Yêu thích
        </Button>
      </div>

      {/* Quick Add Items */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Thêm nhanh</h4>
        <div className="grid grid-cols-3 gap-2">
          {quickAddItems?.map((item) => (
            <Button
              key={item?._id}
              variant="outline"
              size="sm"
              onClick={() => onQuickAdd(item)}
              className="flex flex-col items-center p-2 h-auto hover-scale"
            >
              <Icon name={item?.icon} size={16} className="mb-1" />
              <span className="text-xs text-center">{item?.name}</span>
              <span className="text-xs text-primary font-medium">{formatPrice(item?.price)}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
