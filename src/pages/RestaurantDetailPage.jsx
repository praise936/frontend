// pages/RestaurantDetailPage.jsx — Full restaurant detail with menu and reviews

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MenuItemCard from '../components/MenuItemCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../utils/helpers'
import { subscribeToRestaurant } from '../api/websocket'
import toast from 'react-hot-toast'
import {
    Star, MapPin, Clock, Phone, ChevronLeft,
    MessageSquare, Send
} from 'lucide-react'
import Footer from '../components/Footer'
import FloatingCart from '../components/FloatingCart'

const RestaurantDetailPage = () => {
    
     
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { addToCart, cartCount } = useCart()

    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('menu')
    const [activeCategory, setActiveCategory] = useState('all')

    // Review form state
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        fetchAll()
        // Subscribe to real-time menu updates for this restaurant
        subscribeToRestaurant(id)
    }, [id])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [restRes, menuRes, reviewRes, catRes] = await Promise.all([
                api.get(`/restaurants/${id}/`),
                api.get(`/menu/${id}/`),
                api.get(`/reviews/${id}/`),
                api.get(`/menu/${id}/categories/`),
            ])
            setRestaurant(restRes.data)
            setMenuItems(menuRes.data)
            setReviews(reviewRes.data)
            setCategories(catRes.data)
        } catch (err) {
            console.error(err)
            toast.error('Failed to load restaurant')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = (item) => {
        addToCart(item, restaurant.id, restaurant.name)
        toast.success(`${item.name} added to cart!`)
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!user) { navigate('/login'); return }
        setSubmittingReview(true)
        try {
            await api.post(`/reviews/${id}/`, reviewForm)
            toast.success('Review submitted!')
            setReviewForm({ rating: 5, comment: '' })
            const res = await api.get(`/reviews/${id}/`)
            setReviews(res.data)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review')
        } finally {
            setSubmittingReview(false)
        }
    }

    // Filter menu items by category
    const filteredMenu = activeCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === parseInt(activeCategory))

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-white-soft">
                <Navbar cartCount={cartCount} />
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-64 bg-gray-200 rounded-2xl" />
                            <div className="h-8 bg-gray-200 rounded w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!restaurant) return null

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar cartCount={cartCount} />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Back button */}
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-brand-gray hover:text-brand-black mb-4 transition-colors">
                        <ChevronLeft size={16} /> Back
                    </button>

                    {/* Hero banner */}
                    <div className="card overflow-hidden mb-6">
                        {/* Cover image */}
                        <div className="relative h-56 bg-gray-100">
                            {restaurant.cover_image_url ? (
                                <img src={restaurant.cover_image_url} alt={restaurant.name}
                                    className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <span className="text-6xl">🍽️</span>
                                </div>
                            )}
                            {/* Open/Closed overlay badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold
                ${restaurant.is_open ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'}`}>
                                {restaurant.is_open ? '● Open Now' : '● Closed'}
                            </div>
                        </div>

                        {/* Restaurant info */}
                        <div className="p-6 flex items-start gap-4">
                            {/* Logo */}
                            {restaurant.logo_url && (
                                <img src={restaurant.logo_url} alt={restaurant.name}
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0 -mt-12 relative z-10" />
                            )}

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-black text-brand-black">{restaurant.name}</h1>
                                        {restaurant.cuisine_type && (
                                            <p className="text-brand-gray text-sm mt-0.5">{restaurant.cuisine_type}</p>
                                        )}
                                    </div>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1.5 bg-brand-accent/10 px-3 py-1.5 rounded-xl">
                                        <Star size={16} className="text-brand-accent fill-brand-accent" />
                                        <span className="font-bold text-brand-black">{restaurant.average_rating || '—'}</span>
                                        <span className="text-xs text-brand-gray">({restaurant.total_reviews})</span>
                                    </div>
                                </div>

                                {restaurant.description && (
                                    <p className="text-brand-gray text-sm mt-2">{restaurant.description}</p>
                                )}

                                {/* Quick info row */}
                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-brand-gray">
                                    <span className="flex items-center gap-1"><MapPin size={13} />{restaurant.address}</span>
                                    <span className="flex items-center gap-1"><Clock size={13} />{restaurant.opening_hours}</span>
                                    <span className="flex items-center gap-1"><Phone size={13} />{restaurant.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-card mb-6 w-fit">
                        {['menu', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-xl font-semibold text-sm capitalize transition-all
                  ${activeTab === tab
                                        ? 'bg-brand-black text-white shadow-sm'
                                        : 'text-brand-gray hover:text-brand-black'
                                    }`}>
                                {tab} {tab === 'reviews' && `(${reviews.length})`}
                            </button>
                        ))}
                    </div>

                    {/* MENU TAB */}
                    {activeTab === 'menu' && (
                        <div>
                            {/* Category filter */}
                            <div className="flex gap-2 flex-wrap mb-5">
                                <button
                                    onClick={() => setActiveCategory('all')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                    ${activeCategory === 'all' ? 'bg-brand-black text-white' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(String(cat.id))}
                                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                      ${activeCategory === String(cat.id) ? 'bg-brand-black text-white' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Menu grid */}
                            {filteredMenu.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="text-5xl">🍴</span>
                                    <p className="text-brand-gray mt-3">No menu items yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredMenu.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                        <div className="max-w-2xl space-y-6">

                            {/* Write review form */}
                            {user && user.role === 'customer' && (
                                <div className="card p-6">
                                    <h3 className="font-bold text-brand-black mb-4">Leave a Review</h3>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        {/* Star rating */}
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-black mb-2">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        className="text-2xl transition-transform hover:scale-110">
                                                        {star <= reviewForm.rating ? '⭐' : '☆'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-black mb-1.5">Comment</label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                placeholder="Share your experience..."
                                                rows={3}
                                                className="input-field resize-none"
                                            />
                                        </div>
                                        <button type="submit" disabled={submittingReview} className="btn-primary flex items-center gap-2">
                                            <Send size={16} />
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Reviews list */}
                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare size={40} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-brand-gray">No reviews yet. Be the first!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="card p-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-brand-black">{review.customer_name || review.customer_email}</p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className="text-sm">
                                                            {star <= review.rating ? '⭐' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-brand-gray">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-brand-gray text-sm mt-2">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
            {/* Floating cart — mobile only, non-admin users */}
            {user && user.role !== 'platform_admin' && (
                <FloatingCart cartCount={cartCount} />
            )}
        </div>
    )
}

export default RestaurantDetailPage