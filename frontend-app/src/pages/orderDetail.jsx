import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { 
    ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, 
    MapPin, Phone, CreditCard, Store, AlertTriangle 
} from 'lucide-react';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getOrder, cancelOrder, loading } = useOrder();
    const [order, setOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        const result = await getOrder(orderId);
        if (result.success) {
            setOrder(result.data);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) return;
        setCancelling(true);
        const result = await cancelOrder(orderId, cancelReason);
        setCancelling(false);
        if (result.success) {
            setOrder(prev => ({ ...prev, ...result.data }));
            setShowCancelForm(false);
        }
    };

    const getStatusSteps = (status) => {
        const steps = [
            { key: 'pending', label: 'Order Placed', icon: Clock },
            { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { key: 'preparing', label: 'Preparing', icon: Package },
            { key: 'ready_for_pickup', label: 'Ready', icon: Package },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle },
            { key: 'picked_up', label: 'Picked Up', icon: CheckCircle },
        ];
        
        const statusIndex = steps.findIndex(s => s.key === status);
        return steps.map((step, index) => ({
            ...step,
            completed: index <= statusIndex,
            current: index === statusIndex
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Orders
                    </button>
                    
                    {order.overallStatus === 'pending' && (
                        <button
                            onClick={() => setShowCancelForm(true)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            Cancel Order
                        </button>
                    )}
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
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendor Orders */}
                        {order.vendorOrders?.map((vendorOrder) => {
                            const statusSteps = getStatusSteps(vendorOrder.status);
                            return (
                                <div key={vendorOrder.vendorId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center mb-4">
                                        <Store className="w-5 h-5 text-blue-600 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {vendorOrder.vendorName}
                                        </h2>
                                    </div>

                                    {/* Status Tracking */}
                                    <div className="relative mb-6">
                                        <div className="flex items-center justify-between">
                                            {statusSteps.map((step, index) => (
                                                <div key={step.key} className="flex flex-col items-center relative z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        step.completed ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
                                                    }`}>
                                                        <step.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs mt-1 text-center max-w-[60px]">
                                                        {step.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-3">
                                        {vendorOrder.items?.map((item) => (
                                            <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image?.url && (
                                                        <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">ETB {item.subtotal?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                                        <span className="text-gray-600">Vendor Total</span>
                                        <span className="font-semibold text-lg">ETB {vendorOrder.total?.toFixed(2)}</span>
                                    </div>

                                    {/* Status History */}
                                    {vendorOrder.statusHistory?.length > 0 && (
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Status History</h4>
                                            <div className="space-y-2">
                                                {vendorOrder.statusHistory.map((history, idx) => (
                                                    <div key={idx} className="flex items-start text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 mr-2"></div>
                                                        <div>
                                                            <span className={`font-medium ${
                                                                history.status === 'cancelled' || history.status === 'rejected'
                                                                    ? 'text-red-600' : 'text-gray-900'
                                                            }`}>
                                                                {history.status.replace('_', ' ')}
                                                            </span>
                                                            {history.note && (
                                                                <p className="text-gray-500">{history.note}</p>
                                                            )}
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(history.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Delivery Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                                Delivery Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium">Address:</span> {order.deliveryAddress?.fullAddress}
                                </p>
                                {order.deliveryAddress?.landmark && (
                                    <p className="text-gray-600">
                                        <span className="font-medium">Landmark:</span> {order.deliveryAddress.landmark}
                                    </p>
                                )}
                                <p className="text-gray-600">
                                    <span className="font-medium">City:</span> {order.deliveryAddress?.city}
                                </p>
                                {order.deliveryAddress?.deliveryInstructions && (
                                    <p className="text-gray-600">
                                        <span className="font-medium">Instructions:</span> {order.deliveryAddress.deliveryInstructions}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Phone className="w-4 h-4 mr-1 text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    <span className="font-medium">Name:</span> {order.customerInfo?.name}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Phone:</span> {order.customerInfo?.phone}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span> {order.customerInfo?.email}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <CreditCard className="w-4 h-4 mr-1 text-blue-600" />
                                Payment
                            </h3>
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

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>ETB {order.orderSummary?.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span>ETB {order.orderSummary?.totalDeliveryFee?.toFixed(2)}</span>
                                </div>
                                {order.orderSummary?.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-ETB {order.orderSummary.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span className="text-blue-600">ETB {order.orderSummary?.grandTotal?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Order Modal */}
                {showCancelForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation..."
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelForm(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={!cancelReason.trim() || cancelling}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;