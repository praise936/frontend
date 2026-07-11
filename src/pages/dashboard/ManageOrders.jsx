// pages/dashboard/ManageOrders.jsx — Restaurant manager manages incoming orders

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { addMessageListener } from '../../api/websocket'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, ChevronDown, ChevronUp } from 'lucide-react'

// Status progression for restaurant manager
const STATUS_ACTIONS = {
    pending: { next: 'confirmed', label: 'Confirm Order', color: 'bg-blue-500' },
    confirmed: { next: 'preparing', label: 'Start Preparing', color: 'bg-yellow-500' },
    preparing: { next: 'ready', label: 'Mark Ready for Pickup', color: 'bg-green-500' },
    ready: { next: 'completed', label: 'Mark Completed', color: 'bg-gray-500' },
    completed: null,
    cancelled: null,
}

const ManageOrders = () => {
    const navigate = useNavigate()
    const [restaurant, setRestaurant] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        fetchData()

        // Real-time new orders
        const removeListener = addMessageListener((data) => {
            if (data.type === 'NEW_ORDER') {
                setOrders((prev) => [data.order, ...prev])
                toast.success(`🛎️ New order #${data.order.id}!`)
            }
        })

        return removeListener
    }, [])

    const fetchData = async () => {
        try {
            const restRes = await api.get('/restaurants/my-restaurant/')
            setRestaurant(restRes.data)
            const ordersRes = await api.get(`/orders/restaurant/${restRes.data.id}/`)
            setOrders(ordersRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await api.patch(`/orders/${orderId}/status/`, { status: newStatus })
            setOrders((prev) => prev.map((o) => o.id === orderId ? res.data : o))
            toast.success(`Order #${orderId} updated to: ${newStatus}`)
        } catch (err) {
            toast.error('Failed to update order')
        }
    }

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter((o) => o.status === filterStatus)

    const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar />
            <div className="container-main py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-2xl font-black text-brand-black">Manage Orders</h1>
                    {orders.filter(o => o.status === 'pending').length > 0 && (
                        <span className="badge-amber animate-pulse">
                            {orders.filter(o => o.status === 'pending').length} pending
                        </span>
                    )}
                </div>

                {/* Status filter tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {statusFilters.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all
                ${filterStatus === status ? 'bg-brand-black text-white' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
                            {status} {status !== 'all' && `(${orders.filter(o => o.status === status).length})`}
                        </button>
                    ))}
                </div>

                {/* Orders list */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="text-gray-200 mx-auto mb-3" />
                        <p className="font-bold text-brand-black">No orders</p>
                        <p className="text-brand-gray text-sm">Orders will appear here in real time</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => {
                            const action = STATUS_ACTIONS[order.status]
                            return (
                                <div key={order.id} className="card overflow-hidden">
                                    {/* Order header */}
                                    <button
                                        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-12 rounded-full ${order.status === 'pending' ? 'bg-brand-accent animate-pulse' : 'bg-gray-200'}`} />
                                            <div className="text-left">
                                                <p className="font-bold text-brand-black">Order #{order.id}</p>
                                                <p className="text-sm text-brand-gray">{order.customer_name} · {formatDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={getStatusColor(order.status)}>{order.status_display}</span>
                                            <span className="font-bold text-brand-black">{formatCurrency(order.total_amount)}</span>
                                            {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>

                                    {/* Expanded */}
                                    {expandedOrder === order.id && (
                                        <div className="border-t border-gray-100 p-5 space-y-4">
                                            {/* Items */}
                                            <div className="space-y-2">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {item.menu_item_image_url && (
                                                                <img src={item.menu_item_image_url} alt={item.menu_item_name}
                                                                    className="w-8 h-8 rounded-lg object-cover" />
                                                            )}
                                                            <span className="text-brand-black">{item.menu_item_name} × {item.quantity}</span>
                                                        </div>
                                                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.notes && (
                                                <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
                                                    <span className="font-semibold">Note:</span> {order.notes}
                                                </div>
                                            )}

                                            {/* Action button */}
                                            {action && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, action.next)}
                                                    className={`${action.color} text-white font-semibold px-6 py-2.5 rounded-xl
                                      hover:opacity-90 transition-opacity flex items-center gap-2`}>
                                                    {action.label}
                                                </button>
                                            )}

                                            {/* Cancel option */}
                                            {!['completed', 'cancelled'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageOrders