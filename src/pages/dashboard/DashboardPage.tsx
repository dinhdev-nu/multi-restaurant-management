import { useEffect, useState, type ReactNode } from "react";
import "@/features/dashboard/analysis-reporting.css";
import {
    CustomersSection,
    DealsSection,
    ForecastingSection,
    Header,
    OverviewSection,
    PipelineSection,
    ReportsSection,
    SettingsSection,
    Sidebar,
    TeamSection,
} from "../../features/dashboard";
import { DashboardLayout } from "../../layouts/dashboard/DashboardLayout";

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

const sectionMap: Record<SectionId, ReactNode> = {
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
        <DashboardLayout
            theme={theme}
            sidebar={
                <Sidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    collapsed={sidebarCollapsed}
                    onCollapsedChange={setSidebarCollapsed}
                />
            }
            header={<Header activeSection={activeSection} theme={theme} onThemeToggle={toggleTheme} />}
            sidebarCollapsed={sidebarCollapsed}
        >
            <div
                key={activeSection}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                {sectionMap[activeSection]}
            </div>
        </DashboardLayout>
    );
}
