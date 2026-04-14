import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VendorApplicationForm from '../components/VendorApplicationForm';
import { useVendorApi } from '../hooks/useVendorApi';

const VendorApplication = () => {
    const { user, isAuthenticated } = useAuth();
    const { submitVendorApplication, loading, error, resetError } = useVendorApi();
    const navigate = useNavigate();
    const [applicationSubmitted, setApplicationSubmitted] = React.useState(false);

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.role === 'vendor') {
            navigate('/vendor/dashboard');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (applicationData) => {
        try {
            const result = await submitVendorApplication(applicationData);
            if (result.success) {
                setApplicationSubmitted(true);
                resetError();
            } else {
                alert(`Failed to submit application: ${result.message}`);
            }
        } catch (error) {
            console.error('Error submitting vendor application:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    if (applicationSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                        <p className="text-gray-600 mb-6">
                            Your vendor application has been submitted successfully. Our admin team will review your application and get back to you soon.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 ml-4"
                            >
                                Browse Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Vendor</h1>
                    <p className="text-gray-600">
                        Join our marketplace and start selling your products to thousands of campus students. 
                        Fill out the application form below to get started.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <VendorApplicationForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default VendorApplication;
