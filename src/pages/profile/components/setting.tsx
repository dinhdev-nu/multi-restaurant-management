import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Link2, Shield } from "lucide-react";

import { ProfileTab } from "./settings/profile-tab";
import { NotificationsTab } from "./settings/notifications-tab";
import { IntegrationsTab } from "./settings/integrations-tab";
import { SecurityTab } from "./settings/security-tab";

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary border border-border p-1 flex-wrap h-auto gap-1">
          {[
            { value: "profile",       Icon: User,    label: "Profile" },
            { value: "notifications", Icon: Bell,    label: "Notifications" },
            { value: "integrations",  Icon: Link2,   label: "Integrations" },
            { value: "security",      Icon: Shield,  label: "Security" },
          ].map(({ value, Icon, label }) => (
            <TabsTrigger key={value} value={value} className="data-[state=active]:bg-card data-[state=active]:text-foreground">
              <Icon className="w-4 h-4 mr-2" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0 outline-none">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 outline-none">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="integrations" className="mt-0 outline-none">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="security" className="mt-0 outline-none">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
