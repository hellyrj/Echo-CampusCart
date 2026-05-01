import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                    <p className="text-gray-600 mb-8">Your order has been placed and is being processed.</p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/orders"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            View My Orders
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-6">Thank you for your order. Your order has been placed successfully.</p>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Order Number</span>
                                <span className="font-semibold text-gray-900">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Order ID</span>
                                <span className="text-sm text-gray-500 truncate max-w-[200px]">{orderId}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                        You can track your order status anytime from your orders page.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Vendors will update the status as they process your order.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to={`/orders/${orderId}`}
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Track Order
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link
                            to="/orders"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            All Orders
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Shop More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;