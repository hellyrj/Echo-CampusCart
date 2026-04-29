import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../context/AuthContext';
import { 
    Package, 
    Truck, 
    Phone, 
    MapPin, 
    CreditCard,
    Filter,
    Calendar,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

const Orders = () => {
    const { orders, orderGroups, loading, error } = useOrder();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            ready_for_pickup: 'bg-indigo-100 text-indigo-800',
            out_for_delivery: 'bg-orange-100 text-orange-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            confirmed: <CheckCircle className="w-4 h-4" />,
            preparing: <Package className="w-4 h-4" />,
            ready_for_pickup: <Package className="w-4 h-4" />,
            out_for_delivery: <Truck className="w-4 h-4" />,
            delivered: <CheckCircle className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />
        };
        return icons[status] || <Clock className="w-4 h-4" />;
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status === filterStatus;
    });

    const filteredOrderGroups = orderGroups.filter(group => {
        if (filterStatus === 'all') return true;
        return group.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-2">
                        Track and manage your orders
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'orders'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Individual Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'groups'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Order Groups
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No orders found
                                </h3>
                                <p className="text-gray-600">
                                    {filterStatus === 'all' 
                                        ? "You haven't placed any orders yet"
                                        : `No orders with status "${filterStatus}"`
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order to {order.vendor?.storeName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1">{order.status}</span>
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                <CreditCard className="w-3 h-3 mr-1" />
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-4">
                                        <div className="space-y-2">
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
                                    </div>

                                    {/* Order Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <Truck className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="font-medium">Delivery:</span>
                                                <span className="ml-1">
                                                    {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center text-sm">
                                                <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="font-medium">Payment:</span>
                                                <span className="ml-1">
                                                    {order.paymentMethod === 'cash_on_delivery' ? 'Pay on delivery' : order.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {order.deliveryAddress && (
                                                <div className="flex items-start text-sm">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-medium">Delivery Address:</span>
                                                        <div className="text-gray-600 mt-1">
                                                            <p>{order.deliveryAddress.street}</p>
                                                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                                                            <p>{order.deliveryAddress.zipCode}</p>
                                                            {order.deliveryAddress.phone && (
                                                                <p>Phone: {order.deliveryAddress.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="space-y-6">
                        {filteredOrderGroups.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No order groups found
                                </h3>
                                <p className="text-gray-600">
                                    {filterStatus === 'all' 
                                        ? "You haven't placed any multi-vendor orders yet"
                                        : `No order groups with status "${filterStatus}"`
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredOrderGroups.map((group) => (
                                <div key={group._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    {/* Group Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Multi-Vendor Order
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(group.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                                                {getStatusIcon(group.status)}
                                                <span className="ml-1">{group.status}</span>
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(group.paymentStatus)}`}>
                                                <CreditCard className="w-3 h-3 mr-1" />
                                                {group.paymentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Group Summary */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded-md">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">Total Amount:</span>
                                            <span className="font-semibold">₦{group.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">Number of Vendors:</span>
                                            <span className="font-semibold">{group.orders?.length || 0}</span>
                                        </div>
                                    </div>

                                    {/* Individual Orders in Group */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Individual Orders:</h4>
                                        {group.orders?.map((order) => (
                                            <div key={order._id} className="border border-gray-200 rounded-md p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">
                                                        {order.vendor?.storeName}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-sm text-gray-600">
                                                    {order.items?.length || 0} items • ₦{order.totalPrice}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Group Delivery Info */}
                                    {group.deliveryAddress && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium">Delivery Address:</span>
                                                    <div className="text-gray-600 mt-1">
                                                        <p>{group.deliveryAddress.street}</p>
                                                        <p>{group.deliveryAddress.city}, {group.deliveryAddress.state}</p>
                                                        <p>{group.deliveryAddress.zipCode}</p>
                                                        {group.deliveryAddress.phone && (
                                                            <p>Phone: {group.deliveryAddress.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
