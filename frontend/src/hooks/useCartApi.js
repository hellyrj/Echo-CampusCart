import { useCallback } from 'react';
import { useApiCall } from './useApiCall';

// Mock cart API - replace with actual API calls
const cartApi = {
  getCart: () => Promise.resolve({
    data: {
      data: JSON.parse(localStorage.getItem('cart') || '[]')
    }
  }),
  addToCart: (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return Promise.resolve({ data: { data: cart } });
  },
  updateCart: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    return Promise.resolve({ data: { data: cart } });
  },
  clearCart: () => {
    localStorage.removeItem('cart');
    return Promise.resolve({ data: { data: [] } });
  }
};

export const useCartApi = () => {
  const { executeCall, loading, error, resetError } = useApiCall();

  const getCart = useCallback(async () => {
    const result = await executeCall(cartApi.getCart);
    return result;
  }, [executeCall]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const result = await executeCall(cartApi.addToCart, { ...product, quantity });
    return result;
  }, [executeCall]);

  const updateCart = useCallback(async (cart) => {
    const result = await executeCall(cartApi.updateCart, cart);
    return result;
  }, [executeCall]);

  const clearCart = useCallback(async () => {
    const result = await executeCall(cartApi.clearCart);
    return result;
  }, [executeCall]);

  return {
    getCart,
    addToCart,
    updateCart,
    clearCart,
    loading,
    error,
    resetError
  };
};

export default useCartApi;
