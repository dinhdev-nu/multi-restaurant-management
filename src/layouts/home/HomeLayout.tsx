import type { PropsWithChildren } from "react"

import {
    LandingFooter,
    LandingGlobalStyles,
    LandingHeader,
    LandingNewsletter,
} from "@/features/home"

export function HomeLayout({ children }: PropsWithChildren) {
    return (
        <>
            <LandingGlobalStyles />
            <LandingHeader />
            <main className="min-h-[calc(100svh-var(--header-height))]">{children}</main>
            <LandingNewsletter />
            <LandingFooter />
        </>
    )
}