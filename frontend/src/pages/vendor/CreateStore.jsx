import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorApi } from '@hooks';
import { Button, Card, Input } from '@components';

const CreateStore = () => {
  const navigate = useNavigate();
  const { createVendor, loading, error, resetError } = useVendorApi();
  
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    address: '',
    phone: '',
    logo: '',
    delivaryAvailable: true,
    pickupAvailable: true,
    deliveryRadius: 3000,
    deliveryFee: 0,
    location: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'longitude' || name === 'latitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: name === 'longitude' 
            ? [parseFloat(value) || 0, prev.location.coordinates[1]]
            : [prev.location.coordinates[0], parseFloat(value) || 0]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) resetError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.storeName || !formData.address || !formData.phone) {
      return;
    }
    
    // Validate coordinates
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      return;
    }
    
    const result = await createVendor(formData);
    
    if (result.success) {
      navigate('/vendor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Store</h1>
          <p className="text-gray-600 mt-2">Set up your vendor store to start selling products</p>
        </div>

        {/* Form */}
        <Card className="p-6">
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Store Name"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your store name"
                />
                
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your store and what you offer"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Logo URL (optional)"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main St, City, State"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates[0]}
                    onChange={handleChange}
                    required
                    placeholder="-74.0060"
                  />
                  
                  <Input
                    label="Latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates[1]}
                    onChange={handleChange}
                    required
                    placeholder="40.7128"
                  />
                </div>
                
                <p className="text-sm text-gray-600">
                  Enter the exact coordinates of your store location. You can get these from Google Maps.
                </p>
              </div>
            </div>

            {/* Delivery Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="delivaryAvailable"
                    checked={formData.delivaryAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Delivery Available
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pickupAvailable"
                    checked={formData.pickupAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Pickup Available
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Delivery Radius (meters)"
                    name="deliveryRadius"
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={handleChange}
                    placeholder="3000"
                  />
                  
                  <Input
                    label="Delivery Fee"
                    name="deliveryFee"
                    type="number"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Creating...' : 'Create Store'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateStore;