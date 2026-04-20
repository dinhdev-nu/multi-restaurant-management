import { useEffect, useState } from 'react';
import { ChevronLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateRestaurant } from '@/features/new/FormProvider';
import { RegistrationForm } from '@/features/new/RegistrationForm';
import { PrivacyDialog } from '@/features/new/PrivacyDialog';
import { REQUIRED_FIELDS, isFieldFilled } from '@/features/new/constants';
import { SettingsHeader } from '@/layouts/settings/SettingsHeader';

function LayoutFooter({ onOpenPreview }: { onOpenPreview: () => void }) {
    const { formData } = useCreateRestaurant();

    const filledCount = REQUIRED_FIELDS.filter((field) => isFieldFilled(formData, field)).length;

    // For showcase, we allow click even if not 100% complete, but in real app we'd check `progress === 100`
    const isComplete = filledCount > 0;

    return (
        <div className="border-t border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky bottom-0 z-40">
            <div className="flex items-center justify-between mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" type="button" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="size-4" />
                        <span>Hủy bỏ</span>
                    </Button>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                        {filledCount}/{REQUIRED_FIELDS.length} trường bắt buộc
                    </span>
                </div>
                <Button
                    type="button"
                    onClick={onOpenPreview}
                    disabled={!isComplete}
                    className="bg-foreground text-background hover:bg-foreground/90 font-bold px-8"
                >
                    <Eye className="size-4 mr-2" />
                    Xem thông tin
                </Button>
            </div>
        </div>
    );
}

export function NewRestaurantLayout() {
    const { handleSubmit } = useCreateRestaurant();
    const [isDark, setIsDark] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    useEffect(() => {
        const html = document.documentElement;

        if (isDark) html.classList.add('dark');
        else html.classList.remove('dark');

        return () => html.classList.remove('dark');
    }, [isDark]);

    return (
        <div className="profile-page h-screen w-full flex flex-col font-sans overflow-hidden fixed inset-0 bg-background">
            <SettingsHeader isDark={isDark} onToggle={() => setIsDark((value) => !value)} />

            <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="flex min-h-full">
                    <div className="hidden sm:block flex-1 border-r border-border" />
                    <div className="w-full max-w-3xl px-4 sm:px-8 py-6">
                        <form id="create-restaurant-form" onSubmit={handleSubmit}>
                            <RegistrationForm />
                        </form>
                    </div>
                    <div className="hidden sm:block flex-1 border-l border-border" />
                </div>
            </main>

            <LayoutFooter onOpenPreview={() => setIsPrivacyOpen(true)} />

            <PrivacyDialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen} />
        </div>
    );
}