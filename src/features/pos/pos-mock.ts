export type PosNotificationType = 'info' | 'warning' | 'success' | 'error';

export interface PosRestaurantInfo {
  id: string;
  name: string;
  logo?: string;
  orderUrl: string;
}

export interface PosNotification {
  id: string;
  type: PosNotificationType;
  message: string;
  createdAt: Date | string;
}

export const demoRestaurant: PosRestaurantInfo = {
  id: '1',
  name: 'GiGi Energy Restaurant',
  logo: '/assets/images/restaurant_logo.png',
  orderUrl: 'https://example.com/order/gigi-energy',
};

export const demoNotifications: PosNotification[] = [
  {
    id: '1',
    type: 'info',
    message: 'Đơn hàng #123 đã được xác nhận',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
];

export const getRelativeTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};
