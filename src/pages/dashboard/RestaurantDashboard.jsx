import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { addMessageListener, subscribeToRestaurant, unsubscribeFromRestaurant, isWebSocketConnected } from '../../api/websocket'
import toast from 'react-hot-toast'
import { ShoppingBag, Settings, Utensils, Star, TrendingUp, Bell, Banknote, AlertCircle } from 'lucide-react'

const RestaurantDashboard = () => {
    const [restaurant, setRestaurant] = useState(null)
    const [stats, setStats] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [newOrderAlert, setNewOrderAlert] = useState(null)
    const [togglingOpen, setTogglingOpen] = useState(false)
    const [wsConnected, setWsConnected] = useState(false)
    const isMounted = useRef(true)
    const fetchDataRef = useRef(null)

    // Check WebSocket connection status periodically
    useEffect(() => {
        const checkConnection = () => {
            if (isMounted.current) {
                setWsConnected(isWebSocketConnected())
            }
        }
        
        const interval = setInterval(checkConnection, 5000)
        checkConnection()
        
        return () => clearInterval(interval)
    }, [])

    const fetchData = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (fetchDataRef.current) {
            return fetchDataRef.current
        }

        fetchDataRef.current = (async () => {
            try {
                // Fetch restaurant first
                const restRes = await api.get('/restaurants/my-restaurant/')
                
                if (!isMounted.current) return
                setRestaurant(restRes.data)

                // Fetch orders and stats in parallel
                const [ordersRes, statsRes] = await Promise.all([
                    api.get(`/orders/restaurant/${restRes.data.id}/?limit=50`),
                    api.get(`/restaurants/${restRes.data.id}/stats/`),
                ])

                if (!isMounted.current) return
                setOrders(ordersRes.data.results || [])
                setStats(statsRes.data)
                
                // Subscribe to restaurant updates after data is loaded
                if (restRes.data.id) {
                    subscribeToRestaurant(restRes.data.id)
                }

            } catch (err) {
                if (!isMounted.current) return
                
                // Handle authentication errors
                if (err.response?.status === 401) {
                    toast.error('Session expired. Please login again.')
                    // Redirect to login if needed
                    // navigate('/login')
                } else if (err.response?.status === 403) {
                    toast.error('You do not have permission to access this page.')
                } else if (err.response?.status === 404) {
                    toast.error('Restaurant not found. Please contact support.')
                } else {
                    console.error('Failed to load dashboard:', err)
                    toast.error('Failed to load dashboard data')
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false)
                    fetchDataRef.current = null
                }
            }
        })()

        return fetchDataRef.current
    }, [])

    // Initial data fetch
    useEffect(() => {
        isMounted.current = true
        fetchData()

        // Subscribe to WebSocket messages
        const handleWebSocketMessage = (data) => {
            if (!isMounted.current) return

            // Handle new orders
            if (data.type === 'NEW_ORDER') {
                // Check if order belongs to this restaurant
                if (data.order?.restaurant === restaurant?.id) {
                    setNewOrderAlert(data.order)
                    setOrders((prev) => [data.order, ...prev])
                    
                    // Play notification sound if needed
                    // playNotificationSound()
                    
                    // Show toast notification
                    toast.success(`New order #${data.order.id} from ${data.order.customer_name || 'customer'}!`, {
                        duration: 5000,
                        icon: '🛎️',
                    })
                }
            }
            
            // Handle order completion
            if (data.type === 'ORDER_COMPLETED') {
                fetchData()
                toast.success('Order completed!', { icon: '✅' })
            }
            
            // Handle fee updates
            if (data.type === 'FEE_UPDATED') {
                fetchData()
                toast.info('Platform fee updated', { icon: '💰' })
            }

            // Handle restaurant updates
            if (data.type === 'RESTAURANT_UPDATED' && data.restaurant?.id === restaurant?.id) {
                setRestaurant(data.restaurant)
            }
        }

        const removeListener = addMessageListener(handleWebSocketMessage)
        
        // Subscribe to restaurant if we have an ID
        if (restaurant?.id) {
            subscribeToRestaurant(restaurant.id)
        }

        // Cleanup
        return () => {
            isMounted.current = false
            
            // Remove listener
            if (typeof removeListener === 'function') {
                removeListener()
            }
            
            // Unsubscribe from restaurant updates
            if (restaurant?.id) {
                unsubscribeFromRestaurant(restaurant.id)
            }
            
            // Cancel any pending requests
            if (fetchDataRef.current) {
                fetchDataRef.current = null
            }
        }
    }, [fetchData, restaurant?.id]) // Add dependencies

    const handleToggleOpen = useCallback(async () => {
        if (!restaurant) return
        
        setTogglingOpen(true)
        const newValue = !restaurant.is_open
        
        // Confirm closing
        if (!newValue && !window.confirm('Close restaurant? Customers will not be able to place new orders while closed.')) {
            setTogglingOpen(false)
            return
        }
        
        try {
            const res = await api.put(`/restaurants/${restaurant.id}/`, { is_open: newValue })
            setRestaurant(res.data)
            toast.success(newValue ? '🟢 Restaurant is now Open' : '🔴 Restaurant is now Closed')
            
            // Refresh stats after toggling
            await fetchData()
            
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to update status'
            toast.error(errorMsg)
            console.error('Toggle error:', err)
        } finally {
            setTogglingOpen(false)
        }
    }, [restaurant, fetchData])

    const dismissNewOrderAlert = useCallback(() => {
        setNewOrderAlert(null)
    }, [])

    // Calculate pending orders safely
    const pendingOrders = Array.isArray(orders) 
        ? orders.filter((o) => o.status === 'pending').length 
        : 0

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-brand-white-soft">
                <Navbar />
                <div className="container-main py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                            ))}
                        </div>
                        <div className="h-48 bg-gray-200 rounded-xl" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // No restaurant found
    if (!restaurant) {
        return (
            <div className="min-h-screen bg-brand-white-soft">
                <Navbar />
                <div className="container-main py-8">
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={40} className="text-brand-gray" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">No Restaurant Found</h2>
                        <p className="text-brand-gray mb-6">
                            You haven't been assigned to a restaurant yet. 
                            Contact the platform administrator for assistance.
                        </p>
                        <Link to="/" className="btn-primary inline-block">
                            Go to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar />
            
            <div className="container-main py-8">
                {/* WebSocket Connection Status (optional) */}
                {!wsConnected && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Reconnecting to real-time updates...</span>
                    </div>
                )}

                {/* New Order Alert Banner */}
                {newOrderAlert && (
                    <div className="mb-6 p-4 bg-brand-accent/10 border-2 border-brand-accent rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center animate-bounce">
                                <Bell size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-brand-black">New Order Received!</p>
                                <p className="text-sm text-brand-gray">
                                    Order #{newOrderAlert.id} from {newOrderAlert.customer_name || 'customer'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Link 
                                to="/dashboard/orders" 
                                className="btn-accent text-sm py-1.5 px-4 flex-1 sm:flex-none text-center"
                                onClick={dismissNewOrderAlert}
                            >
                                View Orders
                            </Link>
                            <button 
                                onClick={dismissNewOrderAlert} 
                                className="text-sm text-brand-gray hover:text-brand-black px-3 py-1.5"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Restaurant Header */}
                {restaurant && (
                    <div className="card overflow-hidden mb-8">
                        <div className="relative h-32 bg-gradient-to-r from-brand-black to-gray-800">
                            {restaurant.cover_image_url && (
                                <img 
                                    src={restaurant.cover_image_url} 
                                    alt={restaurant.name} 
                                    className="w-full h-full object-cover opacity-40"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-4">
                                    {restaurant.logo_url && (
                                        <img 
                                            src={restaurant.logo_url} 
                                            alt={restaurant.name} 
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-black text-white">
                                            {restaurant.name}
                                        </h1>
                                        <p className="text-gray-300 text-xs mt-1">
                                            Platform fee: {stats?.platform_fee_percent ?? '0'}%
                                            {restaurant.status === 'suspended' && (
                                                <span className="ml-2 text-red-400 font-semibold">• Suspended</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleToggleOpen}
                                    disabled={togglingOpen || restaurant.status === 'suspended'}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all w-full sm:w-auto mt-3 sm:mt-0
                                        ${restaurant.is_open 
                                            ? 'bg-green-500 text-white hover:bg-green-600' 
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                        }
                                        ${(togglingOpen || restaurant.status === 'suspended') && 'opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    {togglingOpen 
                                        ? 'Updating...' 
                                        : restaurant.is_open 
                                            ? '🟢 Open — Tap to Close' 
                                            : '🔴 Closed — Tap to Open'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { 
                            label: 'Total Orders', 
                            value: orders.length, 
                            icon: ShoppingBag, 
                            color: 'bg-brand-black text-white' 
                        },
                        { 
                            label: 'Pending Orders', 
                            value: pendingOrders, 
                            icon: Bell, 
                            color: pendingOrders > 0 
                                ? 'bg-brand-accent text-white animate-pulse' 
                                : 'bg-gray-100 text-brand-black' 
                        },
                        { 
                            label: "Today's Orders", 
                            value: stats?.today_orders ?? 0, 
                            icon: TrendingUp, 
                            color: 'bg-green-500 text-white' 
                        },
                        { 
                            label: 'Avg Rating', 
                            value: `⭐ ${restaurant?.average_rating || '—'}`, 
                            icon: Star, 
                            color: 'bg-purple-500 text-white' 
                        },
                    ].map((stat) => (
                        <div key={stat.label} className="card p-4 sm:p-5">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-xl sm:text-2xl font-black text-brand-black">{stat.value}</p>
                            <p className="text-xs sm:text-sm text-brand-gray mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Today's Earnings */}
                <h2 className="font-bold text-brand-black text-lg mb-3">Earnings — Today</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5">
                        <p className="text-xl font-black text-brand-black">
                            KSh {Number(stats?.revenue_today ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (before fee)</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-red-600">
                            KSh {Number(stats?.fee_today ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Fee Owed to Platform</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-green-600">
                            KSh {Number(stats?.net_today ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (after fee)</p>
                    </div>
                </div>

                {/* This Month's Earnings */}
                <h2 className="font-bold text-brand-black text-lg mb-3">Earnings — This Month</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5">
                        <p className="text-xl font-black text-brand-black">
                            KSh {Number(stats?.revenue_month ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (before fee)</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-red-600">
                            KSh {Number(stats?.fee_month ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Fee Owed to Platform</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-green-600">
                            KSh {Number(stats?.net_month ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (after fee)</p>
                    </div>
                </div>

                {/* M-Pesa Button */}
                <button
                    onClick={() => toast('This page will be built later — M-Pesa STK push payments.', { 
                        icon: '💳',
                        duration: 4000
                    })}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 mb-6 transition-colors"
                >
                    <Banknote size={22} /> Receive Payment via M-Pesa
                </button>

                {/* Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link 
                        to="/dashboard/menu" 
                        className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-brand-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Utensils size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-black">Manage Menu</h3>
                            <p className="text-sm text-brand-gray">Add, edit, or update your menu items</p>
                        </div>
                    </Link>

                    <Link 
                        to="/dashboard/orders" 
                        className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                            pendingOrders > 0 ? 'bg-brand-accent' : 'bg-brand-black'
                        }`}>
                            <ShoppingBag size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-black">Manage Orders</h3>
                            <p className="text-sm text-brand-gray">
                                {pendingOrders > 0 
                                    ? `${pendingOrders} pending order${pendingOrders > 1 ? 's' : ''}!` 
                                    : 'View and update order status'
                                }
                            </p>
                        </div>
                    </Link>
                    
                    <Link 
                        to="/dashboard/settings" 
                        className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-brand-black">
                            <Settings size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-black">Restaurant Settings</h3>
                            <p className="text-sm text-brand-gray">Manage your restaurant information and cover images</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RestaurantDashboard