// ─── Shared formatters ────────────────────────────────────────────────────────

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
