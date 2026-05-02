import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../hooks/useOrder';
import { 
    ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, 
    MapPin, Phone, User, ShoppingBag, AlertTriangle 
} from 'lucide-react';

const VendorOrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { getOrder, updateOrderStatus, cancelVendorOrder, loading } = useOrder();
    
    const [order, setOrder] = useState(null);
    const [vendorOrder, setVendorOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'vendor') {
            navigate('/vendor/dashboard');
            return;
        }
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        const result = await getOrder(orderId);
        if (result.success) {
            setOrder(result.data);
            // Find the vendor's order within the main order
            const vendorOrd = result.data.vendorOrders?.find(
                vo => vo.vendorId === user?._id || vo.vendorId?._id === user?._id
            );
            setVendorOrder(vendorOrd || result.data.vendorOrders?.[0]);
        }
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
        if (!newStatus) return;
        setUpdating(true);
        try {
            const result = await updateOrderStatus(orderId, newStatus, statusNote);
            if (result.success) {
                fetchOrderDetails();
                setNewStatus('');
                setStatusNote('');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRejectOrder = async () => {
        if (!rejectReason.trim()) return;
        setUpdating(true);
        try {
            const result = await cancelVendorOrder(orderId, rejectReason);
            if (result.success) {
                fetchOrderDetails();
                setShowRejectForm(false);
                setRejectReason('');
            }
        } catch (error) {
            console.error('Failed to reject order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusSteps = (status) => {
        const steps = [
            { key: 'pending', label: 'Placed', icon: Clock },
            { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { key: 'preparing', label: 'Preparing', icon: Package },
            { key: 'ready_for_pickup', label: 'Ready', icon: Package },
            { key: 'out_for_delivery', label: 'Delivery', icon: Truck },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle },
            { key: 'picked_up', label: 'Picked Up', icon: CheckCircle },
        ];
        
        const statusIndex = steps.findIndex(s => s.key === status);
        if (statusIndex === -1) return steps;
        
        return steps.map((step, index) => ({
            ...step,
            completed: index <= statusIndex,
            current: index === statusIndex,
            rejected: status === 'rejected',
            cancelled: status === 'cancelled' && index >= statusIndex
        }));
    };

    if (loading || !order) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    const statusSteps = vendorOrder ? getStatusSteps(vendorOrder.status) : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/vendor/orders')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Orders
                    </button>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Order #{order.orderNumber}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
                            
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    {statusSteps.map((step, index) => (
                                        <div key={step.key} className="flex flex-col items-center relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                step.cancelled ? 'bg-red-100 text-red-600' :
                                                step.completed ? 'bg-blue-600 text-white' : 
                                                'bg-gray-200 text-gray-500'
                                            }`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs mt-2 text-center max-w-[80px] text-gray-600">
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Progress bar background */}
                                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-0">
                                    <div 
                                        className="h-full bg-blue-600 transition-all duration-500"
                                        style={{ 
                                            width: vendorOrder ? 
                                                `${(statusSteps.filter(s => s.completed).length / Math.max(statusSteps.length - 1, 1)) * 100}%` 
                                                : '0%' 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                            <div className="space-y-3">
                                {vendorOrder?.items?.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image?.url && (
                                                <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity} × ETB {item.price?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">ETB {item.subtotal?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>ETB {vendorOrder?.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span>ETB {vendorOrder?.deliveryFee?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span className="text-blue-600">ETB {vendorOrder?.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status History */}
                        {vendorOrder?.statusHistory?.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
                                <div className="space-y-3">
                                    {vendorOrder.statusHistory.map((history, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                                history.status === 'cancelled' || history.status === 'rejected'
                                                    ? 'bg-red-400' : 'bg-blue-400'
                                            }`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className={`font-medium text-sm ${
                                                        history.status === 'cancelled' || history.status === 'rejected'
                                                            ? 'text-red-600' : 'text-gray-900'
                                                    }`}>
                                                        {history.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(history.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                {history.note && (
                                                    <p className="text-sm text-gray-500 mt-1">{history.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Update Actions */}
                        {vendorOrder && getNextStatuses(vendorOrder.status).length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
                                
                                <div className="space-y-3 mb-4">
                                    {getNextStatuses(vendorOrder.status).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`w-full flex items-center p-3 rounded-lg border-2 transition-colors ${
                                                newStatus === status
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className={`font-medium ${
                                                newStatus === status ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                                {status.replace('_', ' ')}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        placeholder="Add a note (optional)..."
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={!newStatus || updating}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Status'}
                                </button>

                                {vendorOrder.status === 'pending' && (
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        className="w-full mt-3 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        Reject Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Customer Info */}
                    <div className="space-y-4">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <User className="w-4 h-4 mr-1 text-blue-600" />
                                Customer
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium">Name:</span> {order.customerInfo?.name}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Phone:</span> 
                                    <a href={`tel:${order.customerInfo?.phone}`} className="text-blue-600 ml-1">
                                        {order.customerInfo?.phone}
                                    </a>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span> {order.customerInfo?.email}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                                Delivery Address
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">{order.deliveryAddress?.fullAddress}</p>
                                {order.deliveryAddress?.landmark && (
                                    <p className="text-gray-500">Landmark: {order.deliveryAddress.landmark}</p>
                                )}
                                {order.deliveryAddress?.deliveryInstructions && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-yellow-800 text-xs">
                                            <span className="font-medium">Instructions:</span> {order.deliveryAddress.deliveryInstructions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium">Method:</span> {order.paymentMethod?.replace('_', ' ')}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.paymentStatus}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.customerNotes && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Customer Notes</h3>
                                <p className="text-sm text-gray-600">{order.customerNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Order Modal */}
            {showRejectForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Reject Order</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to reject this order? This action cannot be undone.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectForm(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectOrder}
                                disabled={!rejectReason.trim() || updating}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {updating ? 'Rejecting...' : 'Reject Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrderDetail;