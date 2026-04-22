import type { ReactNode } from "react"

interface PublicOrderingLayoutProps {
    header: ReactNode
    menuPanel: ReactNode
    cartPanel: ReactNode
    mobileCartButton: ReactNode
    clearDialog: ReactNode
}

export function PublicOrderingLayout({
    header,
    menuPanel,
    cartPanel,
    mobileCartButton,
    clearDialog,
}: PublicOrderingLayoutProps) {
    return (
        <div className="pos min-h-screen bg-background">
            {header}

            <main className="pt-16 md:pt-16 transition-all duration-300 ease-smooth">
                <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
                    {menuPanel}
                    {cartPanel}
                </div>

                {mobileCartButton}
            </main>

            {clearDialog}
        </div>
    )
}
