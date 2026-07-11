// pages/LandingPage.jsx — Home page with restaurant cards

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RestaurantCard from '../components/RestaurantCard'
import SearchBar from '../components/SearchBar'
import api from '../api/axios'
import { Store, TrendingUp } from 'lucide-react'
import { useCart } from '../utils/helpers'

// Import your hero background image from assets
import heroBg from '../assets/hero-bg.jpg'
import Footer from '../components/Footer'
import FloatingCart from '../components/FloatingCart'

const LandingPage = () => {
    
    const { user } = useAuth()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const { cartCount } = useCart()

    useEffect(() => {
        const search = searchParams.get('search') || ''
        fetchRestaurants(search)
    }, [searchParams])

    const fetchRestaurants = async (search = '') => {
        setLoading(true)
        try {
            const res = await api.get(`/restaurants/?search=${search}`)
            setRestaurants(res.data)
        } catch (err) {
            console.error('Failed to load restaurants:', err)
        } finally {
            setLoading(false)
        }
    }

    const searchQuery = searchParams.get('search')

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar cartCount={cartCount} />

            <div className="flex">
                {/* Left sidebar */}
                <Sidebar />

                {/* Main content */}
                <main className="flex-1 p-6">

                    {/* Hero section — shown when no search is active */}
                    {!searchQuery && (
                        <div
                            className="rounded-3xl p-8 mb-8 relative overflow-hidden min-h-[200px] flex items-center"
                            style={{
                                // Use the imported hero image as background
                                backgroundImage: `url(${heroBg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}>

                            {/* Dark overlay so text is readable over the image */}
                            <div className="absolute inset-0 bg-brand-black/70 rounded-3xl" />

                            {/* Decorative accent circles */}
                            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white opacity-5 rounded-full" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-accent opacity-20 rounded-full" />

                            {/* Hero text content — sits above the overlay */}
                            <div className="relative z-10 max-w-lg">
                                <p className="text-brand-accent font-semibold text-sm uppercase tracking-widest mb-2">
                                    🍽️ Welcome to MoiEats
                                </p>
                                <h1 className="text-3xl font-black text-white leading-tight">
                                    Discover & Order from the Best Restaurants in Stage
                                </h1>
                                <p className="text-gray-300 mt-2 text-sm">
                                    Fresh food, real-time updates, right at your fingertips.
                                </p>
                                <div className="mt-5 max-w-sm">
                                    <SearchBar placeholder="What are you craving?" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section heading */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {searchQuery ? (
                                <>
                                    <h2 className="text-xl font-bold text-brand-black">
                                        Results for "{searchQuery}"
                                    </h2>
                                    <span className="badge-gray">{restaurants.length} found</span>
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={20} className="text-brand-black" />
                                    <h2 className="text-xl font-bold text-brand-black">All Restaurants</h2>
                                    <span className="badge-gray">{restaurants.length}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Restaurant grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card overflow-hidden animate-pulse">
                                    <div className="h-48 bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : restaurants.length === 0 ? (
                        // Empty state — uses your empty-plate.png
                        <div className="text-center py-20">
                            <img
                                src="/src/assets/empty-plate.png"
                                alt="No restaurants"
                                className="w-32 h-32 object-contain mx-auto mb-4 opacity-50"
                            />
                            <h3 className="text-xl font-bold text-brand-black">No restaurants found</h3>
                            <p className="text-brand-gray mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
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

export default LandingPage