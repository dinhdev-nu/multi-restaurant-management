import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RestaurantProfileRegistrationForm } from "@/features/dashboard/components/RestaurantProfileRegistrationForm";
import {
    CreateRestaurantProvider,
    useCreateRestaurantActions,
    useCreateRestaurantMeta,
} from "@/features/new/FormProvider";
import {
    User,
    Bell,
    Shield,
    Link2,
    Mail,
    Smartphone,
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

interface NotificationSetting {
    id: string;
    label: string;
    description: string;
    email: boolean;
    push: boolean;
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

const notificationSettings: NotificationSetting[] = [
    { id: "deal_updates", label: "Cập nhật giao dịch", description: "Nhận thông báo khi giao dịch thay đổi trạng thái", email: true, push: true },
    { id: "staff_activity", label: "Hoạt động nhân viên", description: "Cập nhật về hiệu suất và mốc quan trọng của nhân viên", email: true, push: false },
    { id: "pipeline_alerts", label: "Cảnh báo quy trình", description: "Cảnh báo thay đổi và rủi ro quy trình", email: true, push: true },
    { id: "forecast_updates", label: "Cập nhật dự báo", description: "Báo cáo tổng kết dự báo hàng tuần", email: true, push: false },
    { id: "acceptance_requests", label: "Yêu cầu cần chấp nhận", description: "Thông báo về các yêu cầu chấp nhận", email: false, push: true },
];

const tabs: Tab[] = [
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "integrations", label: "Tích hợp", icon: Link2 },
    { id: "security", label: "Bảo mật", icon: Shield },
];

function RestaurantProfileMainContent() {
    const { submitForm } = useCreateRestaurantActions();
    const { isSubmitting, isUploadingAssets } = useCreateRestaurantMeta();

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

export function SettingsSection() {
    const DELETE_CONFIRM_TEXT = "XOA NHA HANG";
    const [activeTab, setActiveTab] = useState("profile");
    const [deleteRestaurantConfirmText, setDeleteRestaurantConfirmText] = useState("");

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
                <CreateRestaurantProvider>
                    <RestaurantProfileMainContent />
                </CreateRestaurantProvider>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Tùy chọn thông báo</CardTitle>
                        <CardDescription>Chọn cách và khi nào bạn muốn nhận thông báo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-sm text-muted-foreground">
                                <span>Loại thông báo</span>
                                <span className="text-center flex items-center justify-center gap-1.5">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </span>
                                <span className="text-center flex items-center justify-center gap-1.5">
                                    <Smartphone className="w-4 h-4" />
                                    Push
                                </span>
                            </div>
                            {notificationSettings.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div>
                                        <p className="font-medium text-foreground">{notification.label}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Switch checked={notification.email} />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Switch checked={notification.push} />
                                    </div>
                                </div>
                            ))}
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
