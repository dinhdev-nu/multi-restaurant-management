import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bell,
  Shield,
  Palette,
  Link2,
  Database,
  Mail,
  Smartphone,
  Globe,
  Key,
  RefreshCw,
  Check,
  ExternalLink,
  Zap,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { toAppError } from "@/lib/api/error";
import { changePassword, enable2fa, disable2fa, getSessions, revokeSession, type SessionInfo } from "@/lib/api/auths";

const integrations = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Sync contacts and opportunities",
    connected: true,
    lastSync: "2 hours ago",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing automation and CRM",
    connected: true,
    lastSync: "5 mins ago",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team notifications and alerts",
    connected: true,
    lastSync: "Real-time",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email tracking and sync",
    connected: false,
    lastSync: null,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Meeting scheduling",
    connected: false,
    lastSync: null,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing integration",
    connected: true,
    lastSync: "1 hour ago",
  },
];

function getInitials(fullName: string | undefined | null): string {
  if (!fullName?.trim()) return "?"
  const parts = fullName.trim().split(/\s+/)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active:   { label: "Active",   className: "bg-success/20 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  banned:   { label: "Banned",   className: "bg-destructive/20 text-destructive border-destructive/30" },
  pending:  { label: "Pending",  className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  user: "Member",
}

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Display preferences
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState<"en" | "vi">("vi");

  // Notification preferences (from API)
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPhone, setNotifPhone] = useState(false);
  const [notifPush, setNotifPush] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // 2FA management
  const [show2faForm, setShow2faForm] = useState(false);
  const [twoFaPassword, setTwoFaPassword] = useState("");
  const [isTwoFaLoading, setIsTwoFaLoading] = useState(false);

  const profile = useUserStore((state) => state.profile);
  const preferences = useUserStore((state) => state.preferences);
  const isLoadingProfile = useUserStore((state) => state.isLoadingProfile);
  const isSavingProfile = useUserStore((state) => state.isSavingProfile);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const saveProfile = useUserStore((state) => state.saveProfile);
  const savePreferences = useUserStore((state) => state.savePreferences);

  useEffect(() => {
    void fetchProfile().catch(() => {
      toast.error("Unable to load profile data");
    });
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    const parts = profile.full_name?.trim().split(/\s+/);
    setFirstName(parts?.[0] || "");
    setLastName(parts?.slice(1).join(" ") || "");
    setGender(profile.gender || "");
    setDateOfBirth(profile.date_of_birth?.slice(0, 10) || "");
  }, [profile]);

  useEffect(() => {
    if (!preferences) return;
    setTheme(preferences.theme);
    setLanguage(preferences.language);
    setNotifEmail(preferences.notifications.email);
    setNotifPhone(preferences.notifications.phone);
    setNotifPush(preferences.notifications.push);
  }, [preferences]);

  const handleSave = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await saveProfile({
        full_name: fullName,
        ...(gender && { gender }),
        ...(dateOfBirth && { date_of_birth: dateOfBirth }),
      });
      await savePreferences({ theme, language });
    } catch (error) {
      toast.error(toAppError(error, "Unable to save settings").message);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await savePreferences({
        notifications: { email: notifEmail, phone: notifPhone, push: notifPush },
      });
    } catch (error) {
      toast.error(toAppError(error, "Unable to save notifications").message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess(true);
    } catch (error) {
      toast.error(toAppError(error, "Không thể đổi mật khẩu").message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } catch (error) {
      toast.error(toAppError(error, "Không thể thu hồi phiên").message);
    }
  };

  const handleToggle2fa = async () => {
    if (!twoFaPassword.trim()) return;
    setIsTwoFaLoading(true);
    try {
      if (profile?.two_factor_enabled) {
        await disable2fa(twoFaPassword);
        toast.success("Đã tắt xác thực 2 lớp");
      } else {
        await enable2fa(twoFaPassword);
        toast.success("Đã bật xác thực 2 lớp");
      }
      setTwoFaPassword("");
      setShow2faForm(false);
      await fetchProfile();
    } catch (error) {
      toast.error(toAppError(error, "Không thể cập nhật 2FA").message);
    } finally {
      setIsTwoFaLoading(false);
    }
  };

  // Tải sessions khi chuyển sang tab Security
  useEffect(() => {
    if (activeTab !== "security") return;
    let cancelled = false;
    setIsLoadingSessions(true);
    getSessions()
      .then((data) => { if (!cancelled) setSessions(data); })
      .catch(() => { /* silently ignore — sessions will remain empty */ })
      .finally(() => { if (!cancelled) setIsLoadingSessions(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const statusBadge = profile?.status ? (STATUS_BADGE[profile.status] ?? STATUS_BADGE.inactive) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary border border-border p-1 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar + meta */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge && (
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    )}
                    {profile?.system_role && (
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABEL[profile.system_role] ?? profile.system_role}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    Email
                    {profile?.email_verified_at && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email ?? ""}
                    readOnly
                    className="bg-secondary/50 cursor-default"
                  />
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                    {profile?.phone_verified_at && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    )}
                  </Label>
                  <Input
                    id="phone"
                    value={profile?.phone ?? ""}
                    readOnly
                    placeholder="Not set"
                    className="bg-secondary/50 cursor-default"
                  />
                </div>
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={gender || "_none"}
                    onValueChange={(v) => setGender(v === "_none" ? "" : v as "male" | "female" | "other")}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Prefer not to say" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Prefer not to say</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Display Preferences</CardTitle>
              <CardDescription>Customize how data is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">Interface display language</p>
                  </div>
                </div>
                <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "vi")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Compact View</p>
                    <p className="text-sm text-muted-foreground">Show more data in less space</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSavingProfile || isLoadingProfile}
            >
              {isSavingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Notification Channels</CardTitle>
              <CardDescription>Choose which channels you want to receive notifications on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {/* Email */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates at{" "}
                      <span className="text-foreground">{profile?.email ?? "your email"}</span>
                    </p>
                  </div>
                </div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              {/* SMS / Phone */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive texts at{" "}
                      <span className="text-foreground">{profile?.phone ?? "your phone number"}</span>
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifPhone}
                  onCheckedChange={setNotifPhone}
                  disabled={!profile?.phone}
                />
              </div>
              {/* Push */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">In-app and browser push alerts</p>
                  </div>
                </div>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Notifications
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Connected Services</CardTitle>
              <CardDescription>Manage your third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      integration.connected
                        ? "bg-secondary/50 border-border hover:border-accent/50"
                        : "bg-secondary/20 border-border hover:border-muted-foreground/30"
                    }`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            integration.connected ? "bg-success/20" : "bg-muted"
                          }`}
                        >
                          <Zap
                            className={`w-5 h-5 ${
                              integration.connected ? "text-success" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          integration.connected
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {integration.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {integration.connected ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Last sync: {integration.lastSync}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                              Sync
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                              Disconnect
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">Not configured</span>
                          <Button size="sm" className="h-8">
                            Connect
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Password & Authentication</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="max-w-md"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="max-w-md"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="max-w-md"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-500">Đổi mật khẩu thành công</p>
                )}
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                >
                  {isChangingPassword ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Đang cập nhật...</>
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
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app for 2FA codes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={
                    profile?.two_factor_enabled
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-muted text-muted-foreground border-border"
                  }>
                    {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShow2faForm((v) => !v); setTwoFaPassword(""); }}
                  >
                    {show2faForm ? "Cancel" : "Manage"}
                  </Button>
                </div>
              </div>

              {/* Inline 2FA password confirmation */}
              {show2faForm && (
                <div className="px-4 py-3 rounded-lg border border-border bg-secondary/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-sm text-muted-foreground">
                    {profile?.two_factor_enabled
                      ? "Nhập mật khẩu để xác nhận tắt xác thực 2 lớp."
                      : "Nhập mật khẩu để xác nhận bật xác thực 2 lớp."}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      placeholder="Mật khẩu hiện tại"
                      value={twoFaPassword}
                      onChange={(e) => setTwoFaPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleToggle2fa()}
                      className="max-w-xs"
                    />
                    <Button
                      size="sm"
                      variant={profile?.two_factor_enabled ? "destructive" : "default"}
                      onClick={handleToggle2fa}
                      disabled={isTwoFaLoading || !twoFaPassword.trim()}
                    >
                      {isTwoFaLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : profile?.two_factor_enabled ? (
                        "Tắt 2FA"
                      ) : (
                        "Bật 2FA"
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
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tải phiên đăng nhập...
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có phiên đăng nhập nào.</p>
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
                              <Badge className="ml-2 bg-success/20 text-success border-success/30 text-xs">
                                Current
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.ip_address} • {new Date(session.created_at).toLocaleDateString("vi-VN")}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
