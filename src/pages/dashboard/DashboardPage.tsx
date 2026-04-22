import { useState, useEffect } from "react";
import "./analysis-reporting.css";
import { Sidebar } from "./dashboard/sidebar";
import { Header } from "./dashboard/header";
import { OverviewSection } from "./dashboard/sections/overview";
import { PipelineSection } from "./dashboard/sections/pipeline";
import { DealsSection } from "./dashboard/sections/deals";
import { CustomersSection } from "./dashboard/sections/customers";
import { TeamSection } from "./dashboard/sections/team";
import { ForecastingSection } from "./dashboard/sections/forecasting";
import { ReportsSection } from "./dashboard/sections/reports";
import { SettingsSection } from "./dashboard/sections/settings";

type SectionId =
    | "overview"
    | "pipeline"
    | "deals"
    | "customers"
    | "team"
    | "forecasting"
    | "reports"
    | "settings";

type ThemeMode = "light" | "dark";

const sectionMap: Record<SectionId, React.ReactNode> = {
    overview: <OverviewSection />,
    pipeline: <PipelineSection />,
    deals: <DealsSection />,
    customers: <CustomersSection />,
    team: <TeamSection />,
    forecasting: <ForecastingSection />,
    reports: <ReportsSection />,
    settings: <SettingsSection />,
};

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState<SectionId>("overview");
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
    const [theme, setTheme] = useState<ThemeMode>(() => {
        // Get theme from localStorage or default to dark
        const stored = localStorage.getItem("dashboard-theme") as ThemeMode | null;
        return stored || "dark";
    });

    useEffect(() => {
        localStorage.setItem("dashboard-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    return (
        <div className={`analysis-reporting ${theme} min-h-screen bg-background overflow-hidden`}>
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                theme={theme}
                onThemeToggle={toggleTheme}
            />
            <div
                className={`flex flex-col h-screen transition-all duration-300 ease-out ${sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
                    }`}
            >
                <Header activeSection={activeSection} theme={theme} onThemeToggle={toggleTheme} />
                <main className="flex-1 p-6 overflow-auto">
                    <div
                        key={activeSection}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        {sectionMap[activeSection]}
                    </div>
                </main>
            </div>
        </div>
    );
}
