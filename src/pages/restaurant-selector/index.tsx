import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Restaurant {
  _id: string;
  restaurantName: string;
  address?: string;
  district?: string;
  city?: string;
  cuisine?: string;
  logo?: string;
  role?: string;
  capacity?: number;
  createdAt?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    _id: '1',
    restaurantName: 'Nhà Hàng Phở Hà Nội',
    address: '123 Lê Lợi',
    district: 'Q1',
    city: 'HCM',
    role: 'Chủ nhà hàng',
    capacity: 80,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: '2',
    restaurantName: 'Quán Bún Bò Huế',
    address: '45 Nguyễn Huệ',
    district: 'Q3',
    city: 'HCM',
    role: 'Quản lý',
    capacity: 40,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: '3',
    restaurantName: 'Cơm Tấm Sài Gòn',
    address: '78 Hai Bà Trưng',
    district: 'Q1',
    city: 'HCM',
    role: 'Nhân viên',
    capacity: 60,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'Mới tạo';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${diffYears} năm trước`;
};

const formatAddress = (restaurant: Restaurant): string => {
  const parts: string[] = [];
  if (restaurant.address) parts.push(restaurant.address);
  if (restaurant.district) parts.push(restaurant.district);
  if (restaurant.city) parts.push(restaurant.city);
  return parts.length > 0 ? parts.join(', ') : restaurant.cuisine ?? 'Chưa cập nhật';
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="relative bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden animate-pulse">
    <div className="relative h-24 bg-gradient-to-br from-muted to-muted-foreground/20">
      <div className="absolute top-2 right-2 w-16 h-5 bg-muted-foreground/20 rounded" />
    </div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-muted rounded w-12" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  </div>
);

// ─── Restaurant Card ──────────────────────────────────────────────────────────

interface RestaurantCardProps {
  restaurant: Restaurant;
  isHovered: boolean;
  isSelecting: boolean;
  isDisabled: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  badgeLabel?: string;
  badgePOS?: boolean;
  subLabel?: string;
  imageOpacity?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isHovered,
  isSelecting,
  isDisabled,
  onMouseEnter,
  onMouseLeave,
  onClick,
  badgeLabel,
  badgePOS = false,
  subLabel,
  imageOpacity = '',
}) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    disabled={isDisabled}
    className="group relative bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden hover:ring-foreground/25 hover:shadow-lg transition-all duration-200 text-left disabled:opacity-70 disabled:cursor-wait"
  >
    {isSelecting && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/75 rounded-xl">
        <Loader2 className="w-6 h-6 text-foreground animate-spin" />
      </div>
    )}

    {/* Thumbnail */}
    <div className="relative h-24 bg-gradient-to-br from-muted to-muted-foreground/20 overflow-hidden">
      {restaurant.logo ? (
        <img
          src={restaurant.logo}
          alt={restaurant.restaurantName}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageOpacity}`}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${imageOpacity}`}>
          <span className="text-4xl">🍽️</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Badge */}
      {badgeLabel && (
        <div className="absolute top-2 right-2">
          <Badge variant={badgePOS ? 'secondary' : 'default'} className="text-[10px]">
            {badgeLabel}
          </Badge>
        </div>
      )}

      {/* Hover arrow */}
      <div
        className={`absolute bottom-2 right-2 w-6 h-6 bg-background rounded-full flex items-center justify-center transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </div>
    </div>

    {/* Info */}
    <div className="p-3">
      <h3 className="text-sm font-semibold text-foreground mb-0.5 truncate">
        {restaurant.restaurantName}
      </h3>
      <p className="text-xs text-muted-foreground mb-2 truncate">
        {subLabel ?? formatAddress(restaurant)}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{restaurant.capacity ?? 0}</span>
        </div>
        <span>{getTimeAgo(restaurant.createdAt)}</span>
      </div>
    </div>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const RestaurantSelector: React.FC = () => {
  const restaurants = MOCK_RESTAURANTS;
  const isLoading = false;
  const navigate = useNavigate();

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleRestaurantSelect = (restaurant: Restaurant): void => {
    if (selectingId) return;
    setSelectingId(restaurant._id);
    // TODO: navigate to dashboard when route exists
    setTimeout(() => setSelectingId(null), 1500);
  };

  const handleCreateRestaurant = (): void => {
    navigate('/new');
  };

  const handleGoPOS = (restaurant: Restaurant): void => {
    const posKey = `${restaurant._id}-pos`;
    if (selectingId) return;
    setSelectingId(posKey);
    // TODO: navigate to POS dashboard when route exists
    setTimeout(() => setSelectingId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Chọn nhà hàng</h1>
          <p className="text-sm text-gray-600">Chọn nhà hàng bạn muốn quản lý</p>
        </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Create new button */}
            <button
              onClick={handleCreateRestaurant}
              onMouseEnter={() => setHoveredCard('new')}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-card border-2 border-dashed border-border rounded-xl p-4 hover:border-foreground/30 hover:bg-accent/30 transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-muted/70 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Tạo mới</h3>
              <p className="text-xs text-muted-foreground text-center">Nhà hàng của bạn</p>
            </button>

            {/* Skeletons */}
            {isLoading &&
              [...Array(6)].map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}

            {/* Restaurant cards */}
            {!isLoading &&
              restaurants.map((restaurant) => (
                <React.Fragment key={restaurant._id}>
                  {/* Management card */}
                  <RestaurantCard
                    restaurant={restaurant}
                    isHovered={hoveredCard === restaurant._id}
                    isSelecting={selectingId === restaurant._id}
                    isDisabled={!!selectingId}
                    onMouseEnter={() => setHoveredCard(restaurant._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleRestaurantSelect(restaurant)}
                    badgeLabel={restaurant.role ?? 'Chủ nhà hàng'}
                    badgePOS={false}
                  />

                  {/* POS card */}
                  <RestaurantCard
                    restaurant={restaurant}
                    isHovered={hoveredCard === `${restaurant._id}-pos`}
                    isSelecting={selectingId === `${restaurant._id}-pos`}
                    isDisabled={!!selectingId}
                    onMouseEnter={() => setHoveredCard(`${restaurant._id}-pos`)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleGoPOS(restaurant)}
                    badgeLabel="POS"
                    badgePOS={true}
                    subLabel="Chế độ bán hàng"
                    imageOpacity="opacity-60"
                  />
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>
  );
};

export default RestaurantSelector;
