// components/NotificationBell.jsx — Bell icon with dropdown

import React, { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const NotificationBell = () => {
    const { notifications, unreadCount, markAllRead } = useNotifications()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleOpen = () => {
        setOpen(!open)
        if (!open && unreadCount > 0) markAllRead()
    }

    const getNotificationIcon = (type) => {
        if (type === 'NEW_ORDER') return '🛎️'
        if (type === 'ORDER_STATUS_UPDATE') return '📦'
        if (type === 'NEW_MENU_ITEM') return '✨'
        return '🔔'
    }

    const getNotificationText = (notif) => {
        if (notif.type === 'NEW_ORDER') return `New order #${notif.order?.id}`
        if (notif.type === 'ORDER_STATUS_UPDATE') return `Order #${notif.order?.id}: ${notif.order?.status_display}`
        if (notif.type === 'NEW_MENU_ITEM') return `New item: ${notif.item?.name}`
        return 'New notification'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button onClick={handleOpen}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={22} className="text-brand-black" />
                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-danger text-white 
                           text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-shiny-lg 
                        border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-brand-black">Notifications</h3>
                        <span className="text-xs text-brand-gray">{notifications.length} total</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-brand-gray text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notif) => (
                                <div key={notif.id}
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                              ${!notif.read ? 'bg-amber-50 border-l-2 border-l-brand-accent' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                                        <div>
                                            <p className="text-sm font-medium text-brand-black">{getNotificationText(notif)}</p>
                                            <p className="text-xs text-brand-gray mt-0.5">
                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell