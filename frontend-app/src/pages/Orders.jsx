import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../hooks/useOrder';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';

const Orders = () => {
    const { user, isAuthenticated } = useAuth();
    const { getMyOrders, loading } = useOrder();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, filter]);

    const fetchOrders = async () => {
        const params = filter !== 'all' ? { status: filter } : {};
        const result = await getMyOrders(params);
        if (result.success) {
            setOrders(Array.isArray(result.data) ? result.data : result.data?.orders || []);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'partially_delivered': return <Truck className="w-5 h-5 text-orange-500" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'partially_delivered': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVendorStatusCount = (vendorOrders) => {
        if (!vendorOrders) return {};
        return vendorOrders.reduce((acc, vo) => {
            acc[vo.status] = (acc[vo.status] || 0) + 1;
            return acc;
        }, {});
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: 'all', label: 'All Orders' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'processing', label: 'Processing' },
                        { key: 'completed', label: 'Completed' },
                        { key: 'cancelled', label: 'Cancelled' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filter === f.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? "You haven't placed any orders yet." 
                                : `No ${filter} orders found.`}
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const vendorStatusCount = getVendorStatusCount(order.vendorOrders);
                            return (
                                <Link
                                    key={order._id}
                                    to={`/orders/${order._id}`}
                                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(order.overallStatus)}
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Order #{order.orderNumber}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.overallStatus)}`}>
                                            {order.overallStatus.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Vendor order statuses */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {order.vendorOrders?.map((vo) => (
                                            <span
                                                key={vo.vendorId}
                                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                            >
                                                {vo.vendorName}: {vo.status.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                        <div className="text-sm text-gray-600">
                                            {order.orderSummary?.totalItems || order.vendorOrders?.reduce((sum, vo) => sum + vo.items.length, 0)} items
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-lg text-gray-900">
                                                ETB {order.orderSummary?.grandTotal?.toFixed(2) || '0.00'}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;