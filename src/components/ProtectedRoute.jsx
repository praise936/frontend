// components/ProtectedRoute.jsx — Guards routes based on auth and role

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth()

    // Show spinner while checking auth
    if (loading) return <LoadingSpinner />

    // Not logged in — redirect to login
    if (!user) return <Navigate to="/login" replace />

    // Logged in but wrong role
    if (requiredRole && user.role !== requiredRole) {
        // Redirect based on role
        if (user.role === 'platform_admin') return <Navigate to="/admin" replace />
        if (user.role === 'restaurant_manager') return <Navigate to="/dashboard" replace />
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute