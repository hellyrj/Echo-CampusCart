import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../context/AuthContext';
import { 
    MapPin, 
    Phone, 
    Truck, 
    Package, 
    CreditCard, 
    ArrowLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { analyzeCart, checkout, loading: orderLoading } = useOrder();
    const { isAuthenticated } = useAuth();

    const [cartAnalysis, setCartAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('address');
    const [deliveryInfo, setDeliveryInfo] = useState({
        type: 'delivery',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Nigeria',
            phone: '',
            instructions: ''
        }
    });
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (cart.items.length === 0) {
            navigate('/cart');
            return;
        }

        analyzeCartForCheckout();
    }, [cart.items, isAuthenticated]);

    const analyzeCartForCheckout = async () => {
        try {
            setAnalyzing(true);
            const analysis = await analyzeCart();
            setCartAnalysis(analysis);
            console.log('Cart analysis:', analysis);
        } catch (err) {
            setError('Failed to analyze cart');
            console.error('Cart analysis error:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddressChange = (field, value) => {
        setDeliveryInfo(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const validateDeliveryInfo = () => {
        if (deliveryInfo.type === 'delivery') {
            const { street, city, state, phone } = deliveryInfo.address;
            if (!street || !city || !state || !phone) {
                setError('Please complete all delivery address fields');
                return false;
            }
        }
        return true;
    };

    const handleCheckout = async () => {
        if (!validateDeliveryInfo()) {
            return;
        }

        try {
            setError(null);
            const result = await checkout({
                deliveryInfo,
                paymentMethod
            });

            console.log('Checkout result:', result);

            // Clear cart after successful checkout
            await clearCart();

            // Navigate to success page
            if (result.orders) {
                // Multi-vendor checkout
                navigate('/checkout/success', { 
                    state: { 
                        orderGroup: result.orderGroup,
                        orders: result.orders,
                        isMultiVendor: true 
                    } 
                });
            } else {
                // Single vendor checkout
                navigate('/checkout/success', { 
                    state: { 
                        order: result.order,
                        isMultiVendor: false 
                    } 
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed');
            console.error('Checkout error:', err);
        }
    };

    if (analyzing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your cart...</p>
                </div>
            </div>
        );
    }

    if (!cartAnalysis) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Checkout
                        {cartAnalysis.isMultiVendor && (
                            <span className="ml-3 text-lg font-normal text-orange-600">
                                (Multiple Vendors)
                            </span>
                        )}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                            
                            {cartAnalysis.vendors.map((vendor, index) => (
                                <div key={vendor.vendorId} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {vendor.vendorName}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {vendor.totalQuantity} items
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {vendor.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {item.quantity} × {item.name}
                                                </span>
                                                <span className="font-medium">
                                                    ₦{item.price * item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex justify-between pt-3 border-t border-gray-100">
                                        <span className="font-medium">Subtotal:</span>
                                        <span className="font-semibold">₦{vendor.subtotal}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery & Payment */}
                    <div className="space-y-6">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Truck className="w-5 h-5 mr-2" />
                                Delivery Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setDeliveryInfo(prev => ({ ...prev, type: 'delivery' }))}
                                            className={`p-3 border rounded-lg flex items-center justify-center transition-colors ${
                                                deliveryInfo.type === 'delivery'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            <Truck className="w-5 h-5 mr-2" />
                                            Delivery
                                        </button>
                                        <button
                                            onClick={() => setDeliveryInfo(prev => ({ ...prev, type: 'pickup' }))}
                                            className={`p-3 border rounded-lg flex items-center justify-center transition-colors ${
                                                deliveryInfo.type === 'pickup'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            <Package className="w-5 h-5 mr-2" />
                                            Pickup
                                        </button>
                                    </div>
                                </div>

                                {deliveryInfo.type === 'delivery' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                value={deliveryInfo.address.street}
                                                onChange={(e) => handleAddressChange('street', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="123 Main Street"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={deliveryInfo.address.city}
                                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Lagos"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State
                                                </label>
                                                <input
                                                    type="text"
                                                    value={deliveryInfo.address.state}
                                                    onChange={(e) => handleAddressChange('state', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Lagos State"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={deliveryInfo.address.phone}
                                                onChange={(e) => handleAddressChange('phone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+234 800 000 0000"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Instructions (Optional)
                                            </label>
                                            <textarea
                                                value={deliveryInfo.address.instructions}
                                                onChange={(e) => handleAddressChange('instructions', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Leave at gate, call when arriving..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Payment Method
                            </h2>
                            
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === 'cash_on_delivery'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">Cash on Delivery</div>
                                        <div className="text-sm text-gray-500">Pay when you receive your items</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Total */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Total</h2>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>₦{cartAnalysis.cartTotal}</span>
                                </div>
                                
                                {deliveryInfo.type === 'delivery' && (
                                    <div className="flex justify-between text-sm">
                                        <span>Delivery Fee:</span>
                                        <span>
                                            ₦{cartAnalysis.vendors.reduce((sum, vendor) => 
                                                sum + (vendor.subtotal >= 5000 ? 0 : 
                                                    vendor.subtotal >= 2000 ? 200 : 
                                                    vendor.subtotal >= 1000 ? 300 : 500), 0
                                            )}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                    <span>Total:</span>
                                    <span>₦{
                                        cartAnalysis.cartTotal + 
                                        (deliveryInfo.type === 'delivery' ? 
                                            cartAnalysis.vendors.reduce((sum, vendor) => 
                                                sum + (vendor.subtotal >= 5000 ? 0 : 
                                                    vendor.subtotal >= 2000 ? 200 : 
                                                    vendor.subtotal >= 1000 ? 300 : 500), 0
                                            ) : 0)
                                    }</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={orderLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {orderLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
