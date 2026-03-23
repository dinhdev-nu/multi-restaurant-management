import { useState, useCallback, memo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header, { type HeaderProps } from './components/Header';
import Sidebar, { type SidebarProps } from './components/Sidebar';
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

const Layout = memo<LayoutProps>(({
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
    <div className="pos min-h-screen bg-background">
      {/* Header: memo + useLocation nội bộ, chỉ re-render khi props thay đổi */}
      <Header
        storeName={storeName}
        restaurant={restaurant}
        notifications={notifications}
        isOperational={isOperational}
        onToggleOperational={onToggleOperational}
        onToggleSidebar={handleToggleSidebar}
        getRelativeTime={getRelativeTime}
      />

      {/* Sidebar: memo + NavLink nội bộ, không re-render khi route thay đổi */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        userRole={userRole}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Content area: chỉ phần này thay đổi khi navigate */}
      <main
        className={[
          'pos pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-smooth',
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

Layout.displayName = 'Layout';

export default Layout;