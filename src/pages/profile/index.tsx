import { useState, useEffect } from "react";
import { Header } from "./components/header";
import { SettingsSection } from "./components/setting";

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    if (isDark) html.classList.add("dark")
    else html.classList.remove("dark")
    return () => html.classList.remove("dark")
  }, [isDark])

  return (
    <div className={`profile-page${isDark ? " dark" : ""} flex flex-col min-h-screen bg-background`}>
      <Header isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
      <div className="flex flex-1">
        <div className="hidden sm:block flex-1 border-r border-border" />
        <main className="w-full max-w-3xl px-4 sm:px-8 py-6">
          <SettingsSection />
        </main>
        <div className="hidden sm:block flex-1 border-l border-border" />
      </div>
    </div>
  );
}
