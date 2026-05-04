import React, { useState } from 'react';

const VendorProfile = ({ vendor, onUpdate, loading }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        storeName: vendor?.storeName || '',
        description: vendor?.description || '',
        address: vendor?.address || '',
        phone: vendor?.phone || '',
        universityNear: vendor?.universityNear || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            storeName: vendor?.storeName || '',
            description: vendor?.description || '',
            address: vendor?.address || '',
            phone: vendor?.phone || '',
            universityNear: vendor?.universityNear || ''
        });
        setIsEditing(false);
    };

    if (!vendor) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <p className="text-gray-600">Loading vendor profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Vendor Profile</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Store Name *
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            University Nearby *
                        </label>
                        <input
                            type="text"
                            name="universityNear"
                            value={formData.universityNear}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Store Name</p>
                            <p className="font-medium">{vendor.storeName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{vendor.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">{vendor.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">University Nearby</p>
                            <p className="font-medium">{vendor.universityNear}</p>
                        </div>
                    </div>
                    
                    {vendor.description && (
                        <div>
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="font-medium">{vendor.description}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-medium text-green-600">
                                    {vendor.isApproved ? 'Approved' : 'Pending'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Account Active</p>
                                <p className="font-medium text-green-600">
                                    {vendor.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Member Since</p>
                                <p className="font-medium">
                                    {new Date(vendor.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProfile;
