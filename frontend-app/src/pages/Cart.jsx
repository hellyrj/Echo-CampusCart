import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Tag, X, ShoppingBag, AlertTriangle } from 'lucide-react';

const Cart = () => {
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const {
        items,
        itemCount,
        totalQuantity,
        subtotal,
        discountAmount,
        total,
        coupon,
        loading,
        error,
        updateItemQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
    } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [updatingItems, setUpdatingItems] = useState(new Set());

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen py-12" style={{ backgroundColor: theme.background }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: theme.text.muted }} />
                    <h1 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>Please Log In</h1>
                    <p className="mb-8" style={{ color: theme.text.secondary }}>You need to be logged in to view your cart.</p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
                        style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                    >
                        Log In
                    </Link>
                </div>
            </div>
        );
    }

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItems(prev => new Set(prev).add(itemId));
        try {
            await updateItemQuantity(itemId, newQuantity);
        } catch (err) {
            console.error('Failed to update quantity:', err);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item?')) return;
        try {
            await removeFromCart(itemId);
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        try {
            await clearCart();
        } catch (err) {
            console.error('Failed to clear cart:', err);
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            await applyCoupon(couponCode.trim());
            setCouponCode('');
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await removeCoupon();
        } catch (err) {
            console.error('Failed to remove coupon:', err);
        }
    };

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen py-12" style={{ backgroundColor: theme.background }}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 rounded w-1/4" style={{ backgroundColor: theme.border }}></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 rounded" style={{ backgroundColor: theme.border }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen py-12" style={{ backgroundColor: theme.background }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShoppingBag className="w-20 h-20 mx-auto mb-6" style={{ color: theme.text.muted }} />
                    <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text.primary }}>Your Cart is Empty</h1>
                    <p className="mb-8" style={{ color: theme.text.secondary }}>Looks like you haven't added anything to your cart yet.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors"
                        style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: theme.background }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center mr-4 hover:opacity-70 transition-opacity"
                        style={{ color: theme.text.secondary }}
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Continue Shopping
                    </button>
                    <h1 className="text-2xl font-bold flex items-center" style={{ color: theme.text.primary }}>
                        <ShoppingCart className="w-6 h-6 mr-2" />
                        Shopping Cart
                        <span className="ml-2 text-sm font-normal" style={{ color: theme.text.muted }}>
                            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                        </span>
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: theme.error + '10', color: theme.error, border: `1px solid ${theme.error}40` }}>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item._id}
                                className="rounded-lg shadow-sm border p-4 flex gap-4"
                                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
                                style={{ backgroundColor: theme.border }}>
                                    {item.image?.url ? (
                                        <img
                                            src={item.image.url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"
                                        style={{ background: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)' }}>
                                            <ShoppingBag className="w-8 h-8" style={{ color: theme.text.muted }} />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold truncate" style={{ color: theme.text.primary }}>
                                                {item.name}
                                            </h3>
                                            {(item.vendorName || item.vendorId?.storeName) && (
                                                <p className="text-sm mt-0.5" style={{ color: theme.text.muted }}>
                                                    Sold by {item.vendorName || item.vendorId?.storeName}
                                                </p>
                                            )}
                                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(item.attributes).map(([key, value]) => (
                                                        <span key={key} className="text-xs px-2 py-0.5 rounded"
                                                        style={{ backgroundColor: theme.border, color: theme.text.muted }}>
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className="transition-colors p-1 hover:opacity-70"
                                            style={{ color: theme.text.muted }}
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center rounded-lg"
                                        style={{ border: `1px solid ${theme.border}` }}>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItems.has(item._id)}
                                                className="p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-70"
                                                style={{ backgroundColor: 'transparent' }}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 font-medium min-w-[3rem] text-center" style={{ color: theme.text.primary }}>
                                                {updatingItems.has(item._id) ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                disabled={updatingItems.has(item._id)}
                                                className="p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-70"
                                                style={{ backgroundColor: 'transparent' }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="text-lg font-bold" style={{ color: theme.text.secondary }}>
                                                ETB {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <p className="text-sm" style={{ color: theme.text.muted }}>
                                                ETB {item.price.toFixed(2)} each
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Clear Cart Button */}
                        <button
                            onClick={handleClearCart}
                            className="flex items-center font-medium transition-colors hover:opacity-70"
                            style={{ color: theme.error }}
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg shadow-sm border p-6"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                            <h2 className="text-lg font-bold mb-4" style={{ color: theme.text.primary }}>Order Summary</h2>

                            {/* Coupon Section */}
                            {coupon?.code ? (
                                <div className="mb-4 p-3 rounded-lg flex items-center justify-between"
                                style={{ backgroundColor: theme.success + '10', border: `1px solid ${theme.success}40` }}>
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-2" style={{ color: theme.success }} />
                                        <span className="text-sm font-medium" style={{ color: theme.success }}>
                                            {coupon.code}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="hover:opacity-70 transition-opacity"
                                        style={{ color: theme.success }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleApplyCoupon} className="mb-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => {
                                                setCouponCode(e.target.value);
                                                setCouponError('');
                                            }}
                                            placeholder="Enter coupon code"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 text-sm"
                                            style={{ borderColor: theme.border, focusRingColor: theme.secondary }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors hover:opacity-90"
                                            style={{ backgroundColor: theme.text.primary, color: theme.text.inverse }}
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-xs mt-1" style={{ color: theme.error }}>{couponError}</p>
                                    )}
                                </form>
                            )}

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between" style={{ color: theme.text.secondary }}>
                                    <span>Subtotal ({totalQuantity} items)</span>
                                    <span>ETB {subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between" style={{ color: theme.success }}>
                                        <span>Discount</span>
                                        <span>-ETB {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3" style={{ borderColor: theme.border }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold" style={{ color: theme.text.primary }}>Total</span>
                                        <span className="text-2xl font-bold" style={{ color: theme.text.secondary }}>
                                            ETB {total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                disabled={items.length === 0}
                                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                                style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                            >
                                Proceed to Checkout
                            </button>

                            <p className="text-xs text-center mt-3" style={{ color: theme.text.muted }}>
                                Shipping & taxes calculated at checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
