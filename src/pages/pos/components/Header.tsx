import { memo, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '@/components/AppIcon';
import Button from './Button.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date | string;
}

export interface RestaurantInfo {
  id: string;
  name: string;
  logo?: string;
  orderUrl: string;
}

export interface HeaderProps {
  storeName?: string;
  restaurant?: RestaurantInfo;
  notifications?: Notification[];
  isOperational?: boolean;
  onToggleOperational?: () => void;
  onToggleSidebar?: () => void;
  getRelativeTime?: (date: Date | string) => string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOTIF_ICON: Record<NotificationType, string> = {
  warning: 'AlertTriangle',
  success: 'CheckCircle',
  error: 'XCircle',
  info: 'Info',
};

const NOTIF_COLOR: Record<NotificationType, string> = {
  warning: 'text-warning',
  success: 'text-success',
  error: 'text-error',
  info: 'text-primary',
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatDate = (d: Date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${days[d.getDay()]}, ${d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })}`;
};

// ─── Header ───────────────────────────────────────────────────────────────────
// memo: chỉ re-render khi props thực sự thay đổi.

const Header = memo<HeaderProps>(({
  storeName = 'POS Manager',
  restaurant,
  notifications = [],
  isOperational = true,
  onToggleOperational,
  onToggleSidebar,
  getRelativeTime,
}) => {
  const [showNotifications, setShowNotif]     = useState(false);
  const [showQRDialog, setShowQRDialog]       = useState(false);
  const [currentTime, setCurrentTime]         = useState(new Date());

  // Clock (re-render 1 giây/lần – độc lập với routing)
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayName = restaurant?.name ?? storeName;
  const logoSrc = restaurant?.logo ?? '/assets/images/restaurant_logo.png';
  const unreadCount = notifications.length;

  const closeNotifications = () => setShowNotif(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-surface border-b border-border z-1100">
      <div className="flex items-center justify-between h-full px-2 sm:px-4">

        {/* ── Left ──────────────────────────────────────────────────────── */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden touch-target"
          >
            <Icon name="Menu" size={20} />
          </Button>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {restaurant ? (
              <img src={logoSrc} alt={displayName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Store" size={20} color="white" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        {/* ── Center (POS desktop) ──────────────────────────────────────── */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Search" iconPosition="left" className="hover-scale">
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="QrCode"
            iconPosition="left"
            className="hover-scale"
            onClick={() => setShowQRDialog(true)}
          >
            QR nhà hàng
          </Button>
          <Button variant="default" size="sm" iconName="Receipt" iconPosition="left" className="hover-scale">
            Tạo hóa đơn
          </Button>
        </div>

        {/* ── Right ─────────────────────────────────────────────────────── */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Clock */}
          <div className="hidden xl:flex items-center space-x-2 px-4 py-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground font-mono tracking-wider">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* Operational toggle (POS desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden xl:inline">Trạng thái:</span>
            <Button
              variant={isOperational ? 'success' : 'secondary'}
              size="sm"
              onClick={onToggleOperational}
              iconName={isOperational ? 'Play' : 'Pause'}
              iconPosition="left"
              className="hover-scale"
            >
              <span className="hidden xl:inline">{isOperational ? 'Đang mở cửa' : 'Đang đóng cửa'}</span>
              <span className="xl:hidden">{isOperational ? 'Mở' : 'Đóng'}</span>
            </Button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotif((v) => !v)}
              className="relative hover-scale touch-target"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-1150 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Thông báo</h3>
                </div>
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">Không có thông báo mới</p>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 flex items-start space-x-3 hover:bg-muted/50 transition-colors">
                        <Icon name={NOTIF_ICON[n.type]} size={16} className={`mt-0.5 flex-shrink-0 ${NOTIF_COLOR[n.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{n.message}</p>
                          {getRelativeTime && (
                            <p className="text-xs text-muted-foreground mt-1">{getRelativeTime(n.createdAt)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Restaurant badge */}
          <div className="relative">
            {restaurant ? (
              <div className="flex items-center space-x-2">
                <img src={logoSrc} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-border/30" />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">POS</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Store" size={16} color="white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">POS</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile quick actions ──────────────────────────────────────────── */}
      <div className="md:hidden px-2 sm:px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" iconName="Search" className="flex-1 touch-target text-xs sm:text-sm">
            <span className="hidden xs:inline">Tìm</span>
          </Button>
          <Button variant="outline" size="sm" iconName="QrCode" className="flex-1 touch-target text-xs sm:text-sm" onClick={() => setShowQRDialog(true)}>
            <span className="hidden xs:inline">QR</span>
          </Button>
          <Button variant="default" size="sm" iconName="Receipt" className="flex-1 touch-target text-xs sm:text-sm">
            <span className="hidden xs:inline">Hóa đơn</span>
          </Button>
          <Button
            variant={isOperational ? 'success' : 'secondary'}
            size="sm"
            iconName={isOperational ? 'Play' : 'Pause'}
            onClick={onToggleOperational}
            className="touch-target"
          >
            <span className="hidden sm:inline">{isOperational ? 'Mở' : 'Đóng'}</span>
          </Button>
        </div>
      </div>

      {/* ── QR Dialog ─────────────────────────────────────────────────────── */}
      {showQRDialog && restaurant && (
        <div className="fixed inset-0 bg-black/50 z-[1300] flex items-center justify-center p-4" onClick={() => setShowQRDialog(false)}>
          <div className="bg-card rounded-lg shadow-modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="QrCode" size={24} className="text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">QR Code Đặt Món</h3>
                  <p className="text-sm text-muted-foreground">{displayName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowQRDialog(false)} className="hover-scale">
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={restaurant.orderUrl} size={256} level="H" includeMargin />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">Quét mã QR để đặt món trực tuyến</p>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg w-full">
                <p className="text-xs text-muted-foreground text-center break-all">{restaurant.orderUrl}</p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex items-center justify-between">
              <Button variant="outline" size="sm" iconName="Copy" iconPosition="left" onClick={() => navigator.clipboard.writeText(restaurant.orderUrl)}>
                Sao chép link
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowQRDialog(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-1000" onClick={closeNotifications} />
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;