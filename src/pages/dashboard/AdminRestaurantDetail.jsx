import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { addMessageListener } from '../../api/websocket'
import toast from 'react-hot-toast'
import { ArrowLeft, ShoppingBag, Calendar, CalendarDays, Star, Trash2 } from 'lucide-react'

const AdminRestaurantDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('stats') // 'stats' | 'today' | 'month' | 'total' | 'reviews'

    const [listData, setListData] = useState([])
    const [listLoading, setListLoading] = useState(false)
    const [nextPage, setNextPage] = useState(null)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        const removeListener = addMessageListener((data) => {
            if (data.type === 'REVIEW_DELETED' && view === 'reviews') {
                setListData((prev) => prev.filter((r) => r.id !== data.review_id))
            }
            if (data.type === 'NEW_ORDER' && data.order.restaurant === Number(id)) {
                fetchStats()
            }
        })
        return removeListener
    }, [view, id])

    const fetchStats = async () => {
        try {
            const res = await api.get(`/restaurants/${id}/stats/`)
            setStats(res.data)
        } catch (err) {
            toast.error('Failed to load stats')
        } finally {
            setLoading(false)
        }
    }

    const openOrdersView = async (mode) => {
        setView(mode)
        setListLoading(true)
        setListData([])
        setNextPage(null)
        try {
            const rangeParam = mode === 'today' ? '&range=today' : mode === 'month' ? '&range=month' : ''
            const res = await api.get(`/orders/restaurant/${id}/?page=1${rangeParam}`)
            setListData(res.data.results || [])
            if (res.data.next) {
                const url = new URL(res.data.next)
                setNextPage(url.searchParams.get('page'))
            }
        } catch (err) {
            toast.error('Failed to load orders')
        } finally {
            setListLoading(false)
        }
    }

    const openReviewsView = async () => {
        setView('reviews')
        setListLoading(true)
        setListData([])
        setNextPage(null)
        try {
            const res = await api.get(`/reviews/${id}/?page=1`)
            setListData(res.data.results || [])
            if (res.data.next) {
                const url = new URL(res.data.next)
                setNextPage(url.searchParams.get('page'))
            }
        } catch (err) {
            toast.error('Failed to load reviews')
        } finally {
            setListLoading(false)
        }
    }

    const loadMore = async () => {
        if (!nextPage || loadingMore) return
        setLoadingMore(true)
        try {
            if (view === 'reviews') {
                const res = await api.get(`/reviews/${id}/?page=${nextPage}`)
                setListData((prev) => [...prev, ...res.data.results])
                setNextPage(res.data.next ? new URL(res.data.next).searchParams.get('page') : null)
            } else {
                const rangeParam = view === 'today' ? '&range=today' : view === 'month' ? '&range=month' : ''
                const res = await api.get(`/orders/restaurant/${id}/?page=${nextPage}${rangeParam}`)
                setListData((prev) => [...prev, ...res.data.results])
                setNextPage(res.data.next ? new URL(res.data.next).searchParams.get('page') : null)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleDeleteReview = async (review) => {
        if (!window.confirm('Delete this review permanently? Use this for reviews that violate business integrity.')) return
        try {
            await api.delete(`/reviews/delete/${review.id}/`)
            setListData((prev) => prev.filter((r) => r.id !== review.id))
            toast.success('Review deleted')
            fetchStats()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete review')
        }
    }

    const backToStats = () => {
        setView('stats')
        setListData([])
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-white-soft">
                <Navbar />
                <div className="container-main py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const statCards = [
        { key: 'today', label: "Today's Orders", value: stats?.today_orders ?? 0, icon: Calendar, color: 'bg-brand-accent text-white', onClick: () => openOrdersView('today') },
        { key: 'month', label: 'This Month', value: stats?.month_orders ?? 0, icon: CalendarDays, color: 'bg-blue-500 text-white', onClick: () => openOrdersView('month') },
        { key: 'total', label: 'Total Orders', value: stats?.total_orders ?? 0, icon: ShoppingBag, color: 'bg-brand-black text-white', onClick: () => openOrdersView('total') },
        { key: 'reviews', label: `Reviews (⭐ ${stats?.average_rating ?? '—'})`, value: stats?.total_reviews ?? 0, icon: Star, color: 'bg-purple-500 text-white', onClick: openReviewsView },
    ]

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar />
            <div className="container-main py-8">
                <button
                    onClick={() => view === 'stats' ? navigate('/admin') : backToStats()}
                    className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black mb-6 transition-colors">
                    <ArrowLeft size={16} /> {view === 'stats' ? 'Back to Admin' : 'Back to Stats'}
                </button>

                <h1 className="text-2xl font-black text-brand-black mb-6">{stats?.restaurant?.name}</h1>

                {view === 'stats' ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((card) => (
                            <button
                                key={card.key}
                                onClick={card.onClick}
                                className="card p-5 text-left hover:shadow-shiny transition-all hover:-translate-y-0.5">
                                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                                    <card.icon size={20} />
                                </div>
                                <p className="text-2xl font-black text-brand-black">{card.value}</p>
                                <p className="text-sm text-brand-gray mt-0.5">{card.label}</p>
                            </button>
                        ))}
                    </div>
                ) : listLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : view === 'reviews' ? (
                    <div className="space-y-3 max-w-2xl">
                        {listData.length === 0 ? (
                            <p className="text-center text-brand-gray py-12">No reviews yet</p>
                        ) : (
                            listData.map((review) => (
                                <div key={review.id} className="card p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-brand-black">{review.customer_name || review.customer_email}</p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className="text-sm">{star <= review.rating ? '⭐' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReview(review)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {review.comment && <p className="text-brand-gray text-sm mt-2">{review.comment}</p>}
                                    <p className="text-xs text-brand-gray mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                        {nextPage && (
                            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary w-full">
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-brand-gray font-semibold">#</th>
                                    <th className="text-left py-3 px-4 text-brand-gray font-semibold">Customer</th>
                                    <th className="text-left py-3 px-4 text-brand-gray font-semibold">Date</th>
                                    <th className="text-left py-3 px-4 text-brand-gray font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-brand-gray font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listData.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-12 text-brand-gray">No orders in this range</td></tr>
                                ) : (
                                    listData.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-bold text-brand-black">#{order.id}</td>
                                            <td className="py-3 px-4 text-brand-gray">{order.customer_name || order.customer_email}</td>
                                            <td className="py-3 px-4 text-brand-gray">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4"><span className="badge-gray">{order.status_display}</span></td>
                                            <td className="py-3 px-4 font-bold text-brand-black">KSh {Number(order.total_amount).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {nextPage && (
                            <div className="p-4 border-t border-gray-100">
                                <button onClick={loadMore} disabled={loadingMore} className="btn-secondary w-full">
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRestaurantDetail