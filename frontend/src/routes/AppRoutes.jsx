import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Shop from '../pages/Shop';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Dashboard from '../pages/Dashboard';

// Vendor Pages
import VendorDashboard from '../pages/vendor/Dashboard';
import CreateStore from '../pages/vendor/CreateStore';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      
      {/* Vendor routes */}
      <Route element={<RoleBasedRoute allowedRoles={['vendor']} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/create" element={<CreateStore />} />
      </Route>
      
      {/* Admin routes */}
      <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};