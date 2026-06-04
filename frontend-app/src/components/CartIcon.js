import React from 'react';
import { useCart } from '../hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartIcon = () => {
    const { cartItems, isSyncing } = useCart();
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                </span>
            )}
            {isSyncing && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
        </Link>
    );
};

export default CartIcon;