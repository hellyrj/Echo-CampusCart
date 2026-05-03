import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../hooks/useOrder';
import { 
    Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, 
    Store, Search, Filter, RefreshCw, Eye, AlertTriangle 
} from 'lucide-react';

const VendorOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const { getVendorOrders, updateOrderStatus, cancelVendorOrder, loading } = useOrder();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'vendor') {
            navigate('/vendor/dashboard');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, user, filter]);

    const fetchOrders = async () => {
        const params = filter !== 'all' ? { status: filter } : {};
        const result = await getVendorOrders({ ...params, limit: 50, sort: '-createdAt' });
        if (result.success) {
            setOrders(Array.isArray(result.data) ? result.data : result.data?.orders || []);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            'preparing': { color: 'bg-purple-100 text-purple-800', icon: Package },
            'ready_for_pickup': { color: 'bg-green-100 text-green-800', icon: Package },
            'out_for_delivery': { color: 'bg-orange-100 text-orange-800', icon: Truck },
            'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'picked_up': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
        };
        return statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: Package };
    };

    const getNextStatuses = (currentStatus) => {
        const transitions = {
            'pending': ['confirmed', 'rejected'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
            'ready_for_pickup': ['picked_up', 'cancelled'],
            'out_for_delivery': ['delivered', 'cancelled'],
        };
        return transitions[currentStatus] || [];
    };

    const handleStatusUpdate = async () => {
        if (!newStatus || !selectedOrder) return;
        setUpdating(true);
        try {
            const result = await updateOrderStatus(selectedOrder._id, newStatus, statusNote);
            if (result.success) {
                fetchOrders();
                setShowStatusModal(false);
                setSelectedOrder(null);
                setNewStatus('');
                setStatusNote('');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRejectOrder = async (orderId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        setUpdating(true);
        try {
            const result = await updateOrderStatus(orderId, 'rejected', reason);
            if (result.success) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Failed to reject order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        
        // Find the vendor's order within the main order
        const vendorOrder = order.vendorOrders?.[0]; // Assuming one vendor per page
        if (vendorOrder) {
            setNewStatus('');
            setStatusNote('');
            setShowStatusModal(true);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            order.orderNumber?.toLowerCase().includes(search) ||
            order.customerInfo?.name?.toLowerCase().includes(search) ||
            order.customerInfo?.phone?.includes(search) ||
            order.deliveryAddress?.fullAddress?.toLowerCase().includes(search)
        );
    });

    // Calculate summary statistics
    const summary = {
        total: orders.length,
        pending: orders.filter(o => o.vendorOrders?.[0]?.status === 'pending').length,
        processing: orders.filter(o => ['confirmed', 'preparing'].includes(o.vendorOrders?.[0]?.status)).length,
        completed: orders.filter(o => ['delivered', 'picked_up'].includes(o.vendorOrders?.[0]?.status)).length,
    };

    if (!isAuthenticated || user?.role !== 'vendor') return null;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FEFAE0' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#283618' }}>Order Management</h1>
                        <p className="mt-1" style={{ color: '#606C38' }}>Manage and track customer orders</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="mt-4 sm:mt-0 flex items-center px-4 py-2 text-white rounded-lg"
                        style={{ backgroundColor: '#606C38' }}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Orders', value: summary.total, color: '#606C38' },
                        { label: 'Pending', value: summary.pending, color: '#DDA15E' },
                        { label: 'Processing', value: summary.processing, color: '#283618' },
                        { label: 'Completed', value: summary.completed, color: '#606C38' },
                    ].map((card, index) => (
                        <div key={index} className="rounded-lg p-4 text-white" style={{ backgroundColor: card.color }}>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-sm opacity-90">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order number, customer name, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2"
                                style={{ borderColor: '#DDA15E', focusRingColor: '#606C38' }}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'confirmed', label: 'Confirmed' },
                                { key: 'preparing', label: 'Preparing' },
                                { key: 'ready_for_pickup', label: 'Ready' },
                                { key: 'out_for_delivery', label: 'Delivery' },
                                { key: 'delivered', label: 'Delivered' },
                                { key: 'cancelled', label: 'Cancelled' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filter === f.key
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    style={filter === f.key ? { backgroundColor: '#606C38' } : {}}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#606C38' }}></div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-600">
                                {filter === 'all' 
                                    ? "You haven't received any orders yet." 
                                    : `No ${filter} orders found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => {
                                        const vendorOrder = order.vendorOrders?.[0];
                                        const statusBadge = vendorOrder ? getStatusBadge(vendorOrder.status) : getStatusBadge('pending');
                                        const StatusIcon = statusBadge.icon;
                                        
                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {order.orderNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{order.customerInfo?.name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{order.customerInfo?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">
                                                        {vendorOrder?.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        ETB {vendorOrder?.total?.toFixed(2) || '0.00'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {vendorOrder?.status?.replace('_', ' ') || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/vendor/orders/${order._id}`}
                                                            className="hover:text-gray-700"
                                                            style={{ color: '#606C38' }}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {vendorOrder && getNextStatuses(vendorOrder.status).length > 0 && (
                                                            <button
                                                                onClick={() => openStatusModal(order)}
                                                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                                                            >
                                                                Update
                                                            </button>
                                                        )}
                                                        {vendorOrder?.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleRejectOrder(order._id)}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Update Order Status
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-1">Order #{selectedOrder.orderNumber}</p>
                        <p className="text-sm text-gray-600 mb-4">
                            Customer: {selectedOrder.customerInfo?.name}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Status
                            </label>
                            <div className="space-y-2">
                                {getNextStatuses(selectedOrder.vendorOrders?.[0]?.status).map((status) => {
                                    const badge = getStatusBadge(status);
                                    const Icon = badge.icon;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`w-full flex items-center p-3 rounded-lg border-2 transition-colors ${
                                                newStatus === status
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${
                                                newStatus === status ? 'text-blue-600' : 'text-gray-400'
                                            }`} />
                                            <span className={`font-medium ${
                                                newStatus === status ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                                {status.replace('_', ' ')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note about this status update..."
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedOrder(null);
                                    setNewStatus('');
                                    setStatusNote('');
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || updating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;