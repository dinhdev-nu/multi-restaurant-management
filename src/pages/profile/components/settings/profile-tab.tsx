import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Palette, Database, Mail, Globe, Check, Zap, Phone, CheckCircle2,
  Instagram, Twitter, Linkedin, Copy, Clock, RefreshCw, CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserStore } from "@/stores/user-store";
import { toAppError } from "@/lib/api/error";
import { getInitials, STATUS_BADGE, ROLE_LABEL } from "./constants";

export function ProfileTab() {
  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Social links
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

  // Display
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState<"en" | "vi">("vi");

  const profile = useUserStore((s) => s.profile);
  const preferences = useUserStore((s) => s.preferences);
  const isLoadingProfile = useUserStore((s) => s.isLoadingProfile);
  const isSavingProfile = useUserStore((s) => s.isSavingProfile);
  const saveProfile = useUserStore((s) => s.saveProfile);
  const savePreferences = useUserStore((s) => s.savePreferences);

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
  }, [preferences]);

  const handleSave = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await saveProfile({ full_name: fullName, ...(gender && { gender }), ...(dateOfBirth && { date_of_birth: dateOfBirth }) });
      await savePreferences({ theme, language });
      toast.success("Đã lưu thay đổi");
    } catch (error) {
      toast.error(toAppError(error, "Unable to save settings").message);
    }
  };

  const statusBadge = profile?.status ? (STATUS_BADGE[profile.status] ?? STATUS_BADGE.inactive) : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Personal info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Personal Information</CardTitle>
          <CardDescription>Update your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {statusBadge && <Badge className={statusBadge.className}>{statusBadge.label}</Badge>}
                {profile?.system_role && (
                  <Badge variant="outline" className="text-xs">{ROLE_LABEL[profile.system_role] ?? profile.system_role}</Badge>
                )}
              </div>
              <Button variant="outline" size="sm">Change Avatar</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          {/* Name fields with InputGroup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText><User className="w-4 h-4" /></InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText><User className="w-4 h-4" /></InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </InputGroup>
            </div>

            {/* Email – readonly with copy button */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                Email {profile?.email_verified_at && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              </Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText><Mail className="w-4 h-4" /></InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="email" type="email" value={profile?.email ?? ""}
                  className="cursor-default"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-sm" variant="ghost"
                    onClick={() => { void navigator.clipboard.writeText(profile?.email ?? ""); toast.success("Copied!"); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Phone with +84 prefix */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Phone {profile?.phone_verified_at && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              </Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Phone className="w-4 h-4" />
                    <span className="text-xs border-r border-border pr-2">+84</span>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="phone" value={profile?.phone ?? ""}
                  placeholder="Not set" className="cursor-default"
                />
              </InputGroup>
            </div>

            {/* Date of birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateOfBirth"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background h-9",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(new Date(dateOfBirth), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={(date) => setDateOfBirth(date ? format(date, "yyyy-MM-dd") : "")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender || "_none"} onValueChange={(v) => setGender(v === "_none" ? "" : v as "male" | "female" | "other")}>
                <SelectTrigger id="gender" className="w-full"><SelectValue placeholder="Prefer not to say" /></SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width]">
                  <SelectItem value="_none">Prefer not to say</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio" value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself — your role, interests, or a fun fact..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Social links */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Social Links</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: "website",  Icon: Globe,     prefix: "https://",    value: website,   set: setWebsite,   placeholder: "yourwebsite.com"   },
            { id: "twitter",  Icon: Twitter,   prefix: "x.com/",      value: twitter,   set: setTwitter,   placeholder: "username"           },
            { id: "instagram",Icon: Instagram, prefix: "instagram.com/",value: instagram,set: setInstagram,placeholder: "username"           },
            { id: "linkedin", Icon: Linkedin,  prefix: "linkedin.com/in/",value: linkedin,set: setLinkedin,placeholder: "your-profile"       },
          ].map(({ id, Icon, prefix, value, set: setter, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id} className="capitalize">{id === "website" ? "Website" : id.charAt(0).toUpperCase() + id.slice(1)}</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs border-r border-border pr-2">{prefix}</span>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id={id} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} />
              </InputGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Display preferences */}
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
            <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
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
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
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
        <Button onClick={handleSave} disabled={isSavingProfile || isLoadingProfile}>
          {isSavingProfile ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Check className="w-4 h-4 mr-2" />Save Changes</>)}
        </Button>
      </div>
    </div>
  );
}
