import { useCreateRestaurant } from './form-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Lock, Edit3, Store, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  const { formData, logoPreview, handleSubmit } = useCreateRestaurant();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl md:max-w-5xl lg:max-w-5xl w-[90vw] p-0 overflow-hidden gap-0 border-border bg-card shadow-2xl">
        <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px] min-h-0">
          
          {/* Left Side: Summary Preview */}
          <div className="flex-1 bg-secondary/30 border-r border-border flex flex-col relative overflow-hidden min-h-0">
            <div className="p-8 flex flex-col h-full z-10 min-h-0">
              <div className="flex items-center gap-2 mb-8">
                <h3 className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Bản xem trước dữ liệu</h3>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="size-20 bg-background rounded-2xl border border-border shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="size-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-foreground tracking-tight line-clamp-2">
                    {formData.restaurantName || 'Chưa nhập tên nhà hàng'}
                  </h2>
                  <div className="flex items-center gap-2">
                    {formData.cuisine && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 shadow-none">{formData.cuisine}</Badge>}
                    {formData.city && <span className="text-sm text-muted-foreground font-medium">{formData.city}</span>}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-6">
                  {formData.description && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Giới thiệu ngắn</span>
                      <p className="text-sm font-medium leading-relaxed italic line-clamp-4">"{formData.description}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Email liên hệ</span>
                      <p className="text-sm font-medium">{formData.email || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Hotline</span>
                      <p className="text-sm font-medium">{formData.phone ? `+84 ${formData.phone}` : '—'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Địa chỉ chi tiết</span>
                      <p className="text-sm font-medium">{formData.address || '—'}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-32 opacity-[0.02] pointer-events-none">
              <Store className="size-96" />
            </div>
          </div>

          {/* Right Side: Privacy & Developer Context */}
          <div className="flex-1 flex flex-col bg-background min-h-0">
            <div className="p-8 pb-4">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
                  <ShieldCheck className="size-6 text-primary" />
                  Cam Kết Kỹ Thuật
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Hệ thống thiết kế ưu tiên nhà sáng tạo nội dung và nhà phát triển. Chúng tôi không thu thập thông tin ngầm định.
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 px-8 pb-8">
              <div className="space-y-8 mt-2">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Lock className="size-4 text-muted-foreground" />
                    Bảo vệ cấu trúc dữ liệu
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dữ liệu của bạn được lưu trữ theo tiêu chuẩn JSON mã hoá end-to-end. Bạn sở hữu toàn bộ metadata nhà hàng và có thể xuất (export) bất cứ lúc nào qua API của nền tảng.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Edit3 className="size-4 text-muted-foreground" />
                    Thông tin hiển thị minh bạch
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mọi trường thông tin bạn cung cấp bên trái cấu thành một bản sao số (Digital Twin) trên bản đồ ẩm thực của chúng tôi. Không tự động thêm thuật toán chèn nội dung quảng cáo vào trang định danh của bạn.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Sparkles className="size-4 text-muted-foreground" />
                    Quyền của Nhà sáng tạo (Creator First)
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sở hữu trí tuệ đối với hình ảnh và công thức thuộc về bạn. Chúng tôi chỉ đóng vai trò phân phối kỹ thuật nội dung đó với độ trễ siêu thấp qua CDN.
                  </p>
                </div>
              </div>
            </ScrollArea>

            {/* Sticky Action Footer */}
            <div className="p-6 border-t border-border bg-card/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-end gap-3 z-20">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto font-medium">
                Quay lại chỉnh sửa
              </Button>
              <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-bold px-6 shadow-xl">
                Tạo hồ sơ số <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
