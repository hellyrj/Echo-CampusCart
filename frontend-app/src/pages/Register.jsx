import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthApi } from '../hooks/useAuthApi';
import { ShoppingCart, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { register, loading, error, resetError } = useAuthApi();
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
        
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
        });
        
        if (result.success) {
            navigate('/');
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, text: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        
        const levels = [
            { text: 'Very Weak', color: '#dc2626' },
            { text: 'Weak', color: '#f97316' },
            { text: 'Fair', color: '#eab308' },
            { text: 'Good', color: '#22c55e' },
            { text: 'Strong', color: '#16a34a' }
        ];
        
        return { strength, ...levels[strength] };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#FEFAE0' }}>
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #283618 0%, #606C38 100%)' }}>
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative z-10 flex flex-col justify-center items-center h-full p-8">
                    <div className="text-center">
                        <div className="p-3 rounded-full mb-4 inline-block" style={{ backgroundColor: '#DDA15E40' }}>
                            <ShoppingCart className="w-12 h-12" style={{ color: '#DDA15E' }} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#FEFAE0' }}>
                            Join CampusCart
                        </h1>
                        <p className="text-lg mb-6" style={{ color: '#FEFAE0', opacity: 0.9 }}>
                            Create your account and start shopping
                        </p>
                    </div>
                    <div className="space-y-3 text-left max-w-sm">
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#DDA15E' }} />
                            <span>Free account creation</span>
                        </div>
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#DDA15E' }} />
                            <span>Access to exclusive deals</span>
                        </div>
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#DDA15E' }} />
                            <span>Track your orders</span>
                        </div>
                        <div className="flex items-center" style={{ color: '#FEFAE0', opacity: 0.8 }}>
                            <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#DDA15E' }} />
                            <span>Save favorite items</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form (Full Width) */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="p-3 rounded-full inline-block mb-4" style={{ backgroundColor: '#DDA15E40' }}>
                            <ShoppingCart className="w-12 h-12" style={{ color: '#DDA15E' }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: '#283618' }}>Join CampusCart</h1>
                        <p style={{ color: '#606C38' }}>Create your account to get started</p>
                    </div>

                    {/* Register Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#283618' }}>Sign Up</h2>
                            <p style={{ color: '#606C38' }}>Join thousands of students shopping on campus</p>
                        </div>
                        
                        {error && (
                            <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#e5e7eb', focusRingColor: '#606C38' }}
                                />
                            </div>
                            

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
                                        placeholder="Create a password"
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
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs" style={{ color: passwordStrength.color }}>Password strength: {passwordStrength.text}</span>
                                            <span className="text-xs" style={{ color: passwordStrength.color }}>{passwordStrength.strength}/4</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div 
                                                className="h-1 rounded-full transition-all duration-300" 
                                                style={{ 
                                                    width: `${(passwordStrength.strength / 4) * 100}%`,
                                                    backgroundColor: passwordStrength.color 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#283618' }}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                        style={{ borderColor: '#e5e7eb', focusRingColor: '#606C38' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>Passwords do not match</p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <p className="mt-1 text-xs flex items-center" style={{ color: '#22c55e' }}>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Passwords match
                                    </p>
                                )}
                            </div>
                            

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#606C38', color: '#FEFAE0' }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        {/* <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg> */}
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <p style={{ color: '#606C38' }}>
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="font-medium hover:underline transition-colors"
                                    style={{ color: '#283618' }}
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
