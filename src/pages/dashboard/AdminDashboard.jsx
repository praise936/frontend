// pages/dashboard/AdminDashboard.jsx — Platform admin overview

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Store, Users, ShoppingBag, PlusCircle, XCircle, CheckCircle, TrendingUp } from 'lucide-react'

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [restaurants, setRestaurants] = useState([])
    const [orders, setOrders] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            const [restRes, ordersRes, usersRes] = await Promise.all([
                api.get('/restaurants/'),
                api.get('/orders/all/'),
                api.get('/auth/users/'),
            ])
            setRestaurants(restRes.data)
            setOrders(ordersRes.data)
            setUsers(usersRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSuspendToggle = async (restaurantId, currentStatus) => {
        const action = currentStatus === 'active' ? 'suspend' : 'activate'
        try {
            await api.post(`/restaurants/${restaurantId}/suspend/`, { action })
            fetchAll()
        } catch (err) {
            console.error(err)
        }
    }

    // Stats
    const stats = [
        { label: 'Total Restaurants', value: restaurants.length, icon: Store, color: 'bg-brand-black text-white' },
        { label: 'Active Restaurants', value: restaurants.filter(r => r.status === 'active').length, icon: CheckCircle, color: 'bg-green-500 text-white' },
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-brand-accent text-white' },
        { label: 'Total Users', value: users.length, icon: Users, color: 'bg-purple-500 text-white' },
    ]

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar />

            <div className="container-main py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-brand-black">Platform Admin</h1>
                        <p className="text-brand-gray">Welcome back, {user?.first_name || user?.email}</p>
                    </div>
                    <Link to="/admin/register-restaurant" className="btn-primary flex items-center gap-2">
                        <PlusCircle size={18} />
                        Register Restaurant
                    </Link>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card p-5">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-2xl font-black text-brand-black">{stat.value}</p>
                            <p className="text-sm text-brand-gray mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Restaurants table */}
                <div className="card p-6 mb-6">
                    <h2 className="font-bold text-brand-black text-lg mb-4 flex items-center gap-2">
                        <Store size={18} />
                        All Restaurants
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Restaurant</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Manager</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Status</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Rating</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map((r) => (
                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                {r.logo_url ? (
                                                    <img src={r.logo_url} className="w-8 h-8 rounded-lg object-cover" alt={r.name} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs font-bold">{r.name[0]}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-brand-black">{r.name}</p>
                                                    <p className="text-xs text-brand-gray">{r.cuisine_type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-brand-gray">
                                            {r.manager_info?.email}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={r.status === 'active' ? 'badge-green' : 'badge-red'}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="font-semibold text-brand-black">⭐ {r.average_rating}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => handleSuspendToggle(r.id, r.status)}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                          ${r.status === 'active'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}>
                                                {r.status === 'active' ? <><XCircle size={12} />Suspend</> : <><CheckCircle size={12} />Activate</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent orders */}
                <div className="card p-6">
                    <h2 className="font-bold text-brand-black text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Recent Orders
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">#</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Customer</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Restaurant</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Status</th>
                                    <th className="text-left py-3 px-2 text-brand-gray font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 20).map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-2 font-bold text-brand-black">#{order.id}</td>
                                        <td className="py-3 px-2 text-brand-gray">{order.customer_email}</td>
                                        <td className="py-3 px-2 text-brand-black font-medium">{order.restaurant_name}</td>
                                        <td className="py-3 px-2">
                                            <span className="badge-gray">{order.status_display}</span>
                                        </td>
                                        <td className="py-3 px-2 font-bold text-brand-black">KSh {Number(order.total_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard