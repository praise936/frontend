// context/NotificationContext.jsx — Real-time notifications state

import React, { createContext, useContext, useState, useEffect } from 'react'
import { addMessageListener } from '../api/websocket'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])  // list of all notifications
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!user) return

        // Listen for WebSocket messages
        const removeListener = addMessageListener((data) => {
            handleIncomingMessage(data)
        })

        return removeListener  // cleanup on unmount
    }, [user])

    const handleIncomingMessage = (data) => {
        const notification = {
            id: Date.now(),
            ...data,
            read: false,
            timestamp: new Date().toISOString(),
        }

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show a toast popup based on message type
        if (data.type === 'NEW_ORDER') {
            toast.success(`🛎️ New order from ${data.order?.customer_name || 'a customer'}!`)
        } else if (data.type === 'ORDER_STATUS_UPDATE') {
            toast(`📦 Order #${data.order?.id} is now: ${data.order?.status_display}`, {
                icon: '🍽️',
            })
        } else if (data.type === 'NEW_MENU_ITEM') {
            toast(`🆕 ${data.restaurant_name} added: ${data.item?.name}`, {
                icon: '✨',
            })
        }
    }

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const clearNotifications = () => {
        setNotifications([])
        setUnreadCount(0)
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAllRead,
            clearNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (!context) throw new Error('useNotifications must be used inside NotificationProvider')
    return context
}