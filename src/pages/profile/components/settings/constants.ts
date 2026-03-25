import { LogIn, Shield, Lock, ShieldAlert, Unlock } from "lucide-react";

export const integrations = [
  { id: "salesforce", name: "Salesforce",       description: "Sync contacts and opportunities",    connected: true,  lastSync: "2 hours ago" },
  { id: "hubspot",    name: "HubSpot",           description: "Marketing automation and CRM",       connected: true,  lastSync: "5 mins ago"  },
  { id: "slack",      name: "Slack",             description: "Team notifications and alerts",      connected: true,  lastSync: "Real-time"   },
  { id: "gmail",      name: "Gmail",             description: "Email tracking and sync",            connected: false, lastSync: null          },
  { id: "calendar",   name: "Google Calendar",   description: "Meeting scheduling",                 connected: false, lastSync: null          },
  { id: "zoom",       name: "Zoom",              description: "Video conferencing integration",     connected: true,  lastSync: "1 hour ago"  },
];

export const AUDIT_LOG = [
  { id: "1", type: "login",    icon: LogIn,      label: "Đăng nhập thành công",   detail: "Chrome · Windows",     ip: "192.168.1.1",  at: "2026-03-23T09:12:00Z" },
  { id: "2", type: "2fa",      icon: Shield,     label: "Bật xác thực 2 lớp",     detail: "Authenticator app",    ip: "192.168.1.1",  at: "2026-03-22T14:00:00Z" },
  { id: "3", type: "password", icon: Lock,       label: "Đổi mật khẩu",           detail: "",                     ip: "192.168.1.2",  at: "2026-03-21T08:30:00Z" },
  { id: "4", type: "login",    icon: LogIn,      label: "Đăng nhập thành công",   detail: "Safari · macOS",       ip: "10.0.0.5",     at: "2026-03-20T19:45:00Z" },
  { id: "5", type: "2fa",      icon: Unlock,     label: "Tắt xác thực 2 lớp",    detail: "Authenticator app",    ip: "10.0.0.5",     at: "2026-03-19T11:00:00Z" },
  { id: "6", type: "login",    icon: ShieldAlert,label: "Đăng nhập thất bại",     detail: "Sai mật khẩu",         ip: "203.0.113.10", at: "2026-03-18T03:22:00Z" },
];

export const MOCK_TOKENS = [
  { id: "t1", name: "Production API Key",   prefix: "gigi_pk_", masked: "••••••••••••••••3f8a", createdAt: "2026-01-15", lastUsed: "2 hours ago" },
  { id: "t2", name: "Development API Key",  prefix: "gigi_sk_", masked: "••••••••••••••••9b2c", createdAt: "2026-02-01", lastUsed: "5 days ago"  },
];

export const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active:   { label: "Active",   className: "bg-success/20 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  banned:   { label: "Banned",   className: "bg-destructive/20 text-destructive border-destructive/30" },
  pending:  { label: "Pending",  className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
};

export const ROLE_LABEL: Record<string, string> = { admin: "Administrator", user: "Member" };

export function getInitials(fullName: string | undefined | null): string {
  if (!fullName?.trim()) return "?";
  const parts = fullName.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}
