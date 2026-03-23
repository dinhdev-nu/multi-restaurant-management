import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Clock,
  Camera,
  CheckCircle,
  Globe,
  Info,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectOption {
  code: number;
  name: string;
}

interface WeekDay {
  id: string;
  label: string;
}

interface ServiceOption {
  id: string;
  label: string;
  icon: string;
}

interface PaymentOption {
  id: string;
  label: string;
  icon: string;
}

interface FormData {
  restaurantName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  district: string;
  cuisine: string;
  capacity: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  services: string[];
  paymentMethods: string[];
  description: string;
  specialties: string;
}

// ─── Mock Constants ───────────────────────────────────────────────────────────

const cuisineTypes: string[] = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Hoa', 'Ý', 'Pháp',
  'Thái Lan', 'Ấn Độ', 'Hải sản', 'Lẩu', 'BBQ', 'Chay',
];

const weekDays: WeekDay[] = [
  { id: 'mon', label: 'T2' },
  { id: 'tue', label: 'T3' },
  { id: 'wed', label: 'T4' },
  { id: 'thu', label: 'T5' },
  { id: 'fri', label: 'T6' },
  { id: 'sat', label: 'T7' },
  { id: 'sun', label: 'CN' },
];

const serviceOptions: ServiceOption[] = [
  { id: 'dine-in',   label: 'Ăn tại chỗ',   icon: '🍽️' },
  { id: 'takeaway',  label: 'Mang về',        icon: '📦' },
  { id: 'delivery',  label: 'Giao hàng',      icon: '🛵' },
  { id: 'parking',   label: 'Bãi đỗ xe',      icon: '🚗' },
  { id: 'wifi',      label: 'Wifi miễn phí',  icon: '📶' },
  { id: 'kids',      label: 'Khu trẻ em',     icon: '👶' },
];

const paymentOptions: PaymentOption[] = [
  { id: 'cash',    label: 'Tiền mặt',      icon: '💵' },
  { id: 'card',    label: 'Thẻ ngân hàng', icon: '💳' },
  { id: 'momo',    label: 'MoMo',          icon: '📱' },
  { id: 'zalopay', label: 'ZaloPay',       icon: '💙' },
  { id: 'vnpay',   label: 'VNPay',         icon: '🔵' },
];

const MOCK_PROVINCES: SelectOption[] = [
  { code: 1,  name: 'Hà Nội' },
  { code: 79, name: 'TP. Hồ Chí Minh' },
  { code: 48, name: 'Đà Nẵng' },
  { code: 92, name: 'Cần Thơ' },
];

const MOCK_DISTRICTS: Record<number, SelectOption[]> = {
  1:  [{ code: 1, name: 'Hoàn Kiếm' }, { code: 2, name: 'Ba Đình' }, { code: 3, name: 'Đống Đa' }],
  79: [{ code: 1, name: 'Quận 1' },    { code: 3, name: 'Quận 3' }, { code: 10, name: 'Quận 10' }],
  48: [{ code: 1, name: 'Hải Châu' },  { code: 2, name: 'Thanh Khê' }],
  92: [{ code: 1, name: 'Ninh Kiều' }, { code: 2, name: 'Bình Thuỷ' }],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionHeadingProps {
  number: number;
  title: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ number, title }) => (
  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
    <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
      {number}
    </div>
    {title}
  </h3>
);

interface FieldErrorProps {
  message?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

// ─── Main Component ───────────────────────────────────────────────────────────

const CreateRestaurantPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    restaurantName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    district: '',
    cuisine: '',
    capacity: '',
    openingTime: '',
    closingTime: '',
    workingDays: [],
    services: [],
    paymentMethods: [],
    description: '',
    specialties: '',
  });

  const [errors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────

  const provinceCode = formData.city ? Number(formData.city) : null;
  const districtCode = formData.district ? Number(formData.district) : null;
  const districts: SelectOption[] = provinceCode ? MOCK_DISTRICTS[provinceCode] ?? [] : [];
  const selectedProvince = provinceCode ? MOCK_PROVINCES.find((p) => p.code === provinceCode) : null;
  const selectedDistrict = districtCode ? districts.find((d) => d.code === districtCode) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData) => (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'city' ? { district: '' } : {}),
    }));
  };

  const handleCheckboxChange = (field: 'workingDays' | 'services' | 'paymentMethods', value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage'): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'logo') setLogoPreview(result);
      else setCoverPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // TODO: validate & call API
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Header */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6">
        <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">
          <div className="rounded-lg bg-primary p-2">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Đăng ký nhà hàng</h1>
            <p className="text-xs text-muted-foreground">
              Hoàn thiện thông tin để tạo hồ sơ nhà hàng chuyên nghiệp
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col min-h-0">
        <form onSubmit={handleSubmit} id="create-restaurant-form" className="flex-1 flex flex-col lg:flex-row min-h-0">

          {/* ── Left panel ── */}
          <div className="w-full lg:w-1/2 border-b border-border lg:border-b-0 lg:border-r p-6 overflow-y-auto space-y-6">

            {/* Section 1 */}
            <div>
              <SectionHeading number={1} title="Thông tin cơ bản" />
              <div className="space-y-4 pl-8">
                <div>
                  <Label className="mb-1.5 block">
                    Tên nhà hàng <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="VD: Nhà Hàng Phố Cổ"
                    className="h-9 text-sm"
                  />
                  <FieldError message={errors.restaurantName} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="h-9 text-sm"
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">
                      Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className="h-9 text-sm"
                    />
                    <FieldError message={errors.phone} />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Website (tùy chọn)</Label>
                  <Input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="h-9 text-sm"
                  />
                  <FieldError message={errors.website} />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="pt-4 border-t border-border/50">
              <SectionHeading number={2} title="Địa chỉ" />
              <div className="space-y-4 pl-8">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">
                      Tỉnh/Thành phố <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.city || undefined}
                      onValueChange={handleSelectChange('city')}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PROVINCES.map((opt) => (
                          <SelectItem key={opt.code} value={String(opt.code)}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.city} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Quận/Huyện</Label>
                    <Select
                      value={formData.district || undefined}
                      onValueChange={handleSelectChange('district')}
                      disabled={!formData.city}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Chọn quận/huyện" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((opt) => (
                          <SelectItem key={opt.code} value={String(opt.code)}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Địa chỉ chi tiết</Label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường..."
                    className="h-9 text-sm"
                  />
                  <FieldError message={errors.address} />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="pt-4 border-t border-border/50">
              <SectionHeading number={3} title="Chi tiết nhà hàng" />
              <div className="space-y-4 pl-8">

                {/* Cuisine */}
                <div>
                  <Label className="mb-1.5 block">
                    Loại ẩm thực <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.cuisine || undefined}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, cuisine: value }))}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Chọn loại ẩm thực" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.cuisine} />
                </div>

                {/* Capacity */}
                <div>
                  <Label className="mb-1.5 block">Sức chứa (người)</Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="VD: 50"
                    min="1"
                    className="h-9 text-sm"
                  />
                  <FieldError message={errors.capacity} />
                </div>

                {/* Working days */}
                <div>
                  <Label className="mb-1.5 block">
                    Ngày làm việc <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleCheckboxChange('workingDays', day.id)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          formData.workingDays.includes(day.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-foreground/40 text-foreground'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <FieldError message={errors.workingDays} />
                </div>

                {/* Opening / closing time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">Giờ mở cửa</Label>
                    <Input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="h-9 text-sm"
                    />
                    <FieldError message={errors.openingTime} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Giờ đóng cửa</Label>
                    <Input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="h-9 text-sm"
                    />
                    <FieldError message={errors.closingTime} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="pt-4 border-t border-border/50">
              <SectionHeading number={4} title="Dịch vụ & Tiện ích" />
              <div className="space-y-4 pl-8">
                <div>
                  <Label className="mb-1.5 block">Dịch vụ cung cấp</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {serviceOptions.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleCheckboxChange('services', service.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${
                          formData.services.includes(service.id)
                            ? 'border-primary bg-primary/10 text-foreground font-medium'
                            : 'border-border hover:border-foreground/30 hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <span>{service.icon}</span>
                        <span>{service.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Phương thức thanh toán</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {paymentOptions.map((payment) => (
                      <button
                        key={payment.id}
                        type="button"
                        onClick={() => handleCheckboxChange('paymentMethods', payment.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${
                          formData.paymentMethods.includes(payment.id)
                            ? 'border-primary bg-primary/10 text-foreground font-medium'
                            : 'border-border hover:border-foreground/30 hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <span>{payment.icon}</span>
                        <span>{payment.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="pt-4 border-t border-border/50">
              <SectionHeading number={5} title="Giới thiệu" />
              <div className="space-y-4 pl-8">
                <div>
                  <Label className="mb-1.5 block">Mô tả về nhà hàng</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Giới thiệu về không gian, phong cách phục vụ..."
                    className="w-full px-3 py-2 text-sm rounded-lg ring-1 ring-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none outline-none transition-all"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Món ăn đặc sản</Label>
                  <textarea
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    rows={2}
                    placeholder="VD: Phở bò, Bún chả, Chả cá..."
                    className="w-full px-3 py-2 text-sm rounded-lg ring-1 ring-input bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel – Preview ── */}
          <div className="w-full lg:w-1/2 bg-muted/20 overflow-y-auto">
            {/* Sticky label */}
            <div className="sticky top-0 bg-muted/20 backdrop-blur-sm px-6 pt-6 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Xem trước hồ sơ
                </h3>
              </div>
            </div>

            <div className="p-6 pt-4">
              <div className="bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden">
                {/* Cover */}
                <div className="relative h-36 bg-gradient-to-br from-muted to-muted-foreground/20">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Camera className="h-10 w-10 mx-auto mb-1.5" />
                        <p className="text-xs font-medium">Ảnh bìa</p>
                      </div>
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background/90 backdrop-blur-sm rounded-md border border-border shadow-sm hover:bg-background transition-all">
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Ảnh bìa</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'coverImage')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Content */}
                <div className="relative px-5 pb-5">
                  {/* Logo */}
                  <div className="relative -mt-12 mb-3 w-fit">
                    <div className="w-24 h-24 rounded-full border-4 border-card bg-card overflow-hidden shadow-md">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Store className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-md transition-all border-2 border-card">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {formData.restaurantName || 'Tên nhà hàng'}
                  </h2>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {formData.cuisine && (
                      <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                        {formData.cuisine}
                      </span>
                    )}
                    {formData.capacity && (
                      <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                        👥 {formData.capacity} chỗ
                      </span>
                    )}
                  </div>

                  {formData.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{formData.description}</p>
                  )}

                  {formData.specialties && (
                    <div className="mb-4 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-foreground mb-1">Món đặc sản:</p>
                      <p className="text-xs text-muted-foreground">{formData.specialties}</p>
                    </div>
                  )}

                  <div className="space-y-2.5 border-t border-border/50 pt-4">
                    {(formData.city || formData.address) && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-foreground">
                          {formData.address && <div>{formData.address}</div>}
                          {(selectedDistrict || selectedProvince) && (
                            <div className="text-muted-foreground mt-0.5">
                              {[selectedDistrict?.name, selectedProvince?.name].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground">{formData.phone}</span>
                      </div>
                    )}

                    {formData.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground">{formData.email}</span>
                      </div>
                    )}

                    {formData.website && (
                      <div className="flex items-center gap-2.5">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground truncate">{formData.website}</span>
                      </div>
                    )}

                    {(formData.openingTime || formData.closingTime) && (
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground">
                          {formData.openingTime || '--:--'} - {formData.closingTime || '--:--'}
                        </span>
                      </div>
                    )}

                    {formData.workingDays.length > 0 && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs text-muted-foreground mt-0.5">📅</span>
                        <span className="text-xs text-foreground">
                          {formData.workingDays
                            .map((dayId) => weekDays.find((d) => d.id === dayId)?.label)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    {formData.services.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-foreground mb-2">Dịch vụ:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.services.map((serviceId) => {
                            const service = serviceOptions.find((s) => s.id === serviceId);
                            return (
                              <span key={serviceId} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                                <span>{service?.icon}</span>
                                <span className="text-foreground">{service?.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {formData.paymentMethods.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-foreground mb-2">Thanh toán:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.paymentMethods.map((paymentId) => {
                            const payment = paymentOptions.find((p) => p.id === paymentId);
                            return (
                              <span key={paymentId} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                                <span>{payment?.icon}</span>
                                <span className="text-foreground">{payment?.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hồ sơ của bạn sẽ hiển thị như bên trái sau khi hoàn tất. Điền đầy đủ thông tin để tạo ấn tượng tốt với khách hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Page Footer */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="ghost" type="button">
            Hủy
          </Button>
          <Button type="submit" form="create-restaurant-form" onClick={handleSubmit} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Tạo nhà hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantPage;
