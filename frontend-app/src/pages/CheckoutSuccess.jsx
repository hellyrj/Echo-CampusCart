import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Phone, MapPin } from 'lucide-react';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Get order data from location state
        if (location.state) {
            setOrderData(location.state);
        } else {
            // If no state, redirect to home
            navigate('/');
        }
    }, [location.state, navigate]);

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    const { isMultiVendor, order, orders, orderGroup } = orderData;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isMultiVendor ? 'Orders Placed Successfully!' : 'Order Placed Successfully!'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isMultiVendor 
                            ? `Your orders have been sent to ${orders.length} vendors`
                            : 'Your order has been sent to the vendor'
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Details */}
                    <div className="space-y-6">
                        {isMultiVendor ? (
                            // Multi-vendor orders
                            <div className="space-y-4">
                                {orders.map((vendorOrder, index) => (
                                    <div key={vendorOrder._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order to {vendorOrder.vendor?.storeName}
                                            </h3>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {vendorOrder.status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            {vendorOrder.items.map((item, itemIndex) => (
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
                                        
                                        <div className="flex justify-between pt-3 border-t border-gray-200">
                                            <span className="font-medium">Total:</span>
                                            <span className="font-semibold">₦{vendorOrder.totalPrice}</span>
                                        </div>
                                        
                                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-600">
                                                <strong>Delivery:</strong> {vendorOrder.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Payment:</strong> {vendorOrder.paymentMethod === 'cash_on_delivery' ? 'Pay on delivery' : vendorOrder.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Single vendor order
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Order to {order.vendor?.storeName}
                                    </h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                        {order.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.quantity} × {item.name}
                                            </span>
                                            <span className="font-medium">
                                                ₦{item.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between pt-3 border-t border-gray-200">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-semibold">₦{order.totalPrice}</span>
                                </div>
                                
                                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600">
                                        <strong>Delivery:</strong> {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Payment:</strong> {order.paymentMethod === 'cash_on_delivery' ? 'Pay on delivery' : order.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                Delivery Information
                            </h3>
                            
                            <div className="space-y-3">
                                {isMultiVendor ? (
                                    // Show order group delivery info
                                    <>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Delivery Address</p>
                                                <p className="text-sm text-gray-600">
                                                    {orderGroup?.deliveryAddress?.street}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {orderGroup?.deliveryAddress?.city}, {orderGroup?.deliveryAddress?.state}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {orderGroup?.deliveryAddress?.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {orderGroup?.deliveryAddress?.phone && (
                                            <div className="flex items-start">
                                                <Phone className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone Number</p>
                                                    <p className="text-sm text-gray-600">
                                                        {orderGroup.deliveryAddress.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Show single order delivery info
                                    <>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Delivery Address</p>
                                                <p className="text-sm text-gray-600">
                                                    {order?.deliveryAddress?.street}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order?.deliveryAddress?.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {order?.deliveryAddress?.phone && (
                                            <div className="flex items-start">
                                                <Phone className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone Number</p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.deliveryAddress.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Package className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Order Processing</p>
                                        <p className="text-sm text-gray-600">
                                            {isMultiVendor 
                                                ? 'Each vendor will process your order separately'
                                                : 'The vendor will process your order'
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <Truck className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Delivery</p>
                                        <p className="text-sm text-gray-600">
                                            You'll receive your items at the specified address
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <Phone className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Payment</p>
                                        <p className="text-sm text-gray-600">
                                            Payment will be collected upon delivery
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                View My Orders
                            </button>
                            
                            <button
                                onClick={() => navigate('/products')}
                                className="w-full bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
