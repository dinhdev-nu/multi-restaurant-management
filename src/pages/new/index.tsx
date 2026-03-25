import React, { useState } from 'react';
import { ChevronLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateRestaurantProvider, useCreateRestaurant } from './components/form-provider';
import { RegistrationForm } from './components/registration-form';
import { PrivacyDialog } from './components/privacy-dialog';
import { REQUIRED_FIELDS } from './components/constants';

function LayoutHeader() {
  const { progress } = useCreateRestaurant();
  
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3 sm:gap-6">
        <a href="/" className="flex items-center">
          <span className="text-2xl font-black tracking-tighter leading-none">
            <span className="text-foreground">Gi</span>
            <span className="text-accent">Gi</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <ChevronLeft className="size-4" />
          <span>Đăng ký đối tác</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Mức độ hoàn thiện</span>
          <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-bold text-foreground">{progress}%</span>
      </div>
    </header>
  );
}

function LayoutFooter({ onOpenPreview }: { onOpenPreview: () => void }) {
  const { formData } = useCreateRestaurant();
  
  const filledCount = REQUIRED_FIELDS.filter((f) => {
    const v = formData[f];
    return typeof v === 'string' ? v.trim().length > 0 : (v as string[]).length > 0;
  }).length;
  
  // For showcase, we allow click even if not 100% complete, but in real app we'd check `progress === 100`
  const isComplete = filledCount > 0; 

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky bottom-0 z-40 bg-card">
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

function CreateRestaurantLayout() {
  const { handleSubmit } = useCreateRestaurant();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="profile-page h-screen w-full flex flex-col font-sans overflow-hidden fixed inset-0 bg-background">
      <LayoutHeader />

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

const CreateRestaurantPage: React.FC = () => {
  return (
    <CreateRestaurantProvider>
      <CreateRestaurantLayout />
    </CreateRestaurantProvider>
  );
};

export default CreateRestaurantPage;
