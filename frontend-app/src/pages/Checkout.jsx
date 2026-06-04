import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { 
    ArrowLeft, 
    MapPin, 
    Phone, 
    CreditCard, 
    ShoppingBag, 
    Truck, 
    Store,
    AlertTriangle 
} from 'lucide-react';

const Checkout = () => {
    const { user, isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const { items, totalQuantity, subtotal, discountAmount, total, coupon, loadCart, clearCart } = useCart();
    const { createOrder, validateCart, loading } = useOrder();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        deliveryAddress: '',
        landmark: '',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        deliveryInstructions: '',
        paymentMethod: 'cash_on_delivery',
        notes: '',
        otherCity: ''
    });
    const [errors, setErrors] = useState({});
    const [cartValidation, setCartValidation] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            navigate('/cart');
            return;
        }

        validateCartBeforeCheckout();
    }, [isAuthenticated, items]);

    const validateCartBeforeCheckout = async () => {
        try {
            const result = await validateCart();
            if (result.success) {
                setCartValidation(result.data);
                if (!result.data.valid) {
                    setErrors(prev => ({
                        ...prev,
                        cart: result.data.message || 'Your cart has issues that need attention'
                    }));
                }
            }
        } catch (err) {
            console.error('Cart validation failed:', err);
        }
    };

    // Group items by vendor
    const vendorGroups = items.reduce((groups, item) => {
        const vendorId = item.vendorId?._id || item.vendorId;
        const vendorName = item.vendorId?.storeName || item.vendorName || 'Unknown Vendor';
        
        if (!groups[vendorId]) {
            groups[vendorId] = {
                vendorId,
                vendorName,
                items: [],
                subtotal: 0
            };
        }
        groups[vendorId].items.push(item);
        groups[vendorId].subtotal += item.price * item.quantity;
        return groups;
    }, {});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
        
        // City validation - if Other is selected, otherCity is required
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        } else if (formData.city === 'Other' && !formData.otherCity.trim()) {
            newErrors.otherCity = 'City name is required when Other is selected';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setErrors({});
        try {
            const result = await createOrder({
                name: user?.name,
                email: user?.email,
                ...formData
            });

            if (result.success) {
                // Show immediate success feedback
                setOrderSuccess(true);
                setOrderData(result.data);
                
                // Clear the cart locally after successful order
                await clearCart();
                
                // Navigate to success page after a brief delay to show the success message
                setTimeout(() => {
                    navigate(`/checkout/success?orderId=${result.data._id}&orderNumber=${result.data.orderNumber}`);
                }, 1500);
            } else {
                setErrors({ submit: result.message });
            }
        } catch (error) {
            console.error('Order submission error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.';
            setErrors({ submit: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    if (items.length === 0) return null;

    // Show loading overlay when order is successful but before navigation
    if (orderSuccess) {
        return (
            <div className="min-h-screen py-8" style={{ backgroundColor: theme.background }}>
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="rounded-lg shadow-sm border p-8" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: theme.success + '20' }}>
                            <svg className="w-12 h-12" style={{ color: theme.success }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text.primary }}>Order Confirmed!</h1>
                        <p className="mb-4" style={{ color: theme.text.secondary }}>
                            {orderData?.orderNumber ? `Order #${orderData.orderNumber} has been placed successfully!` : 'Your order has been placed successfully!'}
                        </p>
                        <p className="text-sm" style={{ color: theme.text.muted }}>Redirecting to order details...</p>
                        <div className="mt-6">
                            <div className="animate-spin rounded-full h-8 w-8 mx-auto" style={{ borderBottomColor: theme.success }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: theme.background }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center">
                    <Link to="/cart" className="mr-4 hover:opacity-70 transition-opacity" title="Back to Cart" style={{ color: theme.text.secondary }}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Checkout</h1>
                </div>

                {/* Cart Validation Warning */}
                {cartValidation && !cartValidation.valid && (
                    <div className="mb-6 rounded-lg p-4 flex items-start" style={{ backgroundColor: theme.warning + '10', border: `1px solid ${theme.warning}40` }}>
                        <AlertTriangle className="w-5 h-5 mr-3 mt-0.5" style={{ color: theme.warning }} />
                        <div>
                            <h3 className="font-semibold" style={{ color: theme.warning }}>Cart Validation Issues</h3>
                            <p className="text-sm mt-1" style={{ color: theme.warning }}>{cartValidation.message}</p>
                            {cartValidation.issues?.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {cartValidation.issues.map((issue, idx) => (
                                        <li key={idx} className="text-sm" style={{ color: theme.warning }}>• {issue.message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: theme.error + '10', border: `1px solid ${theme.error}40` }}>
                        <p style={{ color: theme.error }}>{errors.submit}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Delivery & Payment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Information */}
                            <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: theme.text.primary }}>
                                    <MapPin className="w-5 h-5 mr-2" style={{ color: theme.text.secondary }} />
                                    Delivery Information
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5" style={{ color: theme.text.muted }} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+251 91 234 5678"
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                                style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-sm mt-1" style={{ color: theme.error }}>{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                            Delivery Address *
                                        </label>
                                        <textarea
                                            name="deliveryAddress"
                                            value={formData.deliveryAddress}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Dormitory Block A, Room 123, AAU Main Campus"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                            style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                        />
                                        {errors.deliveryAddress && <p className="text-sm mt-1" style={{ color: theme.error }}>{errors.deliveryAddress}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleInputChange}
                                            placeholder="Near the main cafeteria"
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                            style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                                City *
                                            </label>
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                                style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                            >
                                                <option value="">Select City</option>
                                                <option value="Addis Ababa">Addis Ababa</option>
                                                <option value="Dire Dawa">Dire Dawa</option>
                                                <option value="Mekelle">Mekelle</option>
                                                <option value="Gondar">Gondar</option>
                                                <option value="Bahir Dar">Bahir Dar</option>
                                                <option value="Hawassa">Hawassa</option>
                                                <option value="Jimma">Jimma</option>
                                                <option value="Adama">Adama</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.city && <p className="text-sm mt-1" style={{ color: theme.error }}>{errors.city}</p>}
                                            
                                            {/* Show text input when Other is selected */}
                                            {formData.city === 'Other' && (
                                                <div className="mt-2">
                                                    <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                                        Enter City Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="otherCity"
                                                        value={formData.otherCity}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your city name"
                                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                                        style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                                    />
                                                    {errors.otherCity && <p className="text-sm mt-1" style={{ color: theme.error }}>{errors.otherCity}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                                style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                                            Delivery Instructions (Optional)
                                        </label>
                                        <textarea
                                            name="deliveryInstructions"
                                            value={formData.deliveryInstructions}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Call when you arrive, 2nd floor, leave at reception..."
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                            style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: theme.text.primary }}>
                                    <CreditCard className="w-5 h-5 mr-2" style={{ color: theme.text.secondary }} />
                                    Payment Method
                                </h2>
                                
                                <div className="space-y-3">
                                    {[
                                        { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: Truck, desc: 'Pay when you receive your order' },
                                        { value: 'mobile_money', label: 'Mobile Money', icon: CreditCard, desc: 'Pay using mobile money services' },
                                    ].map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                                formData.paymentMethod === method.value
                                                    ? ''
                                                    : ''
                                            }`}
                                            style={{
                                                borderColor: formData.paymentMethod === method.value ? theme.success : theme.border,
                                                backgroundColor: formData.paymentMethod === method.value ? theme.success + '10' : 'transparent'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.value}
                                                checked={formData.paymentMethod === method.value}
                                                onChange={handleInputChange}
                                                className="mr-3"
                                            />
                                            <method.icon className="w-5 h-5 mr-3" style={{ color: theme.text.secondary }} />
                                            <div>
                                                <p className="font-medium" style={{ color: theme.text.primary }}>{method.label}</p>
                                                <p className="text-sm" style={{ color: theme.text.muted }}>{method.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: theme.text.primary }}>
                                    <ShoppingBag className="w-5 h-5 mr-2" style={{ color: theme.text.secondary }} />
                                    Additional Notes (Optional)
                                </h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Any special instructions for your order..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{ borderColor: theme.border, focusRingColor: theme.secondary, backgroundColor: theme.background, color: theme.text.primary }}
                                />
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="rounded-lg shadow-sm border p-6 sticky top-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text.primary }}>Order Summary</h2>
                                
                                {/* Vendor Groups */}
                                <div className="space-y-4 mb-4">
                                    {Object.values(vendorGroups).map((group) => (
                                        <div key={group.vendorId} className="rounded-lg p-3" style={{ border: `1px solid ${theme.border}` }}>
                                            <div className="flex items-center text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                                                <Store className="w-4 h-4 mr-1" style={{ color: theme.text.muted }} />
                                                {group.vendorName}
                                            </div>
                                            {group.items.map((item) => (
                                                <div key={item._id} className="flex justify-between text-sm py-1">
                                                    <span className="truncate flex-1" style={{ color: theme.text.secondary }}>
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span className="ml-2" style={{ color: theme.text.primary }}>
                                                        ETB {(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.text.secondary }}>Subtotal ({totalQuantity} items)</span>
                                        <span style={{ color: theme.text.primary }}>ETB {subtotal.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm" style={{ color: theme.success }}>
                                            <span>Discount {coupon?.code && `(${coupon.code})`}</span>
                                            <span>-ETB {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.text.secondary }}>Delivery Fee</span>
                                        <span style={{ color: theme.text.primary }}>Calculated per vendor</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
                                        <span style={{ color: theme.text.primary }}>Total</span>
                                        <span className="font-bold" style={{ color: theme.text.secondary }}>ETB {total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Success Message */}
                                {orderSuccess && (
                                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: theme.success + '10', border: `1px solid ${theme.success}40` }}>
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" style={{ color: theme.success }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <h3 className="font-semibold" style={{ color: theme.success }}>Order Placed Successfully!</h3>
                                                <p className="text-sm" style={{ color: theme.success }}>
                                                    {orderData?.orderNumber ? `Order #${orderData.orderNumber}` : 'Your order has been confirmed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting || (cartValidation && !cartValidation.valid)}
                                    className="w-full mt-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                                    style={{ backgroundColor: theme.secondary, color: theme.text.inverse }}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Placing Order...
                                        </span>
                                    ) : (
                                        `Place Order - ETB ${total.toFixed(2)}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;