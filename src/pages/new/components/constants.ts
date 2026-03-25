export interface SelectOption { code: number; name: string }
export interface WeekDay { id: string; label: string; full: string }
export interface ServiceOption { id: string; label: string; icon: string }
export interface PaymentOption { id: string; label: string; icon: string }

export interface DayHours { open: string; close: string }

export interface RestaurantFormData {
  restaurantName: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
  city: string;
  district: string;
  slug: string;
  cuisine: string;
  priceRange: '' | '₫' | '₫₫' | '₫₫₫' | '₫₫₫₫';
  capacity: string;
  minOrder: string;
  deliveryRadius: string;
  dayHours: Record<string, DayHours>;
  workingDays: string[];
  services: string[];
  paymentMethods: string[];
  description: string;
  specialties: string;
  tags: string[];
}

export const cuisineTypes = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Hoa', 'Ý', 'Pháp',
  'Thái Lan', 'Ấn Độ', 'Hải sản', 'Lẩu', 'BBQ', 'Chay', 'Pizza',
  'Sandwich', 'Cà phê', 'Tráng miệng', 'Fastfood',
];

export const weekDays: WeekDay[] = [
  { id: 'mon', label: 'T2', full: 'Thứ Hai' },
  { id: 'tue', label: 'T3', full: 'Thứ Ba' },
  { id: 'wed', label: 'T4', full: 'Thứ Tư' },
  { id: 'thu', label: 'T5', full: 'Thứ Năm' },
  { id: 'fri', label: 'T6', full: 'Thứ Sáu' },
  { id: 'sat', label: 'T7', full: 'Thứ Bảy' },
  { id: 'sun', label: 'CN', full: 'Chủ Nhật' },
];

export const serviceOptions: ServiceOption[] = [
  { id: 'dine-in',   label: 'Ăn tại chỗ',  icon: '🍽️' },
  { id: 'takeaway',  label: 'Mang về',       icon: '📦' },
  { id: 'delivery',  label: 'Giao hàng',     icon: '🛵' },
  { id: 'parking',   label: 'Bãi đỗ xe',     icon: '🚗' },
  { id: 'wifi',      label: 'Wifi miễn phí', icon: '📶' },
  { id: 'kids',      label: 'Khu trẻ em',    icon: '👶' },
  { id: 'outdoor',   label: 'Ngoài trời',    icon: '🌿' },
  { id: 'private',   label: 'Phòng riêng',   icon: '🔒' },
  { id: 'karaoke',   label: 'Karaoke',       icon: '🎤' },
];

export const paymentOptions: PaymentOption[] = [
  { id: 'cash',    label: 'Tiền mặt',      icon: '💵' },
  { id: 'card',    label: 'Thẻ ngân hàng', icon: '💳' },
  { id: 'momo',    label: 'MoMo',          icon: '📱' },
  { id: 'zalopay', label: 'ZaloPay',       icon: '💙' },
  { id: 'vnpay',   label: 'VNPay',         icon: '🔵' },
  { id: 'shopeepay', label: 'ShopeePay',   icon: '🟠' },
];

export const PRICE_RANGES = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'] as const;

export const MOCK_PROVINCES: SelectOption[] = [
  { code: 1,  name: 'Hà Nội' },
  { code: 79, name: 'TP. Hồ Chí Minh' },
  { code: 48, name: 'Đà Nẵng' },
  { code: 92, name: 'Cần Thơ' },
];

export const MOCK_DISTRICTS: Record<number, SelectOption[]> = {
  1:  [{ code: 1, name: 'Hoàn Kiếm' }, { code: 2, name: 'Ba Đình' }, { code: 3, name: 'Đống Đa' }],
  79: [{ code: 1, name: 'Quận 1' },    { code: 3, name: 'Quận 3' }, { code: 10, name: 'Quận 10' }],
  48: [{ code: 1, name: 'Hải Châu' },  { code: 2, name: 'Thanh Khê' }],
  92: [{ code: 1, name: 'Ninh Kiều' }, { code: 2, name: 'Bình Thuỷ' }],
};

export const REQUIRED_FIELDS: (keyof RestaurantFormData)[] = [
  'restaurantName', 'email', 'phone', 'city', 'cuisine',
];

export const DEFAULT_DAY_HOURS: DayHours = { open: '08:00', close: '22:00' };
