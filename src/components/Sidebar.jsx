// components/Sidebar.jsx — Left sidebar with restaurant list
// On mobile: hidden by default, triggered by a floating button
// On desktop: always visible

import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { Store, ChevronRight, Menu, X } from 'lucide-react'

const Sidebar = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)

    // Controls mobile open/close state
    const [mobileOpen, setMobileOpen] = useState(false)

    const location = useLocation()

    useEffect(() => {
        fetchRestaurants()
    }, [])

    // Close sidebar whenever the route changes on mobile
    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/restaurants/')
            setRestaurants(res.data)
        } catch (err) {
            console.error('Failed to load restaurants:', err)
        } finally {
            setLoading(false)
        }
    }

    // The actual sidebar panel content — shared between mobile and desktop
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-brand-black text-sm uppercase tracking-wider">
                    Restaurants
                </h2>
                {/* Close button — only visible on mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X size={18} className="text-brand-black" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">

                {/* All Restaurants button */}
                <Link
                    to="/"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors group
            ${location.pathname === '/' && !location.search
                            ? 'bg-brand-black text-white'
                            : 'hover:bg-gray-100 text-brand-black'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${location.pathname === '/'
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        <Store size={16} />
                    </div>
                    <span className="text-sm font-semibold">All Restaurants</span>
                    <ChevronRight size={14} className="ml-auto opacity-50" />
                </Link>

                {/* Divider */}
                <div className="my-2 border-t border-gray-100" />

                {/* Individual restaurant links */}
                {loading ? (
                    <div className="space-y-2 px-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    restaurants.map((restaurant) => {
                        const isActive = location.pathname === `/restaurant/${restaurant.id}`
                        return (
                            <Link
                                key={restaurant.id}
                                to={`/restaurant/${restaurant.id}`}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors group
                  ${isActive
                                        ? 'bg-brand-black text-white'
                                        : 'hover:bg-gray-100 text-brand-black'}`}>

                                {/* Logo or initial */}
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    {restaurant.logo_url ? (
                                        <img
                                            src={restaurant.logo_url}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-brand-black-mid flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">
                                                {restaurant.name[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{restaurant.name}</p>
                                    <p className={`text-xs ${restaurant.is_open ? 'text-green-500' : 'text-gray-400'}`}>
                                        {restaurant.is_open ? '● Open' : '● Closed'}
                                    </p>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* ── DESKTOP SIDEBAR — always visible on md and above ── */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* ── MOBILE SIDEBAR ── */}

            {/* Floating trigger button — only on small screens, only when sidebar is closed */}
            {!mobileOpen && (
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden fixed top-40 right-4 z-40 flex items-center gap-2
                     bg-brand-black text-white px-4 py-3 rounded-2xl shadow-shiny-lg
                     hover:bg-brand-black-light transition-all active:scale-95">
                    <Menu size={18} />
                    <span className="text-sm font-semibold">See Restaurants</span>
                    {/* Show count badge */}
                    {restaurants.length > 0 && (
                        <span className="w-5 h-5 bg-brand-accent text-white text-xs font-bold
                             rounded-full flex items-center justify-center">
                            {restaurants.length}
                        </span>
                    )}
                </button>
            )}

            {/* Dark backdrop — tapping it closes the sidebar */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Slide-in drawer panel */}
            <aside
                className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-shiny-lg
                    transform transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </>
    )
}

export default Sidebar