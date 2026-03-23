import React from 'react';
import Layout from './index';
import MainPOSDashboard from './sections/main-pos';

type POSSection = 'main-pos' | 'table' | 'payment' | 'order' | 'menu' | 'staff';

// Demo data for testing
const demoRestaurant = {
  id: '1',
  name: 'GiGi Energy Restaurant',
  logo: '/assets/images/restaurant_logo.png',
  orderUrl: 'https://example.com/order/gigi-energy',
};

const demoNotifications = [
  {
    id: '1',
    type: 'info' as const,
    message: 'Đơn hàng #123 đã được xác nhận',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
];

const POS: React.FC = () => {
  const [isOperational, setIsOperational] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState<POSSection>('main-pos');

  const getRelativeTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'main-pos':
        return <MainPOSDashboard />;
      case 'table':
        return <div className="p-6 text-foreground">Section Bàn ăn đang phát triển.</div>;
      case 'payment':
        return <div className="p-6 text-foreground">Section Thanh toán đang phát triển.</div>;
      case 'order':
        return <div className="p-6 text-foreground">Section Lịch sử đang phát triển.</div>;
      case 'menu':
        return <div className="p-6 text-foreground">Section Thực đơn đang phát triển.</div>;
      case 'staff':
        return <div className="p-6 text-foreground">Section Nhân viên đang phát triển.</div>;
      default:
        return <MainPOSDashboard />;
    }
  };

  return (
    <Layout
      storeName="POS Manager"
      restaurant={demoRestaurant}
      notifications={demoNotifications}
      isOperational={isOperational}
      onToggleOperational={() => setIsOperational(!isOperational)}
      getRelativeTime={getRelativeTime}
      activeSection={activeSection}
      onSectionChange={(section) => setActiveSection(section as POSSection)}
    >
      {renderSectionContent()}
    </Layout>
  );
};

export default POS;
