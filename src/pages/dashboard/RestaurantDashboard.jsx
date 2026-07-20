import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { addMessageListener } from '../../api/websocket'
import toast from 'react-hot-toast'
import { ShoppingBag, Settings, Utensils, Star, TrendingUp, Bell, Banknote } from 'lucide-react'

const RestaurantDashboard = () => {
    const [restaurant, setRestaurant] = useState(null)
    const [stats, setStats] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [newOrderAlert, setNewOrderAlert] = useState(null)
    const [togglingOpen, setTogglingOpen] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            const restRes = await api.get('/restaurants/my-restaurant/')
            setRestaurant(restRes.data)
            const [ordersRes, statsRes] = await Promise.all([
                api.get(`/orders/restaurant/${restRes.data.id}/`),
                api.get(`/restaurants/${restRes.data.id}/stats/`),
            ])
            setOrders(ordersRes.data.results || [])
            setStats(statsRes.data)
        } catch (err) {
            console.error('Failed to load dashboard:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        const removeListener = addMessageListener((data) => {
            if (data.type === 'NEW_ORDER') {
                setNewOrderAlert(data.order)
                setOrders((prev) => [data.order, ...prev])
            }
            if (data.type === 'ORDER_COMPLETED' || data.type === 'FEE_UPDATED') {
                fetchData()
            }
        })
        return removeListener
    }, [fetchData])

    const handleToggleOpen = async () => {
        if (!restaurant) return
        setTogglingOpen(true)
        const newValue = !restaurant.is_open
        if (!newValue && !window.confirm('Close restaurant? Customers will not be able to place new orders while closed.')) {
            setTogglingOpen(false)
            return
        }
        try {
            const res = await api.put(`/restaurants/${restaurant.id}/`, { is_open: newValue })
            setRestaurant(res.data)
            toast.success(newValue ? 'Restaurant is now Open' : 'Restaurant is now Closed')
        } catch (err) {
            toast.error('Failed to update status')
        } finally {
            setTogglingOpen(false)
        }
    }

    const pendingOrders = orders.filter((o) => o.status === 'pending').length

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-white-soft">
                <Navbar />
                <div className="container-main py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar />
            <div className="container-main py-8">

                {newOrderAlert && (
                    <div className="mb-6 p-4 bg-brand-accent/10 border-2 border-brand-accent rounded-2xl flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-brand-accent" />
                            <div>
                                <p className="font-bold text-brand-black">New Order Received!</p>
                                <p className="text-sm text-brand-gray">Order #{newOrderAlert.id} from {newOrderAlert.customer_name}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/dashboard/orders" className="btn-accent text-sm py-1.5 px-4">View Orders</Link>
                            <button onClick={() => setNewOrderAlert(null)} className="text-sm text-brand-gray hover:text-brand-black">Dismiss</button>
                        </div>
                    </div>
                )}

                {restaurant && (
                    <div className="card overflow-hidden mb-8">
                        <div className="relative h-32 bg-brand-black">
                            {restaurant.cover_image_url && (
                                <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover opacity-50" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-between px-6">
                                <div className="flex items-center gap-4">
                                    {restaurant.logo_url && (
                                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white" />
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-black text-white">{restaurant.name}</h1>
                                        <p className="text-gray-300 text-xs mt-1">Platform fee: {stats?.platform_fee_percent ?? '0'}%</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleOpen}
                                    disabled={togglingOpen}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${restaurant.is_open ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                    {restaurant.is_open ? '● Open — Tap to Close' : '● Closed — Tap to Open'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-brand-black text-white' },
                        { label: 'Pending Orders', value: pendingOrders, icon: Bell, color: pendingOrders > 0 ? 'bg-brand-accent text-white' : 'bg-gray-100 text-brand-black' },
                        { label: "Today's Orders", value: stats?.today_orders ?? 0, icon: TrendingUp, color: 'bg-green-500 text-white' },
                        { label: 'Avg Rating', value: `⭐ ${restaurant?.average_rating || '—'}`, icon: Star, color: 'bg-purple-500 text-white' },
                    ].map((stat) => (
                        <div key={stat.label} className="card p-5">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-2xl font-black text-brand-black">{stat.value}</p>
                            <p className="text-sm text-brand-gray mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <h2 className="font-bold text-brand-black text-lg mb-3">Earnings — Today</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5">
                        <p className="text-xl font-black text-brand-black">KSh {Number(stats?.revenue_today ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (before fee)</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-red-600">KSh {Number(stats?.fee_today ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Fee Owed to Platform</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-green-600">KSh {Number(stats?.net_today ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (after fee)</p>
                    </div>
                </div>

                <h2 className="font-bold text-brand-black text-lg mb-3">Earnings — This Month</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5">
                        <p className="text-xl font-black text-brand-black">KSh {Number(stats?.revenue_month ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (before fee)</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-red-600">KSh {Number(stats?.fee_month ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Fee Owed to Platform</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-xl font-black text-green-600">KSh {Number(stats?.net_month ?? 0).toLocaleString()}</p>
                        <p className="text-sm text-brand-gray mt-1">Money Made (after fee)</p>
                    </div>
                </div>

                <button
                    onClick={() => toast('This page will be built later — M-Pesa STK push payments.', { icon: '💳' })}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 mb-6 transition-colors">
                    <Banknote size={22} /> Receive Payment
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/dashboard/menu" className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-brand-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Utensils size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-black">Manage Menu</h3>
                            <p className="text-sm text-brand-gray">Add, edit, or update your menu items</p>
                        </div>
                    </Link>

                    <Link to="/dashboard/orders" className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${pendingOrders > 0 ? 'bg-brand-accent' : 'bg-brand-black'}`}>
                            <ShoppingBag size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-black">Manage Orders</h3>
                            <p className="text-sm text-brand-gray">{pendingOrders > 0 ? `${pendingOrders} pending orders!` : 'View and update order status'}</p>
                        </div>
                    </Link>
                    <Link to="/dashboard/settings" className="card p-6 flex items-center gap-4 hover:shadow-shiny transition-all cursor-pointer group">
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