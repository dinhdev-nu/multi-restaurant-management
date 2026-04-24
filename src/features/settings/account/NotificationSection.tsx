import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Bell, Mail, Smartphone, Check, RefreshCw } from "lucide-react"
import { useUserStore } from "@/stores/user-store"
import { toAppError } from "@/services/error"

type NotifFreq = "instant" | "daily" | "weekly"

const FreqSelect = ({ value, onChange }: { value: NotifFreq; onChange: (value: NotifFreq) => void }) => (
    <Select value={value} onValueChange={(newValue) => onChange(newValue as NotifFreq)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="instant">Ngay lập tức</SelectItem>
            <SelectItem value="daily">Tổng hợp ngày</SelectItem>
            <SelectItem value="weekly">Tổng hợp tuần</SelectItem>
        </SelectContent>
    </Select>
)

export function NotificationSection() {
    const profile = useUserStore((state) => state.profile)
    const preferences = useUserStore((state) => state.preferences)
    const savePreferences = useUserStore((state) => state.savePreferences)
    const isSavingProfile = useUserStore((state) => state.isSavingProfile)

    const [notifEmail, setNotifEmail] = useState<boolean | null>(null)
    const [notifEmailFreq, setNotifEmailFreq] = useState<NotifFreq>("instant")
    const [notifPhone, setNotifPhone] = useState<boolean | null>(null)
    const [notifPhoneFreq, setNotifPhoneFreq] = useState<NotifFreq>("instant")
    const [notifPush, setNotifPush] = useState<boolean | null>(null)
    const [notifPushFreq, setNotifPushFreq] = useState<NotifFreq>("instant")

    const resolvedNotifEmail = notifEmail ?? preferences?.notifications.email ?? false
    const resolvedNotifPhone = notifPhone ?? preferences?.notifications.sms ?? false
    const resolvedNotifPush = notifPush ?? preferences?.notifications.push ?? false

    const handleSaveNotifications = async () => {
        try {
            await savePreferences({
                notifications: {
                    email: resolvedNotifEmail,
                    sms: resolvedNotifPhone,
                    push: resolvedNotifPush,
                },
            })
            toast.success("Đã lưu cài đặt thông báo")
        } catch (error) {
            toast.error(toAppError(error, "Unable to save notifications").message)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Notification Channels</CardTitle>
                    <CardDescription>Choose channels and frequency for each notification type</CardDescription>
                </CardHeader>

                <CardContent className="space-y-1">
                    <div className="flex items-center justify-between py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates at <span className="text-foreground">{profile?.email ?? "your email"}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {resolvedNotifEmail && <FreqSelect value={notifEmailFreq} onChange={setNotifEmailFreq} />}
                            <Switch checked={resolvedNotifEmail} onCheckedChange={setNotifEmail} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">SMS Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive texts at <span className="text-foreground">{profile?.phone ?? "your phone number"}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {resolvedNotifPhone && <FreqSelect value={notifPhoneFreq} onChange={setNotifPhoneFreq} />}
                            <Switch checked={resolvedNotifPhone} onCheckedChange={setNotifPhone} disabled={!profile?.phone} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-foreground">Push Notifications</p>
                                <p className="text-sm text-muted-foreground">In-app and browser push alerts</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {resolvedNotifPush && <FreqSelect value={notifPushFreq} onChange={setNotifPushFreq} />}
                            <Switch checked={resolvedNotifPush} onCheckedChange={setNotifPush} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isSavingProfile}>
                    {isSavingProfile ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />Save Notifications
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
