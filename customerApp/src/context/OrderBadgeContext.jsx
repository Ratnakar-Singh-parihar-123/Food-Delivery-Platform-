// context/OrderBadgeContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { getCustomerOrders } from '../api/customerApi';

const OrderBadgeContext = createContext(null);

export function OrderBadgeProvider({ children }) {
  const [badgeCount, setBadgeCount] = useState(0);

  const fetchActiveOrdersCount = useCallback(async () => {
    try {
      const res = await getCustomerOrders({ limit: 100 });
      const orders = res.data.orders || [];
      const activeOrders = orders.filter(
        o =>
          o.status !== 'delivered' &&
          o.status !== 'cancelled' &&
          o.status !== 'rejected',
      );
      setBadgeCount(activeOrders.length);
    } catch (error) {
      console.warn('Failed to fetch orders count:', error);
      // Don't throw; just keep existing count
    }
  }, []);

  return (
    <OrderBadgeContext.Provider
      value={{ badgeCount, setBadgeCount, fetchActiveOrdersCount }}
    >
      {children}
    </OrderBadgeContext.Provider>
  );
}

export function useOrderBadge() {
  const context = useContext(OrderBadgeContext);
  if (!context) {
    throw new Error('useOrderBadge must be used within OrderBadgeProvider');
  }
  return context;
}
