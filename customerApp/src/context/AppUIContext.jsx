import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_VISIBILITY_KEY = '@khaoji/show-floating-cart';
const CART_KEY = '@khaoji/cart'; // new
const SAVED_PAYMENTS_KEY = '@khaoji/saved-payments';
const ORDERS_KEY = '@khaoji/orders';

const AppUIContext = createContext(null);

const INITIAL_PAYMENTS = [
  {
    id: 'upi-1',
    type: 'upi',
    title: 'UPI',
    upiId: 'ratnakar@upi',
    holderName: 'Ratnakar Singh',
    icon: 'phone-portrait-outline',
    isPrimary: true,
    isFixed: false,
  },
  {
    id: 'card-1',
    type: 'card',
    title: 'HDFC Bank',
    cardNumber: '4242',
    fullCardNumber: '4242424242424242',
    holderName: 'Ratnakar Singh',
    expiry: '08/29',
    icon: 'card-outline',
    isPrimary: false,
    isFixed: false,
  },
];

export function AppUIProvider({ children }) {
  const [showFloatingCart, setShowFloatingCartState] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [savedPayments, setSavedPaymentsState] = useState(INITIAL_PAYMENTS);
  const [orders, setOrdersState] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // ─── Load all persisted data ──────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function loadStoredData() {
      try {
        const [
          cartVisibilityValue,
          cartValue,
          savedPaymentsValue,
          ordersValue,
        ] = await Promise.all([
          AsyncStorage.getItem(CART_VISIBILITY_KEY),
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(SAVED_PAYMENTS_KEY),
          AsyncStorage.getItem(ORDERS_KEY),
        ]);

        if (!mounted) return;

        if (cartVisibilityValue !== null) {
          setShowFloatingCartState(cartVisibilityValue === 'true');
        }

        if (cartValue) {
          const parsedCart = JSON.parse(cartValue);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        }

        if (savedPaymentsValue) {
          const parsedPayments = JSON.parse(savedPaymentsValue);
          if (Array.isArray(parsedPayments)) {
            setSavedPaymentsState(parsedPayments);
          }
        }

        if (ordersValue) {
          const parsedOrders = JSON.parse(ordersValue);
          if (Array.isArray(parsedOrders)) {
            setOrdersState(parsedOrders);
          }
        }
      } catch (error) {
        console.warn('Unable to load FoodMitra app data:', error);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    loadStoredData();

    return () => {
      mounted = false;
    };
  }, []);

  // ─── Persist cart items whenever they change ──────────────
  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems)).catch(error =>
      console.warn('Unable to save cart:', error),
    );
  }, [cartItems]);

  // ─── Cart actions ──────────────────────────────────────────

  const setShowFloatingCart = useCallback(async value => {
    const nextValue = Boolean(value);
    setShowFloatingCartState(nextValue);
    try {
      await AsyncStorage.setItem(CART_VISIBILITY_KEY, String(nextValue));
    } catch (error) {
      console.warn('Unable to save floating cart preference:', error);
    }
  }, []);

  const addToCart = useCallback(item => {
    if (!item?.id) return;
    setCartItems(current => {
      const existing = current.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return current.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: Number(cartItem.quantity || 0) + 1 }
            : cartItem,
        );
      }
      return [...current, { ...item, quantity: Number(item.quantity || 1) }];
    });
  }, []);

  const decreaseCartItem = useCallback(itemId => {
    setCartItems(current =>
      current
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: Number(item.quantity || 0) - 1 }
            : item,
        )
        .filter(item => Number(item.quantity || 0) > 0),
    );
  }, []);

  const removeFromCart = useCallback(itemId => {
    setCartItems(current => current.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ─── Payments and orders (unchanged) ──────────────────────

  const setSavedPayments = useCallback(updater => {
    setSavedPaymentsState(current => {
      const nextPayments =
        typeof updater === 'function' ? updater(current) : updater;
      const safePayments = Array.isArray(nextPayments) ? nextPayments : current;
      AsyncStorage.setItem(
        SAVED_PAYMENTS_KEY,
        JSON.stringify(safePayments),
      ).catch(error => console.warn('Unable to save payment methods:', error));
      return safePayments;
    });
  }, []);

  const addSavedPayment = useCallback(
    payment => {
      if (!payment?.id) return;
      setSavedPayments(current => {
        const paymentExists = current.some(item => item.id === payment.id);
        if (paymentExists) {
          return current.map(item =>
            item.id === payment.id ? { ...item, ...payment } : item,
          );
        }
        const nextPayment = {
          ...payment,
          isPrimary: payment.isPrimary || current.length === 0,
        };
        if (nextPayment.isPrimary) {
          return [
            ...current.map(item => ({ ...item, isPrimary: false })),
            nextPayment,
          ];
        }
        return [...current, nextPayment];
      });
    },
    [setSavedPayments],
  );

  const updateSavedPayment = useCallback(
    (paymentId, updates) => {
      setSavedPayments(current =>
        current.map(payment =>
          payment.id === paymentId ? { ...payment, ...updates } : payment,
        ),
      );
    },
    [setSavedPayments],
  );

  const removeSavedPayment = useCallback(
    paymentId => {
      setSavedPayments(current => {
        const removedPayment = current.find(
          payment => payment.id === paymentId,
        );
        const remainingPayments = current.filter(
          payment => payment.id !== paymentId,
        );
        if (removedPayment?.isPrimary && remainingPayments.length > 0) {
          return remainingPayments.map((payment, index) => ({
            ...payment,
            isPrimary: index === 0,
          }));
        }
        return remainingPayments;
      });
    },
    [setSavedPayments],
  );

  const setPrimaryPayment = useCallback(
    paymentId => {
      setSavedPayments(current =>
        current.map(payment => ({
          ...payment,
          isPrimary: payment.id === paymentId,
        })),
      );
    },
    [setSavedPayments],
  );

  const setOrders = useCallback(updater => {
    setOrdersState(current => {
      const nextOrders =
        typeof updater === 'function' ? updater(current) : updater;
      const safeOrders = Array.isArray(nextOrders) ? nextOrders : current;
      AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(safeOrders)).catch(
        error => console.warn('Unable to save orders:', error),
      );
      return safeOrders;
    });
  }, []);

  const createOrder = useCallback(
    order => {
      if (!order?.id) return;
      setOrders(current => [
        { ...order, createdAt: order.createdAt || new Date().toISOString() },
        ...current,
      ]);
    },
    [setOrders],
  );

  const updateOrderStatus = useCallback(
    (orderId, status) => {
      setOrders(current =>
        current.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order,
        ),
      );
    },
    [setOrders],
  );

  const removeOrder = useCallback(
    orderId => {
      setOrders(current => current.filter(order => order.id !== orderId));
    },
    [setOrders],
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, [setOrders]);

  const cartCount = useMemo(
    () =>
      cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      isReady,

      showFloatingCart,
      setShowFloatingCart,

      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      decreaseCartItem,
      removeFromCart,
      clearCart,

      savedPayments,
      setSavedPayments,
      addSavedPayment,
      updateSavedPayment,
      removeSavedPayment,
      setPrimaryPayment,

      orders,
      setOrders,
      createOrder,
      updateOrderStatus,
      removeOrder,
      clearOrders,
    }),
    [
      isReady,
      showFloatingCart,
      setShowFloatingCart,
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      decreaseCartItem,
      removeFromCart,
      clearCart,
      savedPayments,
      setSavedPayments,
      addSavedPayment,
      updateSavedPayment,
      removeSavedPayment,
      setPrimaryPayment,
      orders,
      setOrders,
      createOrder,
      updateOrderStatus,
      removeOrder,
      clearOrders,
    ],
  );

  return (
    <AppUIContext.Provider value={value}>{children}</AppUIContext.Provider>
  );
}

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error('useAppUI must be used inside AppUIProvider.');
  }
  return context;
}
