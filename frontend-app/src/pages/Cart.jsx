import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Tag, X, ShoppingBag, AlertTriangle } from 'lucide-react';

const Cart = () => {
    const { isAuthenticated } = useAuth();
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
            <div className="min-h-screen py-12" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4" style={{ color: '#283618' }}>Please Log In</h1>
                    <p className="mb-8" style={{ color: '#606C38' }}>You need to be logged in to view your cart.</p>
                    <Link
                        to="/login"
                        className="inline-block text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        style={{ backgroundColor: '#606C38' }}
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
            <div className="min-h-screen py-12" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-300 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen py-12" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4" style={{ color: '#283618' }}>Your Cart is Empty</h1>
                    <p className="mb-8" style={{ color: '#606C38' }}>Looks like you haven't added anything to your cart yet.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        style={{ backgroundColor: '#606C38' }}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: '#FEFAE0' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Continue Shopping
                    </button>
                    <h1 className="text-2xl font-bold flex items-center" style={{ color: '#283618' }}>
                        <ShoppingCart className="w-6 h-6 mr-2" />
                        Shopping Cart
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                        </span>
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
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
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4"
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {item.name}
                                            </h3>
                                            {(item.vendorName || item.vendorId?.storeName) && (
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Sold by {item.vendorName || item.vendorId?.storeName}
                                                </p>
                                            )}
                                            {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(item.attributes).map(([key, value]) => (
                                                        <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItems.has(item._id)}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                                {updatingItems.has(item._id) ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                disabled={updatingItems.has(item._id)}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="text-lg font-bold" style={{ color: '#606C38' }}>
                                                ETB {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">
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
                            className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                            {/* Coupon Section */}
                            {coupon?.code ? (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                                        <span className="text-sm text-green-800 font-medium">
                                            {coupon.code}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-green-600 hover:text-green-800"
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
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-sm"
                                            style={{ focusRingColor: '#606C38' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-xs text-red-600 mt-1">{couponError}</p>
                                    )}
                                </form>
                            )}

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({totalQuantity} items)</span>
                                    <span>ETB {subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-ETB {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold" style={{ color: '#606C38' }}>
                                            ETB {total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                disabled={items.length === 0}
                                className="w-full text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ backgroundColor: '#606C38' }}
                            >
                                Proceed to Checkout
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-3">
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
