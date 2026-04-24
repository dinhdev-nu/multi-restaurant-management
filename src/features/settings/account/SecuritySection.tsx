import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group"
import {
    Lock,
    Key,
    RefreshCw,
    Globe,
    AlertTriangle,
    Download,
    Trash2,
} from "lucide-react"
import { useUserStore } from "@/stores/user-store"
import { toAppError } from "@/services/error"
import {
    changePassword,
    enable2fa,
    disable2fa,
    getSessions,
    revokeSession,
    type SessionInfo,
} from "@/services/auths"

import { AUDIT_LOG } from "./constants"

export function SecuritySection() {
    const profile = useUserStore((state) => state.profile)
    const fetchProfile = useUserStore((state) => state.fetchProfile)

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [sessions, setSessions] = useState<SessionInfo[]>([])
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)

    const [show2faForm, setShow2faForm] = useState(false)
    const [twoFaPassword, setTwoFaPassword] = useState("")
    const [isTwoFaLoading, setIsTwoFaLoading] = useState(false)

    const [deleteConfirm, setDeleteConfirm] = useState("")

    useEffect(() => {
        let cancelled = false

        setIsLoadingSessions(true)
        getSessions()
            .then((data) => {
                if (!cancelled) setSessions(data)
            })
            .catch(() => { })
            .finally(() => {
                if (!cancelled) setIsLoadingSessions(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordError("Mật khẩu mới không khớp")
            return
        }

        setPasswordError(null)
        setPasswordSuccess(false)
        setIsChangingPassword(true)

        try {
            await changePassword(currentPassword, newPassword)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
            setPasswordSuccess(true)
        } catch (error) {
            toast.error(toAppError(error, "Không thể đổi mật khẩu").message)
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await revokeSession(sessionId)
            setSessions((prev) => prev.filter((session) => session.session_id !== sessionId))
        } catch (error) {
            toast.error(toAppError(error, "Không thể thu hồi phiên").message)
        }
    }

    const handleToggle2fa = async () => {
        if (!twoFaPassword.trim()) return

        setIsTwoFaLoading(true)

        try {
            if (profile?.two_factor_enabled) {
                await disable2fa(twoFaPassword)
                toast.success("Đã tắt xác thực 2 lớp")
            } else {
                await enable2fa(twoFaPassword)
                toast.success("Đã bật xác thực 2 lớp")
            }
            setTwoFaPassword("")
            setShow2faForm(false)
            await fetchProfile()
        } catch (error) {
            toast.error(toAppError(error, "Không thể cập nhật 2FA").message)
        } finally {
            setIsTwoFaLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Password & Authentication</CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <InputGroup className="max-w-md">
                                <InputGroupAddon align="inline-start">
                                    <InputGroupText>
                                        <Lock className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <InputGroup className="max-w-md">
                                <InputGroupAddon align="inline-start">
                                    <InputGroupText>
                                        <Key className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <InputGroup className="max-w-md">
                                <InputGroupAddon align="inline-start">
                                    <InputGroupText>
                                        <Key className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                                />
                            </InputGroup>
                        </div>

                        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                        {passwordSuccess && <p className="text-sm text-success">Password updated successfully</p>}
                        <Button
                            variant="outline"
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                        >
                            {isChangingPassword ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile?.two_factor_enabled ? "bg-success/20" : "bg-muted"}`}>
                                <Key className={`w-5 h-5 ${profile?.two_factor_enabled ? "text-success" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Authenticator App</p>
                                <p className="text-sm text-muted-foreground">Use an authenticator app for 2FA codes</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge className={profile?.two_factor_enabled ? "bg-success/20 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}>
                                {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShow2faForm((value) => !value)
                                    setTwoFaPassword("")
                                }}
                            >
                                {show2faForm ? "Cancel" : "Manage"}
                            </Button>
                        </div>
                    </div>

                    {show2faForm && (
                        <div className="px-4 py-3 rounded-lg border border-border bg-secondary/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-sm text-muted-foreground">
                                {profile?.two_factor_enabled
                                    ? "Enter your password to disable 2FA."
                                    : "Enter your password to enable 2FA."}
                            </p>
                            <div className="flex items-center gap-2">
                                <InputGroup className="max-w-xs">
                                    <InputGroupAddon align="inline-start">
                                        <InputGroupText>
                                            <Lock className="w-4 h-4" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        type="password"
                                        placeholder="Current password"
                                        value={twoFaPassword}
                                        onChange={(event) => setTwoFaPassword(event.target.value)}
                                        onKeyDown={(event) => event.key === "Enter" && handleToggle2fa()}
                                    />
                                </InputGroup>
                                <Button
                                    size="sm"
                                    variant={profile?.two_factor_enabled ? "destructive" : "default"}
                                    onClick={handleToggle2fa}
                                    disabled={isTwoFaLoading || !twoFaPassword.trim()}
                                >
                                    {isTwoFaLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : profile?.two_factor_enabled ? (
                                        "Disable 2FA"
                                    ) : (
                                        "Enable 2FA"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Active Sessions</CardTitle>
                    <CardDescription>Manage devices where you&apos;re signed in</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {isLoadingSessions ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="w-4 h-4 animate-spin" />Loading sessions...
                            </div>
                        ) : sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No active sessions found.</p>
                        ) : (
                            sessions.map((session, index) => (
                                <div
                                    key={session.session_id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border animate-in fade-in slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 75}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {session.device_info?.browser} — {session.device_info?.os}
                                                {session.is_current && (
                                                    <Badge className="ml-2 bg-success/20 text-success border-success/30 text-xs">Current</Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip_address} · {new Date(session.created_at).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>

                                    {!session.is_current && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRevokeSession(session.session_id)}
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Security Audit Log</CardTitle>
                    <CardDescription>Recent security events on your account</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-1">
                        {AUDIT_LOG.map((event, index) => {
                            const IconComp = event.icon
                            const isAlert = event.type === "login" && event.label.includes("thất bại")

                            return (
                                <div
                                    key={event.id}
                                    className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAlert ? "bg-destructive/10" : "bg-secondary"}`}>
                                        <IconComp className={`w-3.5 h-3.5 ${isAlert ? "text-destructive" : "text-muted-foreground"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isAlert ? "text-destructive" : "text-foreground"}`}>
                                            {event.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.ip} {event.detail && `· ${event.detail}`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {new Date(event.at).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card border-destructive/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <CardTitle className="text-base font-medium text-destructive">Danger Zone</CardTitle>
                    </div>
                    <CardDescription>Irreversible actions that affect your account</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                                <Download className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground text-sm">Export My Data</p>
                                <p className="text-xs text-muted-foreground">Download all your data as a ZIP archive</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Export</Button>
                    </div>

                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground text-sm">Delete Account</p>
                                <p className="text-xs text-muted-foreground">
                                    Permanently delete your account and all associated data. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deleteConfirm" className="text-xs text-muted-foreground">
                                Type <span className="font-mono text-foreground">DELETE</span> to confirm
                            </Label>
                            <InputGroup>
                                <InputGroupInput
                                    id="deleteConfirm"
                                    value={deleteConfirm}
                                    onChange={(event) => setDeleteConfirm(event.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="font-mono"
                                />
                            </InputGroup>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteConfirm !== "DELETE"}
                                className="w-full sm:w-auto"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
