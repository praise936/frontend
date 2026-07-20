// App.jsx — Route definitions and layout wrapper

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import OfflineBanner from './components/OfflineBanner'

// Pages
import AdminRegisterPage from './pages/AdminRegisterPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard'
import RestaurantDashboard from './pages/dashboard/RestaurantDashboard'
import ManageMenu from './pages/dashboard/ManageMenu'
import ManageOrders from './pages/dashboard/ManageOrders'
import RegisterRestaurant from './pages/dashboard/RegisterRestaurant'
import AssignManager from './pages/dashboard/AssignManager'
import AdminRestaurantDetail from './pages/dashboard/AdminRestaurantDetail'
import RestaurantSettings from './pages/dashboard/RestaurantSettings'

// Route guards
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <OfflineBanner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-setup" element={<AdminRegisterPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />

          {/* Protected — any logged in user */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />

          {/* Platform Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="platform_admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/register-restaurant" element={
            <ProtectedRoute requiredRole="platform_admin">
              <RegisterRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/admin/assign-manager/:restaurantId" element={
            <ProtectedRoute requiredRole="platform_admin">
              <AssignManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/restaurant/:id" element={
            <ProtectedRoute requiredRole="platform_admin">
              <AdminRestaurantDetail />
            </ProtectedRoute>
          } />
          {/* Restaurant Manager routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="restaurant_manager">
              <RestaurantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/menu" element={
            <ProtectedRoute requiredRole="restaurant_manager">
              <ManageMenu />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/orders" element={
            <ProtectedRoute requiredRole="restaurant_manager">
              <ManageOrders />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute requiredRole="restaurant_manager">
              <RestaurantSettings />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}