import React from 'react';
import { useCreateRestaurant } from './form-provider';
import { 
  MOCK_PROVINCES, MOCK_DISTRICTS, cuisineTypes, 
  PRICE_RANGES, weekDays, serviceOptions, paymentOptions,
  DEFAULT_DAY_HOURS
} from './constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupText 
} from '@/components/ui/input-group';
import { 
  Store, Mail, Phone, Globe, Link as LinkIcon, Instagram, Facebook, X as TwitterX, 
  MapPin, Users, CalendarDays, Camera, Plus, ImagePlus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

const ToggleChip: React.FC<{
  selected: boolean; onClick: () => void; icon: string; label: string;
}> = ({ selected, onClick, icon, label }) => (
  <Toggle
    variant="outline"
    size="sm"
    pressed={selected}
    onPressedChange={onClick}
    className="h-9 px-3 gap-2 justify-start font-normal data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-primary"
  >
    <span className="text-base">{icon}</span><span className="text-xs">{label}</span>
  </Toggle>
);

const DayChip: React.FC<{
  selected: boolean; onClick: () => void; label: string;
}> = ({ selected, onClick, label }) => (
  <Toggle
    variant="outline"
    size="sm"
    pressed={selected}
    onPressedChange={onClick}
    className="size-9 rounded-lg font-bold data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm"
  >
    {label}
  </Toggle>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p> : null;

export function RegistrationForm() {
  const {
    formData, errors, set, handleChange, handleToggle, handleDayHour,
    handleImageUpload, handleAddTag, handleRemoveTag,
    tagInput, setTagInput, logoPreview, coverPreview
  } = useCreateRestaurant();

  const provinceCode = formData.city ? Number(formData.city) : null;
  const districts = provinceCode ? MOCK_DISTRICTS[provinceCode] ?? [] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ── Intro Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Đăng ký nhà hàng</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mang hương vị của bạn đến với thế giới. Điền thông tin bên dưới để thiết lập trang định danh chuyên nghiệp.
        </p>
      </div>

      {/* ── Section 1: Basic Info ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Định danh thương hiệu</CardTitle>
          <CardDescription>Tên gọi, phương thức liên lạc &amp; đường dẫn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="restaurantName">Tên nhà hàng <span className="text-destructive">*</span></Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText><Store className="size-4 text-muted-foreground" /></InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="restaurantName" name="restaurantName"
                value={formData.restaurantName} onChange={handleChange}
                placeholder="VD: The Continental"
                data-invalid={!!errors.restaurantName}
              />
            </InputGroup>
            <FieldError message={errors.restaurantName} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText><Mail className="size-4 text-muted-foreground" /></InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="email" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="hello@example.com"
                />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Hotline <span className="text-destructive">*</span></Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-xs border-r border-border pr-2">+84</span>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="phone" type="tel" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder="901 234 567"
                />
              </InputGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website chính thức</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText><Globe className="size-4 text-muted-foreground" /></InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="website" name="website"
                  value={formData.website} onChange={handleChange}
                  placeholder="yourdomain.com"
                />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Đường dẫn trang (Slug)</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <LinkIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs border-r border-border pr-2">gigi.vn/r/</span>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="slug" name="slug"
                  value={formData.slug} onChange={handleChange}
                  placeholder="the-continental"
                />
              </InputGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Visuals ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Hình ảnh &amp; Nhận diện</CardTitle>
          <CardDescription>Ảnh đại diện, ảnh bìa và không gian nhà hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="space-y-2">
              <Label>Logo thương hiệu</Label>
              <label className="cursor-pointer block">
                <div className={cn(
                  "size-32 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all group",
                  logoPreview ? "border-transparent shadow-lg" : "border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
                )}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/60 group-hover:text-primary transition-colors">
                      <Store className="size-8" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Tải lên</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
              </label>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label>Ảnh bìa (Cover)</Label>
              <label className="cursor-pointer h-32 block">
                <div className={cn(
                  "w-full h-full rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all group relative",
                  coverPreview ? "border-transparent shadow-lg" : "border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
                )}>
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="size-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/60 group-hover:text-primary transition-colors">
                      <ImagePlus className="size-8" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Tải ảnh bìa</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Operation Details ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Quy mô &amp; Hoạt động</CardTitle>
          <CardDescription>Địa điểm, giờ mở cửa và năng lực phục vụ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
              <Select value={formData.city || undefined} onValueChange={(v) => { set('city', v); set('district', ''); }}>
                <SelectTrigger id="city" className="w-full">
                  <SelectValue placeholder="Chọn tỉnh thành" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width]">
                  {MOCK_PROVINCES.map((opt) => (
                    <SelectItem key={opt.code} value={String(opt.code)}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Select value={formData.district || undefined} onValueChange={(v) => set('district', v)} disabled={!formData.city}>
                <SelectTrigger id="district" className="w-full">
                  <SelectValue placeholder="Chọn quận huyện" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width]">
                  {districts.map((opt) => (
                    <SelectItem key={opt.code} value={String(opt.code)}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ chi tiết</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText><MapPin className="size-4 text-muted-foreground" /></InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="address" name="address"
                value={formData.address} onChange={handleChange}
                placeholder="Số nhà, tên toà nhà, đường..."
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cuisine">Loại ẩm thực <span className="text-destructive">*</span></Label>
              <Select value={formData.cuisine || undefined} onValueChange={(v) => set('cuisine', v)}>
                <SelectTrigger id="cuisine" className="w-full">
                  <SelectValue placeholder="Chọn ẩm thực" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width]">
                  {cuisineTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Sức chứa</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start"><InputGroupText><Users className="size-4 text-muted-foreground" /></InputGroupText></InputGroupAddon>
                <InputGroupInput id="capacity" type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="50" min="1" />
              </InputGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Mức giá</Label>
              <div className="flex gap-2">
                {PRICE_RANGES.map((p) => (
                  <button key={p} type="button" onClick={() => set('priceRange', formData.priceRange === p ? '' : p)}
                    className={cn(
                      'flex-1 h-9 rounded-lg border font-bold transition-all text-sm',
                      formData.priceRange === p
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2 border-t border-border">
            <Label className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" /> Lịch hoạt động <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {weekDays.map((day) => (
                <DayChip key={day.id} label={day.label} selected={formData.workingDays.includes(day.id)} onClick={() => handleToggle('workingDays', day.id)} />
              ))}
            </div>
            {formData.workingDays.length > 0 && (
              <div className="flex flex-col gap-3">
                {formData.workingDays.map((dayId) => {
                  const day = weekDays.find((d) => d.id === dayId)!;
                  const hours = formData.dayHours[dayId] ?? DEFAULT_DAY_HOURS;
                  return (
                    <div key={dayId} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border">
                      <span className="text-sm font-medium w-20 text-muted-foreground">{day.full}</span>
                      <div className="flex items-center gap-3 flex-1 max-w-xs">
                        <Input type="time" value={hours.open} onChange={(e) => handleDayHour(dayId, 'open', e.target.value)} className="h-9 font-medium bg-background" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="time" value={hours.close} onChange={(e) => handleDayHour(dayId, 'close', e.target.value)} className="h-9 font-medium bg-background" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Amenities & Features ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Dịch vụ &amp; Tiện ích</CardTitle>
          <CardDescription>Tối ưu trải nghiệm cho khách hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Tiện ích không gian</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviceOptions.map((s) => (
                <ToggleChip key={s.id} icon={s.icon} label={s.label} selected={formData.services.includes(s.id)} onClick={() => handleToggle('services', s.id)} />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <Label>Chấp nhận thanh toán</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentOptions.map((p) => (
                <ToggleChip key={p.id} icon={p.icon} label={p.label} selected={formData.paymentMethods.includes(p.id)} onClick={() => handleToggle('paymentMethods', p.id)} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Brand Story ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Câu chuyện thương hiệu</CardTitle>
          <CardDescription>Mô tả, món đặc sản và mạng xã hội</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Giới thiệu tổng quan</Label>
            <Textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              placeholder="Kể câu chuyện về nguồn cảm hứng, không gian và triết lý ẩm thực..."
              className="min-h-[120px] resize-y bg-background"
            />
            <p className="text-xs text-muted-foreground text-right">{formData.description.length} ký tự</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specialties">Món ăn làm nên tên tuổi (Signature)</Label>
            <Textarea
              id="specialties" name="specialties"
              value={formData.specialties} onChange={handleChange}
              placeholder="Bò Wagyu dát vàng, Lẩu Tứ Xuyên..."
              className="min-h-[80px] resize-y bg-background"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <Label>Mạng xã hội</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'instagram', icon: <Instagram className="size-4" />, placeholder: '@instagram' },
                { id: 'facebook', icon: <Facebook className="size-4" />, placeholder: 'facebook/page' },
                { id: 'tiktok', icon: <TwitterX className="size-4" />, placeholder: '@tiktok' },
              ].map(({ id, icon, placeholder }) => (
                <InputGroup key={id}>
                  <InputGroupAddon align="inline-start"><InputGroupText>{icon}</InputGroupText></InputGroupAddon>
                  <InputGroupInput id={id} name={id} value={formData[id as 'instagram'|'facebook'|'tiktok']} onChange={handleChange} placeholder={placeholder} />
                </InputGroup>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Từ khoá tìm kiếm (Tags)</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><InputGroupText><Plus className="size-4" /></InputGroupText></InputGroupAddon>
              <InputGroupInput id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Nhập từ khoá và nhấn Enter..." />
            </InputGroup>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} className="pl-3 pr-2 py-1 bg-secondary hover:bg-destructive/10 text-foreground hover:text-destructive hover:border-destructive border border-border transition-colors cursor-pointer flex gap-1.5 items-center" onClick={() => handleRemoveTag(tag)}>
                    {tag} <span className="text-muted-foreground/50 hover:text-destructive">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
