import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context';
import { useVendorApi } from '@hooks';
import { Button, Card } from '@components';
import { formatPrice, formatDate } from '@utils';

const VendorDashboard = () => {
  const { user } = useAuth();
  const { getMyVendor, loading, error } = useVendorApi();
  const [vendor, setVendor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    const result = await getMyVendor();
    if (result.success) {
      setVendor(result.data.data);
    } else if (result.error?.response?.status === 404) {
      // User doesn't have a vendor store yet
      navigate('/vendor/create');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading vendor data</p>
          <Button onClick={loadVendorData}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No vendor store found</p>
          <Button onClick={() => navigate('/vendor/create')}>
            Create Your Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your store and view performance</p>
        </div>

        {/* Store Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{vendor.storeName}</h2>
                  <p className="text-gray-600 mt-1">{vendor.description}</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {vendor.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {vendor.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span> ⭐ {vendor.rating || 'No ratings yet'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/vendor/edit')}
                  >
                    Edit Store
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/vendor/products')}
                  >
                    Manage Products
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={vendor.delivaryAvailable ? 'text-green-600' : 'text-red-600'}>
                    {vendor.delivaryAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup</span>
                  <span className={vendor.pickupAvailable ? 'text-green-600' : 'text-red-600'}>
                    {vendor.pickupAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatPrice(vendor.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Radius</span>
                  <span className="font-medium">{vendor.deliveryRadius}m</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Actions</h3>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate('/vendor/orders')}>
                  View Orders
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/vendor/analytics')}>
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/vendor/settings')}>
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Location Details</h4>
              <p className="text-sm text-gray-600">Coordinates: [{vendor.location?.coordinates?.[0]}, {vendor.location?.coordinates?.[1]}]</p>
              <p className="text-sm text-gray-600">Type: {vendor.location?.type}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Store Settings</h4>
              <p className="text-sm text-gray-600">Created: {formatDate(vendor.createdAt)}</p>
              <p className="text-sm text-gray-600">Last Updated: {formatDate(vendor.updatedAt)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
