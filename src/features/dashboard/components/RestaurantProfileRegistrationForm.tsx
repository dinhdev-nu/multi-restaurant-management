import React from 'react';
import {
    useCreateRestaurantActions,
    useCreateRestaurantMeta,
    useCreateRestaurantState,
} from '@/features/new/FormProvider';
import {
    MOCK_PROVINCES,
    MOCK_DISTRICTS,
    cuisineTypes,
    PRICE_RANGES,
    weekDays,
    DEFAULT_DAILY_OPERATING_HOUR,
} from '@/features/new/constants';
import type { DayKey, RestaurantDTO } from '@/features/new/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    InputGroup, InputGroupAddon, InputGroupInput, InputGroupText
} from '@/components/ui/input-group';
import {
    Store,
    Mail,
    Phone,
    Globe,
    Link as LinkIcon,
    MapPin,
    Camera,
    ImagePlus,
    Clock3,
    CheckCircle2,
    CircleX,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import type { SlugCheckStatus } from '@/features/new/FormProvider';
import { Button } from '@/components/ui/button';

const TIMEZONE_OPTIONS = [
    'Asia/Ho_Chi_Minh',
    'Asia/Bangkok',
    'UTC',
];

const EMPTY_SELECT_VALUE = '__none__';

function toSelectValue(value?: string) {
    return value && value.trim().length > 0 ? value : EMPTY_SELECT_VALUE;
}

function fromSelectValue(value: string) {
    return value === EMPTY_SELECT_VALUE ? '' : value;
}

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p> : null;

type SetField = (name: keyof RestaurantDTO, value: RestaurantDTO[keyof RestaurantDTO]) => void;
type ChangeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
type ChangeNumberField = (name: 'latitude' | 'longitude', value: string) => void;
type UploadImage = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo_url' | 'cover_image_url' | 'gallery_urls') => void;
type ChangeOperatingClosed = (dayId: DayKey, closed: boolean) => void;
type ChangeOperatingTime = (dayId: DayKey, key: 'open' | 'close', value: string) => void;

interface BaseFormSectionProps {
    formData: RestaurantDTO;
    errors: Partial<Record<keyof RestaurantDTO, string>>;
}

interface BrandIdentitySectionProps extends BaseFormSectionProps {
    setField: SetField;
    changeTextField: ChangeTextField;
    slugCheckStatus: SlugCheckStatus;
}

interface MediaSectionProps {
    logoPreview: string | null;
    coverPreview: string | null;
    galleryPreviews: string[];
    uploadImage: UploadImage;
}

interface LocationContactSectionProps extends BaseFormSectionProps {
    setField: SetField;
    changeTextField: ChangeTextField;
    changeNumberField: ChangeNumberField;
    requestCurrentLocation: () => void;
    isLocating: boolean;
    locationError: string | null;
}

interface OperatingHoursSectionProps {
    formData: RestaurantDTO;
    changeOperatingClosed: ChangeOperatingClosed;
    changeOperatingTime: ChangeOperatingTime;
}

function FormIntroHeader() {
    return (
        <div>
            <h2 className="text-xl font-semibold text-foreground">Hồ sơ nhà hàng</h2>
            <p className="text-sm text-muted-foreground mt-1">
                Cập nhật thông tin định danh, hình ảnh, liên hệ và giờ hoạt động của nhà hàng.
            </p>
        </div>
    );
}

function BrandIdentitySection({
    formData,
    errors,
    setField,
    changeTextField,
    slugCheckStatus,
}: BrandIdentitySectionProps) {
    const normalizedSlug = (formData.slug ?? '').trim();
    const shouldShowSlugIndicator = normalizedSlug.length > 0;

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-medium">Định danh thương hiệu</CardTitle>
                <CardDescription>Tên gọi, mô tả, website và loại hình nhà hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Tên nhà hàng <span className="text-destructive">*</span></Label>
                    <InputGroup>
                        <InputGroupAddon align="inline-start">
                            <InputGroupText><Store className="size-4 text-muted-foreground" /></InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                            id="name" name="name"
                            autoComplete="organization"
                            value={formData.name} onChange={changeTextField}
                            placeholder="VD: The Continental"
                            data-invalid={!!errors.name}
                        />
                    </InputGroup>
                    <FieldError message={errors.name} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText>
                                    <LinkIcon className="size-4 text-muted-foreground" />
                                    <span className="text-xs border-r border-border pr-2">gigi.vn/r/</span>
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="slug" name="slug"
                                value={formData.slug ?? ''} onChange={changeTextField}
                                placeholder="the-continental"
                                spellCheck={false}
                                autoCapitalize="none"
                                autoCorrect="off"
                                aria-invalid={slugCheckStatus === 'taken' || !!errors.slug}
                            />
                            {shouldShowSlugIndicator && (
                                <InputGroupAddon align="inline-end" className="pointer-events-none">
                                    {slugCheckStatus === 'checking' && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                                    {slugCheckStatus === 'available' && <CheckCircle2 className="size-4 text-emerald-600" />}
                                    {slugCheckStatus === 'taken' && <CircleX className="size-4 text-destructive" />}
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                        <FieldError message={errors.slug} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website chính thức</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText><Globe className="size-4 text-muted-foreground" /></InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="website" name="website"
                                type="url"
                                autoComplete="url"
                                spellCheck={false}
                                value={formData.website ?? ''} onChange={changeTextField}
                                placeholder="yourdomain.com"
                            />
                        </InputGroup>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cuisine_type">Loại ẩm thực</Label>
                        <Select value={toSelectValue(formData.cuisine_type)} onValueChange={(value) => setField('cuisine_type', fromSelectValue(value))}>
                            <SelectTrigger id="cuisine_type" className="w-full">
                                <SelectValue placeholder="Chọn ẩm thực" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={0} className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value={EMPTY_SELECT_VALUE}>Chưa chọn</SelectItem>
                                {cuisineTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Mức giá (1-4)</Label>
                        <div className="flex gap-2">
                            {PRICE_RANGES.map((priceRange) => (
                                <button
                                    key={priceRange}
                                    type="button"
                                    onClick={() => setField('price_range', formData.price_range === priceRange ? undefined : priceRange)}
                                    aria-pressed={formData.price_range === priceRange}
                                    className={cn(
                                        'flex-1 h-8 rounded-lg border font-bold transition-all text-sm inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                        formData.price_range === priceRange
                                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                                    )}
                                >
                                    {'₫'.repeat(priceRange)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description ?? ''}
                        onChange={changeTextField}
                        placeholder="Giới thiệu ngắn về nhà hàng của bạn…"
                        className="min-h-[120px] resize-y bg-background"
                    />
                    <p className="text-xs text-muted-foreground text-right">{(formData.description ?? '').length} ký tự</p>
                </div>
            </CardContent>
        </Card>
    );
}

function MediaSection({
    logoPreview,
    coverPreview,
    galleryPreviews,
    uploadImage,
}: MediaSectionProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-medium">Hình ảnh &amp; Nhận diện</CardTitle>
                <CardDescription>Logo, ảnh bìa và bộ ảnh thư viện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="space-y-2">
                        <Label>Logo thương hiệu</Label>
                        <label htmlFor="logo-upload" className="cursor-pointer block">
                            <input
                                id="logo-upload"
                                name="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={(event) => uploadImage(event, 'logo_url')}
                                className="peer sr-only"
                                aria-label="Tải logo thương hiệu"
                            />
                            <div className={cn(
                                'size-32 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all group peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                                logoPreview ? 'border-transparent shadow-lg' : 'border-dashed border-border hover:border-primary/50 hover:bg-primary/5'
                            )}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" width={128} height={128} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground/60 group-hover:text-primary transition-colors">
                                        <Store className="size-8" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Tải lên</span>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    <div className="space-y-2 flex-1">
                        <Label>Ảnh bìa (Cover)</Label>
                        <label htmlFor="cover-upload" className="cursor-pointer h-32 block">
                            <input
                                id="cover-upload"
                                name="cover-upload"
                                type="file"
                                accept="image/*"
                                onChange={(event) => uploadImage(event, 'cover_image_url')}
                                className="peer sr-only"
                                aria-label="Tải ảnh bìa"
                            />
                            <div className={cn(
                                'w-full h-full rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all group relative peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                                coverPreview ? 'border-transparent shadow-lg' : 'border-dashed border-border hover:border-primary/50 hover:bg-primary/5'
                            )}>
                                {coverPreview ? (
                                    <>
                                        <img src={coverPreview} alt="Cover" width={1200} height={400} className="w-full h-full object-cover" />
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
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Thư viện ảnh (Gallery)</Label>
                    <label htmlFor="gallery-upload" className="cursor-pointer block">
                        <input
                            id="gallery-upload"
                            name="gallery-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) => uploadImage(event, 'gallery_urls')}
                            className="peer sr-only"
                            aria-label="Tải thư viện ảnh"
                        />
                        <div className="w-full min-h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/70">
                                <ImagePlus className="size-6" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Tải thêm ảnh (tối đa 8)</span>
                            </div>
                        </div>
                    </label>

                    {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                            {galleryPreviews.map((url, index) => (
                                <div key={`${url}-${index}`} className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20">
                                    <img src={url} alt={`Gallery ${index + 1}`} width={400} height={400} loading="lazy" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function LocationContactSection({
    formData,
    errors,
    setField,
    changeTextField,
    changeNumberField,
    requestCurrentLocation,
    isLocating,
    locationError,
}: LocationContactSectionProps) {
    const provinceCode = formData.city
        ? MOCK_PROVINCES.find((option) => option.name === formData.city)?.code ?? null
        : null;
    const districts = provinceCode ? MOCK_DISTRICTS[provinceCode] ?? [] : [];

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-medium">Địa chỉ &amp; Liên hệ</CardTitle>
                <CardDescription>Thông tin vị trí, toạ độ và thông tin liên hệ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ <span className="text-destructive">*</span></Label>
                    <InputGroup>
                        <InputGroupAddon align="inline-start">
                            <InputGroupText><MapPin className="size-4 text-muted-foreground" /></InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                            id="address" name="address"
                            autoComplete="street-address"
                            value={formData.address} onChange={changeTextField}
                            placeholder="Số nhà, tên toà nhà, đường…"
                            data-invalid={!!errors.address}
                        />
                    </InputGroup>
                    <FieldError message={errors.address} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
                        <Select
                            value={toSelectValue(formData.city)}
                            onValueChange={(value) => {
                                const cityValue = fromSelectValue(value);

                                setField('city', cityValue);
                                setField('district', '');
                            }}
                        >
                            <SelectTrigger id="city" className="w-full">
                                <SelectValue placeholder="Chọn tỉnh thành" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={0} className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value={EMPTY_SELECT_VALUE}>Chọn tỉnh thành</SelectItem>
                                {MOCK_PROVINCES.map((option) => (
                                    <SelectItem key={option.code} value={option.name}>{option.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={errors.city} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="district">Quận/Huyện</Label>
                        <Select
                            value={toSelectValue(formData.district)}
                            onValueChange={(value) => setField('district', fromSelectValue(value))}
                            disabled={!formData.city}
                        >
                            <SelectTrigger id="district" className="w-full">
                                <SelectValue placeholder="Chọn quận huyện" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={0} className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value={EMPTY_SELECT_VALUE}>Chọn quận huyện</SelectItem>
                                {districts.map((option) => (
                                    <SelectItem key={option.code} value={option.name}>{option.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={requestCurrentLocation} disabled={isLocating}>
                        {isLocating ? 'Đang lấy vị trí...' : 'Lấy lại vị trí'}
                    </Button>
                    {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' && !locationError && (
                        <p className="text-xs text-emerald-600">Đã cập nhật tọa độ tự động từ vị trí hiện tại</p>
                    )}
                    {locationError && <p className="text-xs text-muted-foreground">{locationError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ward">Phường/Xã</Label>
                        <Input
                            id="ward"
                            name="ward"
                            value={formData.ward ?? ''}
                            onChange={changeTextField}
                            placeholder="Phường hoặc xã"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Múi giờ</Label>
                        <Select value={toSelectValue(formData.timezone)} onValueChange={(value) => setField('timezone', fromSelectValue(value))}>
                            <SelectTrigger id="timezone" className="w-full">
                                <SelectValue placeholder="Chọn múi giờ" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={0} className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value={EMPTY_SELECT_VALUE}>Chọn múi giờ</SelectItem>
                                {TIMEZONE_OPTIONS.map((timezoneOption) => (
                                    <SelectItem key={timezoneOption} value={timezoneOption}>{timezoneOption}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText><MapPin className="size-4 text-muted-foreground" /></InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="latitude"
                                name="latitude"
                                type="number"
                                inputMode="decimal"
                                autoComplete="off"
                                step="any"
                                value={formData.latitude ?? ''}
                                onChange={(event) => changeNumberField('latitude', event.target.value)}
                                placeholder="10.7769"
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText><MapPin className="size-4 text-muted-foreground" /></InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="longitude"
                                name="longitude"
                                type="number"
                                inputMode="decimal"
                                autoComplete="off"
                                step="any"
                                value={formData.longitude ?? ''}
                                onChange={(event) => changeNumberField('longitude', event.target.value)}
                                placeholder="106.7009"
                            />
                        </InputGroup>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText><Mail className="size-4 text-muted-foreground" /></InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                spellCheck={false}
                                value={formData.email ?? ''}
                                onChange={changeTextField}
                                placeholder="hello@example.com"
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Hotline</Label>
                        <InputGroup>
                            <InputGroupAddon align="inline-start">
                                <InputGroupText>
                                    <Phone className="size-4 text-muted-foreground" />
                                    <span className="text-xs border-r border-border pr-2">+84</span>
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="phone"
                                type="tel"
                                name="phone"
                                autoComplete="tel"
                                inputMode="tel"
                                value={formData.phone ?? ''}
                                onChange={changeTextField}
                                placeholder="901 234 567"
                            />
                        </InputGroup>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function OperatingHoursSection({
    formData,
    changeOperatingClosed,
    changeOperatingTime,
}: OperatingHoursSectionProps) {
    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-base font-medium">Giờ hoạt động</CardTitle>
                <CardDescription>
                    Thiết lập operating_hours theo từng ngày trong tuần
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                    {weekDays.map((day) => {
                        const dayId = day.id as DayKey;
                        const hours = formData.operating_hours[dayId] ?? DEFAULT_DAILY_OPERATING_HOUR;

                        return (
                            <div key={day.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border">
                                <div className="sm:w-24">
                                    <p className="text-sm font-medium text-muted-foreground">{day.full}</p>
                                </div>

                                <div className="flex items-center gap-2 min-w-[130px]">
                                    <Switch
                                        checked={hours.closed}
                                        onCheckedChange={(checked) => changeOperatingClosed(dayId, checked)}
                                    />
                                    <span className="text-sm text-muted-foreground">Đóng cửa</span>
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                    <InputGroup>
                                        <InputGroupAddon align="inline-start">
                                            <InputGroupText><Clock3 className="size-4 text-muted-foreground" /></InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="time"
                                            value={hours.open}
                                            onChange={(event) => changeOperatingTime(dayId, 'open', event.target.value)}
                                            disabled={hours.closed}
                                        />
                                    </InputGroup>

                                    <span className="text-muted-foreground">—</span>

                                    <InputGroup>
                                        <InputGroupAddon align="inline-start">
                                            <InputGroupText><Clock3 className="size-4 text-muted-foreground" /></InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="time"
                                            value={hours.close}
                                            onChange={(event) => changeOperatingTime(dayId, 'close', event.target.value)}
                                            disabled={hours.closed}
                                        />
                                    </InputGroup>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export function RestaurantProfileRegistrationForm() {
    const { formData, errors } = useCreateRestaurantState();
    const {
        setField,
        changeTextField,
        changeNumberField,
        changeOperatingClosed,
        changeOperatingTime,
        requestCurrentLocation,
        uploadImage,
    } = useCreateRestaurantActions();
    const { logoPreview, coverPreview, galleryPreviews, slugCheckStatus, isLocating, locationError } = useCreateRestaurantMeta();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 [&_[data-slot=input-group]]:bg-background [&_[data-slot=input-group]]:border-border [&_[data-slot=input]]:bg-background [&_[data-slot=input]]:border-border [&_[data-slot=select-trigger]]:bg-background [&_[data-slot=select-trigger]]:border-border">
            <FormIntroHeader />

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <BrandIdentitySection
                    formData={formData}
                    errors={errors}
                    setField={setField}
                    changeTextField={changeTextField}
                    slugCheckStatus={slugCheckStatus}
                />

                <LocationContactSection
                    formData={formData}
                    errors={errors}
                    setField={setField}
                    changeTextField={changeTextField}
                    changeNumberField={changeNumberField}
                    requestCurrentLocation={requestCurrentLocation}
                    isLocating={isLocating}
                    locationError={locationError}
                />

                <MediaSection
                    logoPreview={logoPreview}
                    coverPreview={coverPreview}
                    galleryPreviews={galleryPreviews}
                    uploadImage={uploadImage}
                />

                <OperatingHoursSection
                    formData={formData}
                    changeOperatingClosed={changeOperatingClosed}
                    changeOperatingTime={changeOperatingTime}
                />
            </div>
        </div>
    );
}
