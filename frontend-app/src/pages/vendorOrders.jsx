import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOrder } from '../hooks/useOrder';
import { 
    Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, 
    Store, Search, Filter, RefreshCw, Eye, AlertTriangle 
} from 'lucide-react';

const VendorOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const { theme, colors, isDark } = useTheme();
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
            'confirmed': { color: 'bg-[#606C3820] text-[#606C38]', icon: CheckCircle },
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
        <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Order Management</h1>
                        <p className="mt-1" style={{ color: theme.text.secondary }}>Manage and track customer orders</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="mt-4 sm:mt-0 flex items-center px-4 py-2 text-white rounded-lg"
                        style={{ backgroundColor: theme.primary }}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Orders', value: summary.total, color: theme.primary },
                        { label: 'Pending', value: summary.pending, color: theme.accent },
                        { label: 'Processing', value: summary.processing, color: theme.text.primary },
                        { label: 'Completed', value: summary.completed, color: theme.primary },
                    ].map((card, index) => (
                        <div key={index} className="rounded-lg p-4 text-white" style={{ backgroundColor: card.color }}>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-sm opacity-90">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search and Filter */}
                <div className="rounded-lg shadow-sm border p-4 mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: theme.text.muted }} />
                            <input
                                type="text"
                                placeholder="Search by order number, customer name, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2"
                                style={{ borderColor: theme.accent, focusRingColor: theme.primary, color: theme.text.primary }}
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
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                    style={filter === f.key ? { backgroundColor: theme.primary } : { backgroundColor: theme.card }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="rounded-lg shadow-sm border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: theme.primary }}></div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.text.muted }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text.primary }}>No orders found</h3>
                            <p className="text-gray-600" style={{ color: theme.text.secondary }}>
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
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Order #</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Customer</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Items</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Total</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Date</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.muted }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200" style={{ borderColor: theme.border }}>
                                    {filteredOrders.map((order) => {
                                        const vendorOrder = order.vendorOrders?.[0];
                                        const statusBadge = vendorOrder ? getStatusBadge(vendorOrder.status) : getStatusBadge('pending');
                                        const StatusIcon = statusBadge.icon;
                                        
                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                                                        {order.orderNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm" style={{ color: theme.text.primary }}>{order.customerInfo?.name || 'N/A'}</div>
                                                    <div className="text-xs" style={{ color: theme.text.muted }}>{order.customerInfo?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                                                        {vendorOrder?.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                                                        ETB {vendorOrder?.total?.toFixed(2) || '0.00'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {vendorOrder?.status?.replace('_', ' ') || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.text.muted }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/vendor/orders/${order._id}`}
                                                            className="hover:opacity-70"
                                                            style={{ color: theme.primary }}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {vendorOrder && getNextStatuses(vendorOrder.status).length > 0 && (
                                                            <button
                                                                onClick={() => openStatusModal(order)}
                                                                className="px-3 py-1 rounded hover:opacity-70 text-xs"
                                                                style={{ backgroundColor: theme.primary + '20', color: theme.primary }}
                                                            >
                                                                Update
                                                            </button>
                                                        )}
                                                        {vendorOrder?.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleRejectOrder(order._id)}
                                                                className="px-3 py-1 rounded hover:opacity-70 text-xs"
                                                                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
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
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: theme.card }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
                            Update Order Status
                        </h3>
                        
                        <p className="text-sm mb-1" style={{ color: theme.text.secondary }}>Order #{selectedOrder.orderNumber}</p>
                        <p className="text-sm mb-4" style={{ color: theme.text.secondary }}>
                            Customer: {selectedOrder.customerInfo?.name}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
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
                                                    ? ''
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            style={newStatus === status ? { borderColor: theme.primary, backgroundColor: theme.primary + '20' } : { borderColor: theme.border }}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${
                                                newStatus === status ? '' : 'text-gray-400'
                                            }`} style={newStatus === status ? { color: theme.primary } : {}} />
                                            <span className={`font-medium ${
                                                newStatus === status ? '' : 'text-gray-700'
                                            }`} style={newStatus === status ? { color: theme.primary } : {}}>
                                                {status.replace('_', ' ')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                                Note (Optional)
                            </label>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note about this status update..."
                                rows="2"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                                style={{ borderColor: theme.border, focusRingColor: theme.primary }}
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
                                className="px-4 py-2 rounded-lg hover:opacity-70"
                                style={{ color: theme.text.primary, borderColor: theme.border }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || updating}
                                className="px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                                style={{ backgroundColor: theme.primary, color: '#FEFAE0' }}
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