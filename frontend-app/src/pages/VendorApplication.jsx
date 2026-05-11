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
        console.log('VendorApplication handleSubmit called with data:', applicationData);
        try {
            console.log('Calling submitVendorApplication...');
            const result = await submitVendorApplication(applicationData);
            console.log('Submit result:', result);
            if (result.success) {
                console.log('Application submitted successfully');
                setApplicationSubmitted(true);
                resetError();
            } else {
                console.log('Application submission failed:', result.message);
                alert(`Failed to submit application: ${result.message}`);
            }
        } catch (error) {
            console.error('Error submitting vendor application:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    if (applicationSubmitted) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#FEFAE0' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: '#FEFAE0' }}>
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DDA15E40' }}>
                            <svg className="w-8 h-8" style={{ color: '#DDA15E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#283618' }}>Application Submitted!</h2>
                        <p className="mb-6" style={{ color: '#606C38' }}>
                            Your vendor application has been submitted successfully. Our admin team will review your application and get back to you soon.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                className="px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform border-2"
                                style={{ backgroundColor: '#FEFAE0', color: '#283618', borderColor: '#606C38' }}
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
        <div className="min-h-screen" style={{ backgroundColor: '#FEFAE0' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4" style={{ color: '#283618' }}>Become a Vendor</h1>
                    <p style={{ color: '#606C38' }}>
                        Join our marketplace and start selling your products to thousands of campus students. 
                        Fill out the application form below to get started.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <VendorApplicationForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    );
};

export default VendorApplication;
