import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload || [] };
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.maDV === action.payload.maDV);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.maDV === action.payload.maDV
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
        };
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.maDV !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
        return {
          ...state,
          items: state.items.filter(item => item.maDV !== action.payload.maDV)
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.maDV === action.payload.maDV
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    default:
      return state;
  }
};

const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user } = useAuth();

    // storage key is per-user when logged in, otherwise a guest key
    const storageKey = user?.accountId || user?.maKH || user?.username ? `cart_${user.accountId || user.maKH || user.username}` : 'cart_guest';

    // Load cart from localStorage when storageKey changes
    useEffect(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        const saved = raw ? JSON.parse(raw) : null;
        if (saved && Array.isArray(saved)) {
          dispatch({ type: 'SET_CART', payload: saved });
        }

        // If user just logged in, try to merge guest cart into user cart
        if (storageKey !== 'cart_guest' && localStorage.getItem('cart_guest')) {
          const guestRaw = localStorage.getItem('cart_guest');
          const guest = guestRaw ? JSON.parse(guestRaw) : [];
          if (guest && guest.length > 0) {
            const merged = [...(saved || [])];
            guest.forEach(gItem => {
              const idx = merged.findIndex(m => m.maDV === gItem.maDV);
              if (idx >= 0) merged[idx].quantity = (merged[idx].quantity || 0) + (gItem.quantity || 0);
              else merged.push(gItem);
            });
            dispatch({ type: 'SET_CART', payload: merged });
            try { localStorage.removeItem('cart_guest'); } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    }, [storageKey]);

    // Persist cart whenever it changes
    useEffect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      } catch (e) {}
    }, [state.items, storageKey]);

  const addToCart = (service, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...service, quantity } });
  };

  const removeFromCart = (maDV) => {
    dispatch({ type: 'REMOVE_ITEM', payload: maDV });
  };

  const updateQuantity = (maDV, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { maDV, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.donGia * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};