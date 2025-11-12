import { useState, useEffect } from 'react';

const CART_STORAGE_KEY = 'rn_aneka_jaya_cart';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        setCart([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const addToCart = (product, selectedVariant = null, quantity = 1) => {
    setCart((prevCart) => {
      // Use selected variant or main product for pricing
      const itemData = selectedVariant ? {
        id: `${product.id}_variant_${selectedVariant.id}`,
        productId: product.id,
        variantId: selectedVariant.id,
        name: `${product.name} - ${selectedVariant.name}`,
        price: selectedVariant.price,
        image: selectedVariant.image || product.image,
        quantity: quantity,
        stock: selectedVariant.stock,
        productName: product.name,
        variantName: selectedVariant.name,
      } : {
        id: `${product.id}`,
        productId: product.id,
        variantId: null,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        stock: product.stock,
        productName: product.name,
        variantName: null,
      };

      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === itemData.id);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, itemData];
      }
    });
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};

