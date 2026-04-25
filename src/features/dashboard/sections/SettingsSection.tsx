import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RestaurantProfileRegistrationForm } from "@/features/dashboard/components/RestaurantProfileRegistrationForm";
import { updateRestaurantOnlineOrders, updateRestaurantPublishStatus } from "@/services/restaurants";
import { toAppError } from "@/services/error";
import {
    CreateRestaurantProvider,
    useCreateRestaurantActions,
    useCreateRestaurantMeta,
} from "@/features/new/FormProvider";
import type { Restaurant, RestaurantStaffDetail } from "@/types/restaurant-type";
import { toast } from "sonner";
import {
    User,
    Bell,
    Shield,
    Link2,
    ExternalLink,
    Zap,
    Loader2,
    type LucideIcon,
} from "lucide-react";

interface Integration {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    lastSync: string | null;
}

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

const integrations: Integration[] = [
    { id: "salesforce", name: "Salesforce", description: "Đồng bộ liên hệ và cơ hội", connected: false, lastSync: null },
    { id: "hubspot", name: "HubSpot", description: "Tự động hóa marketing và CRM", connected: false, lastSync: null },
    { id: "slack", name: "Slack", description: "Thông báo và cảnh báo nhóm", connected: false, lastSync: null },
    { id: "gmail", name: "Gmail", description: "Theo dõi và đồng bộ email", connected: false, lastSync: null },
    { id: "calendar", name: "Google Calendar", description: "Lịch hẹn", connected: false, lastSync: null },
    { id: "zoom", name: "Zoom", description: "Tích hợp hội nghị trực tuyến", connected: false, lastSync: null },
];

const tabs: Tab[] = [
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "notifications", label: "Trạng thái", icon: Bell },
    { id: "integrations", label: "Tích hợp", icon: Link2 },
    { id: "security", label: "Bảo mật", icon: Shield },
];

function RestaurantProfileMainContent({ restaurantDetail }: { restaurantDetail?: Restaurant | RestaurantStaffDetail | null }) {
    const { submitForm, setField, setImagePreviews } = useCreateRestaurantActions();
    const { isSubmitting, isUploadingAssets } = useCreateRestaurantMeta();
    const hasPopulatedRef = useRef(false);

    // Populate form with restaurant data on mount only
    useEffect(() => {
        if (!restaurantDetail || hasPopulatedRef.current) return;

        hasPopulatedRef.current = true;

        // Populate all fields from restaurantDetail
        setField('name', restaurantDetail.name || '');
        if (restaurantDetail.slug) setField('slug', restaurantDetail.slug);
        if (restaurantDetail.description) setField('description', restaurantDetail.description);
        if (restaurantDetail.logo_url) setField('logo_url', restaurantDetail.logo_url);
        if (restaurantDetail.cover_image_url) setField('cover_image_url', restaurantDetail.cover_image_url);
        if (restaurantDetail.website) setField('website', restaurantDetail.website);
        if (restaurantDetail.cuisine_type) setField('cuisine_type', restaurantDetail.cuisine_type);
        if (restaurantDetail.price_range) setField('price_range', restaurantDetail.price_range);
        if (restaurantDetail.address) setField('address', restaurantDetail.address);
        if (restaurantDetail.city) setField('city', restaurantDetail.city);
        if (restaurantDetail.district) setField('district', restaurantDetail.district);
        if (restaurantDetail.ward) setField('ward', restaurantDetail.ward);
        if (restaurantDetail.phone) setField('phone', restaurantDetail.phone);
        if (restaurantDetail.email) setField('email', restaurantDetail.email);
        if (restaurantDetail.latitude !== undefined && restaurantDetail.latitude !== null) setField('latitude', restaurantDetail.latitude);
        if (restaurantDetail.longitude !== undefined && restaurantDetail.longitude !== null) setField('longitude', restaurantDetail.longitude);
        if (restaurantDetail.timezone) setField('timezone', restaurantDetail.timezone);
        if (restaurantDetail.operating_hours) setField('operating_hours', restaurantDetail.operating_hours);
        if (restaurantDetail.gallery_urls && restaurantDetail.gallery_urls.length > 0) {
            setField('gallery_urls', restaurantDetail.gallery_urls);
        }

        // Set image previews from existing URLs
        if (setImagePreviews) {
            setImagePreviews(
                restaurantDetail.logo_url,
                restaurantDetail.cover_image_url,
                restaurantDetail.gallery_urls
            );
        }
    }, [restaurantDetail, setField, setImagePreviews]);

    return (
        <form onSubmit={submitForm} className="space-y-6">
            <RestaurantProfileRegistrationForm />

            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-accent hover:bg-accent/90 text-white"
                    disabled={isSubmitting || isUploadingAssets}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        "Lưu thông tin nhà hàng"
                    )}
                </Button>
            </div>
        </form>
    );
}

interface SettingsSectionProps {
    restaurantDetail?: Restaurant | RestaurantStaffDetail | null;
}

export function SettingsSection({ restaurantDetail }: SettingsSectionProps) {
    const DELETE_CONFIRM_TEXT = "XOA NHA HANG";
    const [activeTab, setActiveTab] = useState("profile");
    const [deleteRestaurantConfirmText, setDeleteRestaurantConfirmText] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const [isTogglingOnlineOrders, setIsTogglingOnlineOrders] = useState(false);
    const [publishEnabled, setPublishEnabled] = useState(Boolean(restaurantDetail?.is_published));
    const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(Boolean(restaurantDetail?.accepts_online_orders));

    useEffect(() => {
        setPublishEnabled(Boolean(restaurantDetail?.is_published));
        setOnlineOrdersEnabled(Boolean(restaurantDetail?.accepts_online_orders));
    }, [restaurantDetail?.is_published, restaurantDetail?.accepts_online_orders]);

    const restaurantId = restaurantDetail?._id;

    const handlePublishChange = async (checked: boolean) => {
        if (!restaurantId) return;

        const previous = publishEnabled;
        setPublishEnabled(checked);
        setIsPublishing(true);

        try {
            await updateRestaurantPublishStatus(restaurantId, { is_published: checked });
            toast.success(checked ? "Nhà hàng đã được xuất bản" : "Nhà hàng đã được ẩn");
        } catch (error) {
            setPublishEnabled(previous);
            const appError = toAppError(error, "Không thể cập nhật trạng thái xuất bản");
            toast.error(appError.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleOnlineOrdersChange = async (checked: boolean) => {
        if (!restaurantId) return;

        const previous = onlineOrdersEnabled;
        setOnlineOrdersEnabled(checked);
        setIsTogglingOnlineOrders(true);

        try {
            await updateRestaurantOnlineOrders(restaurantId, { accepts_online_orders: checked });
            toast.success(checked ? "Đã bật nhận đơn online" : "Đã tắt nhận đơn online");
        } catch (error) {
            setOnlineOrdersEnabled(previous);
            const appError = toAppError(error, "Không thể cập nhật trạng thái nhận đơn online");
            toast.error(appError.message);
        } finally {
            setIsTogglingOnlineOrders(false);
        }
    };

    const handleDeleteRestaurant = () => {
        if (deleteRestaurantConfirmText.trim().toUpperCase() !== DELETE_CONFIRM_TEXT) {
            return;
        }

        // TODO: Wire API call to permanently delete current restaurant.
    };

    const isDeleteRestaurantEnabled =
        deleteRestaurantConfirmText.trim().toUpperCase() === DELETE_CONFIRM_TEXT;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Cài đặt</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý hồ sơ nhà hàng, thông báo, tích hợp và bảo mật.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-secondary border border-border rounded-lg w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab.id === activeTab
                                ? "bg-card text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <CreateRestaurantProvider isEditing={true} restaurantId={restaurantDetail?._id}>
                    <RestaurantProfileMainContent restaurantDetail={restaurantDetail} />
                </CreateRestaurantProvider>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Trạng thái hoạt động</CardTitle>
                        <CardDescription>Điều khiển trạng thái xuất bản và nhận đơn online của nhà hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/20 p-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">Xuất bản nhà hàng</p>
                                        <Badge className={publishEnabled ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}>
                                            {publishEnabled ? "Đang hiển thị" : "Đang ẩn"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Bật để nhà hàng xuất hiện trên các trang công khai.
                                    </p>
                                </div>
                                <Switch
                                    checked={publishEnabled}
                                    onCheckedChange={handlePublishChange}
                                    disabled={!restaurantId || isPublishing}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/20 p-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">Nhận đơn online</p>
                                        <Badge className={onlineOrdersEnabled ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}>
                                            {onlineOrdersEnabled ? "Đang bật" : "Đang tắt"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Cho phép khách đặt món trực tuyến cho nhà hàng này.
                                    </p>
                                </div>
                                <Switch
                                    checked={onlineOrdersEnabled}
                                    onCheckedChange={handleOnlineOrdersChange}
                                    disabled={!restaurantId || isTogglingOnlineOrders}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Integrations */}
            {activeTab === "integrations" && (
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Dịch vụ đã kết nối</CardTitle>
                        <CardDescription>Quản lý các tích hợp bên thứ ba</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {integrations.map((integration, index) => (
                                <div
                                    key={integration.id}
                                    className="p-4 rounded-lg border bg-secondary/20 border-border hover:border-muted-foreground/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                    style={{ animationDelay: `${index * 75}ms` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{integration.name}</p>
                                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-muted text-muted-foreground border-border">
                                            Chưa kết nối
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Chưa cấu hình</span>
                                        <Button size="sm" className="h-8 bg-accent hover:bg-accent/90 text-white">
                                            Kết nối
                                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Security */}
            {activeTab === "security" && (<>
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-destructive">Xóa nhà hàng</CardTitle>
                        <CardDescription>Hành động này sẽ xóa vĩnh viễn dữ liệu nhà hàng và không thể hoàn tác</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-sm text-muted-foreground">
                                Khi xóa nhà hàng, toàn bộ thông tin hồ sơ, menu, đơn hàng và dữ liệu liên quan sẽ bị gỡ bỏ khỏi hệ thống.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                Nhập <span className="text-destructive">{DELETE_CONFIRM_TEXT}</span> để xác nhận xóa.
                            </p>
                            <Input
                                value={deleteRestaurantConfirmText}
                                onChange={(event) => setDeleteRestaurantConfirmText(event.target.value)}
                                placeholder={DELETE_CONFIRM_TEXT}
                                className="max-w-md bg-background border-border focus-visible:ring-destructive/20"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button variant="destructive" onClick={handleDeleteRestaurant} disabled={!isDeleteRestaurantEnabled}>
                                Xóa nhà hàng
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </>)}
        </div>
    );
}
