import { memo, useCallback } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/features/pos/components/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'staff' | 'manager' | 'owner';

interface NavItem {
  label: string;
  section: string;
  icon: string;
  roles: UserRole[];
  description: string;
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: UserRole;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  className?: string;
}

// ─── Static config (khai báo ngoài component – không bao giờ re-create) ──────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Bán hàng',
    section: 'main-pos',
    icon: 'Monitor',
    roles: ['staff', 'manager', 'owner'],
    description: 'Giao diện bán hàng chính',
  },
  {
    label: 'Bàn ăn',
    section: 'table',
    icon: 'Table',
    roles: ['staff', 'manager', 'owner'],
    description: 'Quản lý bàn ăn',
  },
  {
    label: 'Thanh toán',
    section: 'payment',
    icon: 'CreditCard',
    roles: ['staff', 'manager', 'owner'],
    description: 'Xử lý thanh toán',
  },
  {
    label: 'Lịch sử',
    section: 'order',
    icon: 'History',
    roles: ['manager', 'owner'],
    description: 'Lịch sử đơn hàng',
  },
  {
    label: 'Thực đơn',
    section: 'menu',
    icon: 'Utensils',
    roles: ['manager', 'owner'],
    description: 'Quản lý thực đơn',
  },
  {
    label: 'Nhân viên',
    section: 'staff',
    icon: 'Users',
    roles: ['owner'],
    description: 'Quản lý nhân viên',
  },
];

// ─── NavButton ────────────────────────────────────────────────────────────────
// Dùng NavLink: active state do React Router quản lý hoàn toàn,
// Sidebar không cần biết gì về pathname.

interface NavButtonProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onSelect: (section: string) => void;
  /** Mobile only: đóng drawer sau khi chọn section */
  onAfterSelect?: () => void;
}

const NavButton = memo<NavButtonProps>(({ item, isCollapsed, isActive, onSelect, onAfterSelect }) => (
  <button
    type="button"
    onClick={() => {
      onSelect(item.section);
      onAfterSelect?.();
    }}
    className={
      [
        'flex items-center w-full rounded-md justify-center touch-target hover-scale transition-smooth',
        isCollapsed ? 'w-10 h-10 p-0' : 'px-4',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground',
      ].join(' ')
    }
  >
    <Icon
      name={item.icon}
      size={20}
      className={[
        isCollapsed ? '' : 'mr-3 flex-shrink-0',
        isActive ? 'text-primary-foreground' : 'text-muted-foreground',
      ].join(' ')}
    />
    {!isCollapsed && (
      <div className="flex-1 text-left py-2 min-w-0">
        <span
          className={[
            'text-sm font-medium block truncate',
            isActive ? 'text-primary-foreground' : 'text-foreground',
          ].join(' ')}
        >
          {item.label}
        </span>
        <span
          className={[
            'text-xs block truncate',
            isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
          ].join(' ')}
        >
          {item.description}
        </span>
      </div>
    )}
  </button>
));

NavButton.displayName = 'NavButton';

// ─── SidebarFooter (static, memo hóa tránh re-render thừa) ───────────────────

const SidebarFooter = memo(() => (
  <div className="action-cluster">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-2 h-2 bg-success rounded-full status-pulse" />
      <span className="text-sm text-muted-foreground">Hệ thống hoạt động</span>
    </div>
    <div className="text-xs text-muted-foreground">
      <p>Phiên bản: 2.1.0</p>
      <p>Cập nhật: 02/09/2025</p>
    </div>
  </div>
));

SidebarFooter.displayName = 'SidebarFooter';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// memo: chỉ re-render khi isCollapsed / userRole thay đổi.
// Việc navigate KHÔNG khiến Sidebar re-render vì:
//   - không có useLocation()
//   - không nhận activePath qua props
//   - NavLink tự cập nhật className của chính nó qua router context

const Sidebar = memo<SidebarProps>(({
  isCollapsed = false,
  onToggleCollapse,
  userRole = 'owner',
  activeSection = 'main-pos',
  onSectionChange,
  className = '',
}) => {
  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  // useCallback đảm bảo prop truyền vào NavButton không đổi reference
  const handleMobileSectionSelect = useCallback(() => {
    onToggleCollapse?.();
  }, [onToggleCollapse]);

  const handleSectionSelect = useCallback((section: string) => {
    onSectionChange?.(section);
  }, [onSectionChange]);

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed left-0 top-14 sm:top-16',
          'h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]',
          'bg-surface border-r border-border z-1000',
          'transition-all duration-300 ease-smooth hidden lg:flex flex-col',
          isCollapsed ? 'w-16' : 'w-60',
          className,
        ].join(' ')}
      >
        {/* Collapse toggle */}
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full hover-scale"
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavButton
              key={item.section}
              item={item}
              isCollapsed={isCollapsed}
              isActive={activeSection === item.section}
              onSelect={handleSectionSelect}
            />
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <SidebarFooter />
          </div>
        )}
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────────────────── */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-1050 transition-opacity duration-300',
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ].join(' ')}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onToggleCollapse}
        />

        {/* Drawer */}
        <aside
          className={[
            'absolute left-0 top-0 h-full w-[280px] max-w-[85vw]',
            'bg-surface border-r border-border shadow-2xl flex flex-col',
            'transform transition-transform duration-300 ease-smooth',
            isCollapsed ? '-translate-x-full' : 'translate-x-0',
          ].join(' ')}
        >
          {/* Mobile header */}
          <div className="p-4 border-b border-border flex items-center justify-between safe-area-top">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Store" size={20} color="white" />
              </div>
              <h2 className="font-semibold text-foreground truncate">POS Manager</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="touch-target flex-shrink-0"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredItems.map((item) => (
              <NavButton
                key={item.section}
                item={item}
                isCollapsed={false}
                isActive={activeSection === item.section}
                onSelect={handleSectionSelect}
                onAfterSelect={handleMobileSectionSelect}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border safe-area-bottom">
            <SidebarFooter />
          </div>
        </aside>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;