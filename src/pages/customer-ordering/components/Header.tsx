import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, Play, Pause, Receipt, Bell,
  AlertTriangle, CheckCircle, XCircle, Info,
  User, LogIn, UserPlus, Settings, HelpCircle, LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Notification, Order, User as UserType } from '../types';
import OrdersDropdown from './OrdersDropdown';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatDate = (date: Date): string => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${days[date.getDay()]}, ${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

const formatNotificationTime = (iso: string): string => {
  const diffMs   = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)  return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
};

const NOTIFICATION_ICON: Record<string, LucideIcon> = {
  warning: AlertTriangle,
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
};

const NOTIFICATION_COLOR: Record<string, string> = {
  warning: 'text-warning',
  success: 'text-success',
  error:   'text-destructive',
  info:    'text-primary',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  isOperational?: boolean;
  ordersCount?: number;
  draftOrders?: Order[];
  confirmedOrders?: Order[];
  notifications?: Notification[];
  user?: UserType | null;
  restaurantName?: string | null;
  restaurantLogo?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({
  isOperational   = true,
  ordersCount     = 0,
  draftOrders     = [],
  confirmedOrders = [],
  notifications   = [],
  user            = null,
  restaurantName  = null,
  restaurantLogo  = null,
}) => {
  const [showUserMenu,       setShowUserMenu]       = useState(false);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [showOrders,         setShowOrders]         = useState(false);
  const [currentTime,        setCurrentTime]        = useState(new Date());

  const displayName = restaurantName ?? 'Nhà hàng';
  const logoSrc     = restaurantLogo ?? '/assets/images/restaurant_logo.png';

  const { isGuest, userAvatar, userName } = useMemo(() => ({
    isGuest:    !user,
    userAvatar: user?.avatar ?? null,
    userName:   user?.user_name ?? 'Khách lạ',
  }), [user]);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const closeAll = (): void => {
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowOrders(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-[1100]">
      <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-8 xl:px-16 max-w-[1920px] mx-auto">

        {/* Left – logo & name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img
            src={logoSrc}
            alt={displayName}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-border flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[220px] lg:max-w-none">
            {displayName}
          </h1>
        </div>

        {/* Right – actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">

          {/* Clock */}
          <div className="hidden md:flex items-center space-x-2">
            <Clock size={15} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground font-mono tracking-wider">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* Operational status */}
          <Badge
            className={
              isOperational
                ? 'bg-success/20 text-success border-success/30 gap-1.5'
                : 'bg-muted text-muted-foreground border-border gap-1.5'
            }
          >
            {isOperational ? <Play size={11} /> : <Pause size={11} />}
            <span className="hidden sm:inline">{isOperational ? 'Mở cửa' : 'Đóng cửa'}</span>
            <span className="sm:hidden">{isOperational ? 'Mở' : 'Đóng'}</span>
          </Badge>

          {/* Orders */}
          <div className="relative">
            <button
              onClick={() => { setShowOrders(!showOrders); setShowNotifications(false); setShowUserMenu(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Receipt size={19} />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {ordersCount > 99 ? '99+' : ordersCount}
                </span>
              )}
            </button>
            {showOrders && (
              <OrdersDropdown draftOrders={draftOrders} confirmedOrders={confirmedOrders} />
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowOrders(false); setShowUserMenu(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {notifications.length > 99 ? '99+' : notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-80 bg-card border border-border rounded-lg shadow-lg z-[1150]">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-foreground">Thông báo</h3>
                  {notifications.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{notifications.length} thông báo mới</p>
                  )}
                </div>
                <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={32} className="text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Không có thông báo mới</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const NIcon = NOTIFICATION_ICON[n.type] ?? Info;
                      return (
                        <div key={n.id} className="p-4 border-b border-border last:border-b-0 hover:bg-secondary transition-colors">
                          <div className="flex items-start space-x-3">
                            <NIcon size={15} className={NOTIFICATION_COLOR[n.type] ?? 'text-primary'} />
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{n.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{formatNotificationTime(n.time)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border">
                    <button className="w-full py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowOrders(false); }}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-all"
            >
              <Avatar className="w-8 h-8">
                {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {isGuest ? <User size={15} /> : userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{isGuest ? 'Chưa đăng nhập' : 'Người dùng'}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-48 bg-card border border-border rounded-lg shadow-lg z-[1150] p-2">
                {isGuest ? (
                  <>
                    {[
                      { icon: LogIn,    label: 'Đăng nhập' },
                      { icon: UserPlus, label: 'Đăng ký'   },
                    ].map(({ icon: Icon, label }) => (
                      <button key={label} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
                        <Icon size={15} className="text-muted-foreground" /> {label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { icon: User,       label: 'Hồ sơ cá nhân' },
                      { icon: Settings,   label: 'Cài đặt'        },
                      { icon: HelpCircle, label: 'Trợ giúp'       },
                    ].map(({ icon: Icon, label }) => (
                      <button key={label} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
                        <Icon size={15} className="text-muted-foreground" /> {label}
                      </button>
                    ))}
                    <div className="border-t border-border my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click-outside overlay */}
      {(showUserMenu || showNotifications || showOrders) && (
        <div className="fixed inset-0 z-[1000]" onClick={closeAll} />
      )}
    </header>
  );
};

export default Header;
