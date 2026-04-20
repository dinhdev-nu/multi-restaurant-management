export interface SelectOption { code: number; name: string }
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface WeekDay { id: DayKey; label: string; full: string }

export interface DailyOperatingHour {
  closed: boolean;
  open: string;
  close: string;
}

export interface OperatingHours {
  mon: DailyOperatingHour;
  tue: DailyOperatingHour;
  wed: DailyOperatingHour;
  thu: DailyOperatingHour;
  fri: DailyOperatingHour;
  sat: DailyOperatingHour;
  sun: DailyOperatingHour;
}

export interface RestaurantDTO {
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery_urls?: string[];
  website?: string;
  cuisine_type?: string;
  price_range?: 1 | 2 | 3 | 4;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  timezone?: string;
  operating_hours: OperatingHours;
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

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const PRICE_RANGES = [1, 2, 3, 4] as const;

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

export const DEFAULT_DAILY_OPERATING_HOUR: DailyOperatingHour = {
  closed: false,
  open: '08:00',
  close: '22:00',
};

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  mon: { ...DEFAULT_DAILY_OPERATING_HOUR },
  tue: { ...DEFAULT_DAILY_OPERATING_HOUR },
  wed: { ...DEFAULT_DAILY_OPERATING_HOUR },
  thu: { ...DEFAULT_DAILY_OPERATING_HOUR },
  fri: { ...DEFAULT_DAILY_OPERATING_HOUR },
  sat: { ...DEFAULT_DAILY_OPERATING_HOUR },
  sun: { ...DEFAULT_DAILY_OPERATING_HOUR },
};

export const REQUIRED_FIELDS: (keyof RestaurantDTO)[] = [
  'name',
  'address',
  'city',
  'operating_hours',
];

export function isTimeHHmm(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isOperatingHoursComplete(operatingHours: OperatingHours): boolean {
  return DAY_KEYS.every((day) => {
    const item = operatingHours[day];

    if (item.closed) return true;

    return isTimeHHmm(item.open) && isTimeHHmm(item.close);
  });
}

export function isFieldFilled(formData: RestaurantDTO, field: keyof RestaurantDTO): boolean {
  if (field === 'operating_hours') {
    return isOperatingHoursComplete(formData.operating_hours);
  }

  const value = formData[field];

  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;

  return false;
}