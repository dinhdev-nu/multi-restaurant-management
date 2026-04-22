import React from 'react';
import Icon from '@/components/AppIcon';

export interface SummaryData {
  todayRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  unpaidOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  avgChange: number;
}

interface OrderSummaryCardsProps {
  summaryData: SummaryData;
}

type ChangeType = 'positive' | 'negative' | 'warning' | 'neutral';

interface CardConfig {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: string;
  color: string;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const CHANGE_TYPE_CLASS: Record<ChangeType, string> = {
  positive: 'text-success',
  negative: 'text-error',
  warning: 'text-orange-600',
  neutral: 'text-muted-foreground',
};

const OrderSummaryCards: React.FC<OrderSummaryCardsProps> = ({ summaryData }) => {
  const cards: CardConfig[] = [
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(summaryData.todayRevenue),
      change: `+${summaryData.revenueChange}%`,
      changeType: summaryData.revenueChange >= 0 ? 'positive' : 'negative',
      icon: 'TrendingUp',
      color: 'bg-success',
    },
    {
      title: 'Tổng đơn hàng',
      value: summaryData.totalOrders.toLocaleString('vi-VN'),
      change: `+${summaryData.ordersChange}`,
      changeType: 'positive',
      icon: 'Receipt',
      color: 'bg-primary',
    },
    {
      title: 'Chưa thanh toán',
      value: summaryData.unpaidOrders.toLocaleString('vi-VN') || '0',
      change: 'Cần xử lý',
      changeType: summaryData.unpaidOrders > 0 ? 'warning' : 'neutral',
      icon: 'AlertCircle',
      color: 'bg-orange-500',
    },
    {
      title: 'Đơn chờ xử lý',
      value: summaryData.pendingOrders.toLocaleString('vi-VN') || '0',
      change: 'Đang chờ',
      changeType: summaryData.pendingOrders > 0 ? 'warning' : 'neutral',
      icon: 'Clock',
      color: 'bg-blue-500',
    },
    {
      title: 'Giá trị trung bình',
      value: formatCurrency(summaryData.averageOrderValue),
      change: `${summaryData.avgChange >= 0 ? '+' : ''}${summaryData.avgChange}%`,
      changeType: summaryData.avgChange >= 0 ? 'positive' : 'negative',
      icon: 'Calculator',
      color: 'bg-accent',
    },
  ];

  return (
    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-3 hover-scale">
          <div className="mb-2 flex items-center justify-between">
            <div className={`flex size-10 items-center justify-center rounded-lg ${card.color}`}>
              <Icon name={card.icon} size={20} color="white" />
            </div>
            <div className={`text-sm font-medium ${CHANGE_TYPE_CLASS[card.changeType]}`}>
              {card.change}
            </div>
          </div>
          <div>
            <h3 className="mb-1 text-lg font-bold text-foreground">{card.value}</h3>
            <p className="text-sm text-muted-foreground">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummaryCards;
