import { LandingMain, LandingSection } from "@/features/home"
import { HomeLayout } from "@/layouts/home/HomeLayout"

export function HomePage() {
    return (
        <HomeLayout>
            <LandingMain />
            <LandingSection />
        </HomeLayout>
    )
}