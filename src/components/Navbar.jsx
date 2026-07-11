// components/Navbar.jsx — Top navigation bar

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import SearchBar from './SearchBar'
import { ShoppingCart, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'

const Navbar = ({ cartCount = 0 }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const getDashboardLink = () => {
        if (user?.role === 'platform_admin') return '/admin'
        if (user?.role === 'restaurant_manager') return '/dashboard'
        return null
    }

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="container-main">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🍽</span>
                        </div>
                        <span className="text-xl font-black text-brand-black tracking-tight">
                            MOI<span className="text-brand-accent">EATS</span>
                        </span>
                    </Link>

                    {/* Center search bar — hidden on mobile */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <SearchBar />
                    </div>

                    {/* Right side actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                {/* Notification bell — all logged in users */}
                                <NotificationBell />

                                {/*
                  Cart icon — visible for ALL logged in users
                  Customers use it to checkout
                  Managers can also see it (they might order food too)
                  Only platform_admin doesn't need a cart
                */}
                                {user.role !== 'platform_admin' && (
                                    <Link
                                        to="/cart"
                                        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <ShoppingCart size={22} className="text-brand-black" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white
                                       text-xs font-bold rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Dashboard link — managers and admin */}
                                {getDashboardLink() && (
                                    <Link
                                        to={getDashboardLink()}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                               text-brand-black hover:bg-gray-100 rounded-xl transition-colors">
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>
                                )}

                                {/* User avatar / name chip */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-brand-white-mid rounded-xl">
                                    <div className="w-7 h-7 bg-brand-black rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-brand-black">
                                        {user.first_name || user.username}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-500 hover:text-red-500">
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile dropdown menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
                        <SearchBar />

                        {user ? (
                            <div className="space-y-1">

                                {/* Cart — all non-admin users on mobile too */}
                                {user.role !== 'platform_admin' && (
                                    <Link
                                        to="/cart"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                                        <ShoppingCart size={18} />
                                        <span>Cart</span>
                                        {cartCount > 0 && (
                                            <span className="ml-auto w-5 h-5 bg-brand-accent text-white text-xs
                                       font-bold rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Dashboard */}
                                {getDashboardLink() && (
                                    <Link
                                        to={getDashboardLink()}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                                        <LayoutDashboard size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                )}

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50
                             text-red-600 w-full transition-colors">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3 pt-1">
                                <Link to="/login" className="btn-secondary flex-1 text-center">Sign In</Link>
                                <Link to="/register" className="btn-primary flex-1 text-center">Sign Up</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar