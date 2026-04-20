import {
    useCreateRestaurantActions,
    useCreateRestaurantMeta,
    useCreateRestaurantState,
} from './FormProvider';
import { weekDays } from './constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Lock, Edit3, Store, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RestaurantDTO } from './constants';

interface PrivacyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface PreviewPanelProps {
    formData: RestaurantDTO;
    logoPreview: string | null;
}

interface CommitmentPanelProps {
    onBack: () => void;
    onSubmit: () => void;
}

interface PreviewFieldProps {
    label: string;
    value: string;
    mono?: boolean;
}

function toText(value?: string) {
    if (!value) return '—';

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : '—';
}

function formatPriceRange(priceRange?: RestaurantDTO['price_range']) {
    if (!priceRange) return '—';

    return `${'₫'.repeat(priceRange)} (${priceRange}/4)`;
}

function formatCoordinates(latitude?: number, longitude?: number) {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return '—';

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function formatFullAddress(formData: RestaurantDTO) {
    const parts = [formData.address, formData.ward, formData.district, formData.city]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(', ') : '—';
}

function formatMediaCount(formData: RestaurantDTO) {
    const logoCount = formData.logo_url ? 1 : 0;
    const coverCount = formData.cover_image_url ? 1 : 0;
    const galleryCount = formData.gallery_urls?.length ?? 0;
    const total = logoCount + coverCount + galleryCount;

    if (total === 0) return '0 mục';

    const detail = [
        logoCount > 0 ? 'logo' : '',
        coverCount > 0 ? 'cover' : '',
        galleryCount > 0 ? `${galleryCount} gallery` : '',
    ].filter(Boolean).join(' • ');

    return detail.length > 0 ? `${total} mục (${detail})` : `${total} mục`;
}

function PreviewField({ label, value, mono = false }: PreviewFieldProps) {
    return (
        <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
            <p className={`break-words font-medium leading-relaxed ${mono ? 'font-mono text-xs sm:text-sm' : 'text-sm'}`}>{value}</p>
        </div>
    );
}

function PreviewPanel({ formData, logoPreview }: PreviewPanelProps) {
    const phoneText = formData.phone ? `+84 ${formData.phone}` : '—';

    return (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-b border-border/80 bg-card/40 md:border-r md:border-b-0">
            <div className="p-6 sm:p-8 flex flex-col h-full z-10 min-h-0 gap-5">
                <div className="rounded-2xl border border-border/80 bg-card px-5 py-4 ring-1 ring-foreground/5 sm:px-6 sm:py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Hồ sơ / Xem trước
                    </p>
                    <div className="mt-4 flex items-start gap-4 sm:gap-5">
                        <div className="size-20 bg-background rounded-2xl border border-border shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="size-8 text-muted-foreground/30" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                            <h3 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight line-clamp-2">
                                {formData.name || 'Chưa nhập tên nhà hàng'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {formData.cuisine_type && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 shadow-none">{formData.cuisine_type}</Badge>}
                                {formData.city && <Badge variant="outline" className="border-border/80 text-foreground">{formData.city}</Badge>}
                                {formData.price_range && <Badge variant="outline" className="border-border/80 text-foreground">{formatPriceRange(formData.price_range)}</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground break-words">
                                {formData.slug ? `gigi.vn/r/${formData.slug}` : 'Slug chưa thiết lập'}
                            </p>
                        </div>
                    </div>
                </div>

                <ScrollArea className="min-h-0 flex-1 pr-2">
                    <div className="space-y-4 pb-3">
                        {formData.description && (
                            <div className="space-y-2 rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-4">
                                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Giới thiệu ngắn</span>
                                <p className="text-sm text-foreground leading-relaxed break-words line-clamp-5">{formData.description}</p>
                            </div>
                        )}

                        <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Liên hệ nhanh</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <PreviewField label="Email liên hệ" value={toText(formData.email)} />
                                <PreviewField label="Hotline" value={phoneText} />
                                <div className="sm:col-span-2">
                                    <PreviewField label="Địa chỉ chi tiết" value={toText(formData.address)} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tóm tắt mở rộng</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                <PreviewField
                                    label="Slug"
                                    value={formData.slug ? `gigi.vn/r/${formData.slug}` : '—'}
                                    mono
                                />
                                <PreviewField label="Website" value={toText(formData.website)} />
                                <PreviewField label="Mức giá" value={formatPriceRange(formData.price_range)} />
                                <PreviewField label="Múi giờ" value={toText(formData.timezone)} />
                                <PreviewField label="Quận/Huyện" value={toText(formData.district)} />
                                <PreviewField label="Phường/Xã" value={toText(formData.ward)} />
                                <PreviewField
                                    label="Tọa độ"
                                    value={formatCoordinates(formData.latitude, formData.longitude)}
                                    mono
                                />
                                <PreviewField label="Media" value={formatMediaCount(formData)} />
                                <div className="sm:col-span-2">
                                    <PreviewField label="Địa chỉ đầy đủ" value={formatFullAddress(formData)} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Giờ hoạt động</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {weekDays.map((day) => {
                                    const dayHours = formData.operating_hours[day.id];
                                    const operatingText = dayHours.closed ? 'Đóng cửa' : `${dayHours.open} - ${dayHours.close}`;

                                    return (
                                        <div key={day.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-secondary/20 px-3 py-2">
                                            <span className="text-xs font-semibold text-muted-foreground">{day.full}</span>
                                            <span className="text-xs font-medium text-foreground">{operatingText}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <div className="absolute top-0 right-0 p-32 opacity-[0.02] pointer-events-none">
                <Store className="size-96" />
            </div>
        </div>
    );
}

function CommitmentPanel({ onBack, onSubmit }: CommitmentPanelProps) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="border-b border-border/80 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5">
                <DialogHeader className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Xác nhận / Cam kết</p>
                    <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2 mt-1">
                        <ShieldCheck className="size-6 text-primary" />
                        Cam Kết Kỹ Thuật
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm">
                        Hệ thống thiết kế ưu tiên nhà sáng tạo nội dung và nhà phát triển. Chúng tôi không thu thập thông tin ngầm định.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 px-6 sm:px-8">
                <ScrollArea className="h-full min-h-0">
                    <div className="flex flex-col gap-4 py-5 pr-2">
                        <div className="space-y-2 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-foreground">
                                <Lock className="size-4 text-muted-foreground" />
                                Bảo vệ cấu trúc dữ liệu
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Dữ liệu của bạn được lưu trữ theo tiêu chuẩn JSON mã hoá end-to-end. Bạn sở hữu toàn bộ metadata nhà hàng và có thể xuất (export) bất cứ lúc nào qua API của nền tảng.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-foreground">
                                <Edit3 className="size-4 text-muted-foreground" />
                                Thông tin hiển thị minh bạch
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Mọi trường thông tin bạn cung cấp bên trái cấu thành một bản sao số (Digital Twin) trên bản đồ ẩm thực của chúng tôi. Không tự động thêm thuật toán chèn nội dung quảng cáo vào trang định danh của bạn.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-border/80 bg-secondary/20 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-foreground">
                                <Sparkles className="size-4 text-muted-foreground" />
                                Quyền của Nhà sáng tạo (Creator First)
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Sở hữu trí tuệ đối với hình ảnh và công thức thuộc về bạn. Chúng tôi chỉ đóng vai trò phân phối kỹ thuật nội dung đó với độ trễ siêu thấp qua CDN.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <div className="sticky bottom-0 shrink-0 border-t border-border/80 bg-background/95 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm sm:px-8 sm:pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button type="button" variant="ghost" onClick={onBack} className="w-full sm:w-auto font-medium">
                        Quay lại chỉnh sửa
                    </Button>
                    <Button type="button" onClick={onSubmit} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-bold px-6 shadow-xl">
                        Tạo hồ sơ số <ArrowRight className="size-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
    const { formData } = useCreateRestaurantState();
    const { logoPreview } = useCreateRestaurantMeta();
    const { submit } = useCreateRestaurantActions();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl md:max-w-5xl lg:max-w-5xl w-[92vw] p-0 overflow-hidden overscroll-contain gap-0 border-border bg-card shadow-2xl">
                <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] h-[88dvh] min-h-0">
                    <PreviewPanel formData={formData} logoPreview={logoPreview} />

                    <CommitmentPanel
                        onBack={() => onOpenChange(false)}
                        onSubmit={submit}
                    />

                </div>
            </DialogContent>
        </Dialog>
    );
}