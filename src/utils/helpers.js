// utils/helpers.js — Shared utilities including cart management

import { useState, useEffect } from 'react'

// Simple cart stored in localStorage
export const useCart = () => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('foodcourt_cart')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    // Sync cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('foodcourt_cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = (item, restaurantId, restaurantName) => {
        setCart((prev) => {
            // Can't mix items from different restaurants
            if (prev.length > 0 && prev[0].restaurant_id !== restaurantId) {
                const confirmed = window.confirm(
                    'Your cart has items from another restaurant. Clear cart and add this item?'
                )
                if (!confirmed) return prev
                return [{ ...item, quantity: 1, restaurant_id: restaurantId, restaurant_name: restaurantName }]
            }

            const existing = prev.find((c) => c.id === item.id)
            if (existing) {
                return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
            }
            return [...prev, { ...item, quantity: 1, restaurant_id: restaurantId, restaurant_name: restaurantName }]
        })
    }

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((c) => c.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId)
            return
        }
        setCart((prev) => prev.map((c) => c.id === itemId ? { ...c, quantity } : c))
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }
}

// Format currency in KES
export const formatCurrency = (amount) => {
    return `KSh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
}

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Order status colors
export const getStatusColor = (status) => {
    const map = {
        pending: 'badge-amber',
        confirmed: 'badge-gray',
        preparing: 'badge-amber',
        ready: 'badge-green',
        completed: 'badge-green',
        cancelled: 'badge-red',
    }
    return map[status] || 'badge-gray'
}