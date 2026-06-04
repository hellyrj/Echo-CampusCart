import React, { useState } from 'react';
import VendorApplicationForm from './VendorApplicationForm';

const VendorProfile = ({ vendor, onUpdate, loading }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData) => {
        await onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
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
                <div>
                    <VendorApplicationForm 
                        onSubmit={handleSubmit}
                        loading={loading}
                        initialData={vendor}
                    />
                    <button
                        onClick={handleCancel}
                        className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
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
