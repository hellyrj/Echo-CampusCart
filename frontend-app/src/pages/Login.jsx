import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthApi } from '../hooks/useAuthApi';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    
    const { login, loading, error, resetError } = useAuthApi();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) resetError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await login(formData);
        
        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#FEFAE0' }}>
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #283618 0%, #606C38 100%)' }}>
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10 flex flex-col justify-center items-center h-full p-12">
                    <div className="text-center">
                        <div className="p-4 rounded-full mb-6 inline-block" style={{ backgroundColor: '#DDA15E40' }}>
                            <ShoppingCart className="w-16 h-16" style={{ color: '#DDA15E' }} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FEFAE0' }}>
                            Welcome Back
                        </h1>
                        <p className="text-xl mb-8" style={{ color: '#FEFAE0', opacity: 0.9 }}>
                            Sign in to access your campus marketplace
                        </p>
                    </div>
                    <div className="space-y-4 text-left max-w-md">
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#DDA15E' }}></div>
                            <span className="text-sm">Browse thousands of products</span>
                        </div>
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#DDA15E' }}></div>
                            <span className="text-sm">Connect with local vendors</span>
                        </div>
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#DDA15E' }}></div>
                            <span className="text-sm">Fast campus delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (Full Width) */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="p-3 rounded-full inline-block mb-4" style={{ backgroundColor: '#DDA15E40' }}>
                            <ShoppingCart className="w-12 h-12" style={{ color: '#DDA15E' }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: '#283618' }}>Welcome Back</h1>
                        <p style={{ color: '#606C38' }}>Sign in to your account</p>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#283618' }}>Sign In</h2>
                            <p style={{ color: '#606C38' }}>Enter your credentials to access your account</p>
                        </div>
                        
                        {error && (
                            <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#e5e7eb', focusRingColor: '#606C38' }}
                                />
                            </div>
                            

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                        style={{ borderColor: '#e5e7eb', focusRingColor: '#606C38' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p style={{ color: '#606C38' }}>
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    className="font-medium hover:underline transition-colors"
                                    style={{ color: '#283618' }}
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
