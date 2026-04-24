import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/AppIcon';
import Button from '@/features/pos/components/Button';
import OrdersDropdown from './OrdersDropdown';
import { logout as logoutApi } from '@/services/auths';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';

import type { CustomerOrder, OrderingNotification, OrderingUser } from '../types';

const DEFAULT_RESTAURANT_LOGO = '/assets/images/restaurant_logo.png';
const DEFAULT_USER_AVATAR = '/assets/images/user_avatar.jpg';

const HeaderClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  };

  return (
    <div className="hidden md:flex items-center space-x-2">
      <Icon name="Clock" size={16} className="text-primary" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground font-mono tracking-wider">
          {formatTime(currentTime)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(currentTime)}
        </span>
      </div>
    </div>
  );
};

interface HeaderProps {
  isOperational?: boolean;
  ordersCount?: number;
  draftOrders?: CustomerOrder[];
  confirmedOrders?: CustomerOrder[];
  notifications?: OrderingNotification[];
  user?: OrderingUser | null;
  restaurantName?: string | null;
  restaurantLogo?: string | null;
}

const Header = ({
  isOperational = true,
  ordersCount = 0,
  draftOrders = [],
  confirmedOrders = [],
  notifications = [],
  user = null,
  restaurantName: restaurantNameProp = null,
  restaurantLogo: restaurantLogoProp = null,
}: HeaderProps) => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearUser = useUserStore((state) => state.clear);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const displayStoreName = restaurantNameProp || 'Nhà hàng';
  const [brokenRestaurantLogo, setBrokenRestaurantLogo] = useState<string | null>(null);
  const [brokenUserAvatar, setBrokenUserAvatar] = useState<string | null>(null);

  // User info with fallback - Map API data correctly
  const { isGuest, avatar: userAvatar, name: userName } = useMemo(() => ({
    isGuest: !user,
    avatar: user?.avatar_url || user?.avatar || DEFAULT_USER_AVATAR,
    name: user?.full_name || user?.user_name || 'Khách lạ'
  }), [user]);

  const originalRestaurantLogo = restaurantLogoProp || DEFAULT_RESTAURANT_LOGO;
  const restaurantLogo = brokenRestaurantLogo === originalRestaurantLogo
    ? DEFAULT_RESTAURANT_LOGO
    : originalRestaurantLogo;
  const userAvatarSrc = brokenUserAvatar === userAvatar
    ? DEFAULT_USER_AVATAR
    : userAvatar;

  const formatNotificationTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  const handleLogout = async () => {
    try {
      // Call API logout
      await logoutApi();

      // Clear all localStorage and Zustand store
      clearAuth();
      clearUser();

      // Navigate to auth page
      navigate('/auth');
    } catch {
      // Even if API fails, still logout locally
      clearAuth();
      clearUser();
      navigate('/auth');
    }
  };

  const getNotificationIcon = (type: OrderingNotification['type']) => {
    switch (type) {
      case 'warning': return 'AlertTriangle';
      case 'success': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const getNotificationColor = (type: OrderingNotification['type']) => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-primary';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-[1100]">
      <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-8 xl:px-16 max-w-[1920px] mx-auto">
        {/* Left Section - Logo and Store Name */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Logo and Store Name */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
          >
            <div className="hidden sm:flex items-center pr-3 mr-1 border-r border-border/70">
              <span className="text-base sm:text-lg font-black tracking-tight text-foreground">
                GI<span className="text-[#AFFF00]">GI</span>
              </span>
            </div>
            <img
              src={restaurantLogo}
              alt={displayStoreName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-border/30 flex-shrink-0"
              onError={(event) => {
                event.currentTarget.onerror = null;
                setBrokenRestaurantLogo(originalRestaurantLogo);
              }}
            />

            <div>
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate max-w-[100px] sm:max-w-[200px] lg:max-w-none">{displayStoreName}</h1>
            </div>
          </button>
        </div>

        {/* Right Section - Status, Notifications, User */}
        <div className="flex items-center space-x-1 sm:space-x-3">

          {/* Center Section - Real-time Clock */}
          <HeaderClock />

          {/* Operational Status Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden xl:inline">Trạng thái:</span>
            <Button
              variant={isOperational ? "success" : "secondary"}
              size="sm"
              iconName={isOperational ? "Play" : "Pause"}
              iconPosition="left"
              className="hover-scale"
              disabled
            >
              <span className="hidden sm:inline">{isOperational ? "Mở cửa" : "Đóng cửa"}</span>
              <span className="sm:hidden">{isOperational ? "Mở" : "Đóng"}</span>
            </Button>
          </div>

          {/* Cart Icon with Orders Dropdown */}
          {/* Hiển thị danh sách orders đã tạo (cả desktop và mobile) */}
          <div className="relative">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <Icon name="ClipboardList" size={20} />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center">
                  {ordersCount > 99 ? '99+' : ordersCount}
                </span>
              )}
            </button>

            {/* Orders History Dropdown */}
            {showOrders && (
              <OrdersDropdown
                draftOrders={draftOrders}
                confirmedOrders={confirmedOrders}
              />
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <Icon name="Bell" size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center">
                  {notifications.length > 99 ? '99+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-80 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-popover-foreground">Thông báo</h3>
                  {notifications.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notifications.length} thông báo mới
                    </p>
                  )}
                </div>
                <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Không có thông báo mới</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification?.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-smooth">
                        <div className="flex items-start space-x-3">
                          <Icon
                            name={getNotificationIcon(notification?.type)}
                            size={16}
                            className={getNotificationColor(notification?.type)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-popover-foreground">{notification?.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatNotificationTime(notification?.time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications?.length > 0 && (
                  <div className="p-3 border-t border-border">
                    <Button variant="ghost" size="sm" fullWidth>
                      Đánh dấu tất cả đã đọc
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover-scale"
            >
              {userAvatarSrc ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border/50">
                  <img
                    src={userAvatarSrc}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      setBrokenUserAvatar(userAvatar);
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {isGuest ? 'Chưa đăng nhập' : 'Người dùng'}
                </p>
              </div>
            </Button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-48 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-2">
                  {isGuest ? (
                    // Guest Menu
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="LogIn"
                        iconPosition="left"
                        className="justify-start"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/auth?mode=login');
                        }}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="UserPlus"
                        iconPosition="left"
                        className="justify-start"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/auth?mode=signup');
                        }}
                      >
                        Đăng ký
                      </Button>
                    </>
                  ) : (
                    // Authenticated User Menu
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="User"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Hồ sơ cá nhân
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="Settings"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Cài đặt
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="HelpCircle"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Trợ giúp
                      </Button>
                      <div className="border-t border-border my-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="LogOut"
                        iconPosition="left"
                        className="justify-start text-error hover:text-error"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside handlers */}
      {(showUserMenu || showNotifications || showOrders) && (
        <div
          className="fixed inset-0 z-1000"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
            setShowOrders(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;