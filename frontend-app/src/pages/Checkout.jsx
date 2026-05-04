import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const { items, totalQuantity, subtotal, discountAmount, total, coupon, loadCart } = useCart();
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
        try {
            const result = await createOrder({
                name: user?.name,
                email: user?.email,
                ...formData
            });

            if (result.success) {
                navigate(`/checkout/success?orderId=${result.data._id}&orderNumber=${result.data.orderNumber}`);
            } else {
                setErrors({ submit: result.message });
            }
        } catch (err) {
            setErrors({ submit: 'Failed to place order. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: '#FEFAE0' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center">
                    <Link to="/cart" className="text-gray-600 hover:text-gray-900 mr-4" title="Back to Cart">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold" style={{ color: '#283618' }}>Checkout</h1>
                </div>

                {/* Cart Validation Warning */}
                {cartValidation && !cartValidation.valid && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-yellow-800">Cart Validation Issues</h3>
                            <p className="text-yellow-700 text-sm mt-1">{cartValidation.message}</p>
                            {cartValidation.issues?.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {cartValidation.issues.map((issue, idx) => (
                                        <li key={idx} className="text-sm text-yellow-700">• {issue.message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{errors.submit}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Delivery & Payment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" style={{ color: '#606C38' }} />
                                    Delivery Information
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+251 91 234 5678"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Address *
                                        </label>
                                        <textarea
                                            name="deliveryAddress"
                                            value={formData.deliveryAddress}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Dormitory Block A, Room 123, AAU Main Campus"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                        />
                                        {errors.deliveryAddress && <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleInputChange}
                                            placeholder="Near the main cafeteria"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City *
                                            </label>
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
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
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                            
                                            {/* Show text input when Other is selected */}
                                            {formData.city === 'Other' && (
                                                <div className="mt-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Enter City Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="otherCity"
                                                        value={formData.otherCity}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your city name"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                                    />
                                                    {errors.otherCity && <p className="text-red-500 text-sm mt-1">{errors.otherCity}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Instructions (Optional)
                                        </label>
                                        <textarea
                                            name="deliveryInstructions"
                                            value={formData.deliveryInstructions}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Call when you arrive, 2nd floor, leave at reception..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" style={{ color: '#606C38' }} />
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
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.value}
                                                checked={formData.paymentMethod === method.value}
                                                onChange={handleInputChange}
                                                className="mr-3"
                                            />
                                            <method.icon className="w-5 h-5 mr-3 text-gray-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{method.label}</p>
                                                <p className="text-sm text-gray-500">{method.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <ShoppingBag className="w-5 h-5 mr-2" style={{ color: '#606C38' }} />
                                    Additional Notes (Optional)
                                </h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Any special instructions for your order..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                />
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                                
                                {/* Vendor Groups */}
                                <div className="space-y-4 mb-4">
                                    {Object.values(vendorGroups).map((group) => (
                                        <div key={group.vendorId} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
                                                <Store className="w-4 h-4 mr-1 text-gray-500" />
                                                {group.vendorName}
                                            </div>
                                            {group.items.map((item) => (
                                                <div key={item._id} className="flex justify-between text-sm py-1">
                                                    <span className="text-gray-600 truncate flex-1">
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span className="text-gray-900 ml-2">
                                                        ETB {(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                                        <span>ETB {subtotal.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount {coupon?.code && `(${coupon.code})`}</span>
                                            <span>-ETB {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span>Calculated per vendor</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                                        <span>Total</span>
                                        <span className="font-bold" style={{ color: '#606C38' }}>ETB {total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || (cartValidation && !cartValidation.valid)}
                                    className="w-full mt-6 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ backgroundColor: '#606C38' }}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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