import { useState, useCallback, memo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import PosHeader, { type HeaderProps } from './PosHeader';
import PosSidebar, { type SidebarProps } from './PosSidebar';
import './pos.css';

// ─── Types ────────────────────────────────────────────────────────────────────

// Lấy props Header cần (bỏ onToggleSidebar vì Layout tự xử lý)
type LayoutHeaderProps = Omit<HeaderProps, 'onToggleSidebar'>;

// Lấy props Sidebar cần (bỏ isCollapsed / onToggleCollapse vì Layout tự xử lý)
type LayoutSidebarProps = Omit<SidebarProps, 'isCollapsed' | 'onToggleCollapse'>;

interface LayoutProps extends LayoutHeaderProps, LayoutSidebarProps {
  /** Nếu không dùng React Router <Outlet />, truyền children thay thế */
  children?: ReactNode;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

const PosLayout = memo<LayoutProps>(({
  children,
  // Header props
  storeName,
  restaurant,
  notifications,
  isOperational,
  onToggleOperational,
  getRelativeTime,
  // Sidebar props
  userRole = 'owner',
  activeSection = 'main-pos',
  onSectionChange,
}) => {
  // State duy nhất trong Layout: trạng thái sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // useCallback để Header và Sidebar nhận reference ổn định, tránh re-render thừa
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="pos h-screen bg-background flex flex-col overflow-hidden">
      {/* Header: memo + useLocation nội bộ, chỉ re-render khi props thay đổi */}
      <PosHeader
        storeName={storeName}
        restaurant={restaurant}
        notifications={notifications}
        isOperational={isOperational}
        onToggleOperational={onToggleOperational}
        onToggleSidebar={handleToggleSidebar}
        getRelativeTime={getRelativeTime}
      />

      {/* Sidebar: memo + NavLink nội bộ, không re-render khi route thay đổi */}
      <PosSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        userRole={userRole}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Content area: chỉ phần này thay đổi khi navigate */}
      <main
        tabIndex={0}
        className={[
          'pos flex-1 min-h-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-smooth focus:outline-none',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60',
        ].join(' ')}
      >
        {/* React Router: các route lồng render vào đây */}
        <Outlet />
        {/* Standalone: children render vào đây */}
        {children}
      </main>
    </div>
  );
});

PosLayout.displayName = 'PosLayout';

export default PosLayout;