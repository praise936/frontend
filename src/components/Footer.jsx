// components/Footer.jsx — Site footer with PWA download button

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Smartphone, CheckCircle, Wifi, Bell, Zap } from 'lucide-react'
import usePWAInstall from '../hooks/usePWAInstall'
import toast from 'react-hot-toast'

const Footer = () => {
    const { isInstallable, isInstalled, triggerInstall } = usePWAInstall()
    const [installing, setInstalling] = useState(false)

    const handleInstall = async () => {
        setInstalling(true)
        try {
            const accepted = await triggerInstall()
            if (accepted) {
                toast.success('FoodCourt installed successfully!')
            } else {
                toast('Installation cancelled', { icon: '👋' })
            }
        } catch (err) {
            toast.error('Installation failed. Try from your browser menu.')
        } finally {
            setInstalling(false)
        }
    }

    return (
        <footer className="bg-brand-black text-white mt-16">

            {/* Download banner — the main CTA section */}
            <div className="border-b border-gray-800">
                <div className="container-main py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                        {/* Left — text */}
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                                <Smartphone size={20} className="text-brand-accent" />
                                <span className="text-brand-accent font-semibold text-sm uppercase tracking-wider">
                                    Get the App
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-white leading-tight">
                                Take MOI-EATS everywhere you go
                            </h2>
                            <p className="text-gray-400 mt-2 max-w-md">
                                Install MOI_EATS on your device for the full experience —
                                faster loading, real-time notifications, and works offline.
                            </p>

                            {/* Feature pills */}
                            <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                                {[
                                    { icon: Zap, label: 'Instant loading' },
                                    { icon: Bell, label: 'Push notifications' },
                                    { icon: Wifi, label: 'Works offline' },
                                ].map(({ icon: Icon, label }) => (
                                    <span key={label}
                                        className="flex items-center gap-1.5 bg-white/10 text-gray-300 
                               text-xs font-medium px-3 py-1.5 rounded-full">
                                        <Icon size={11} className="text-brand-accent" />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right — download button */}
                        <div className="flex flex-col items-center gap-3">
                            {isInstalled ? (
                                // Already installed
                                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 
                                px-6 py-4 rounded-2xl">
                                    <CheckCircle size={24} className="text-green-400" />
                                    <div>
                                        <p className="font-bold text-green-400">App Installed!</p>
                                        <p className="text-xs text-gray-400">FoodCourt is on your device</p>
                                    </div>
                                </div>
                            ) : isInstallable ? (
                                // Browser supports PWA install — show real install button
                                <button
                                    onClick={handleInstall}
                                    disabled={installing}
                                    className="group flex items-center gap-3 bg-brand-accent hover:bg-amber-500 
                             text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200
                             shadow-lg hover:shadow-brand-accent/30 hover:scale-105 active:scale-95
                             disabled:opacity-70 disabled:cursor-not-allowed">
                                    {installing ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Download size={22} className="group-hover:animate-bounce" />
                                    )}
                                    <div className="text-left">
                                        <p className="text-sm opacity-80 font-normal leading-none mb-0.5">Download for Free</p>
                                        <p className="text-lg leading-none">Install FoodCourt</p>
                                    </div>
                                </button>
                            ) : (
                                // Browser doesn't support auto-prompt — show manual instructions
                                <div className="text-center">
                                    <button
                                        onClick={() => toast('On Chrome: tap the menu (⋮) → "Add to Home Screen". On Safari: tap Share → "Add to Home Screen"', {
                                            icon: '📱',
                                            duration: 6000,
                                        })}
                                        className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 
                               border border-white/20 text-white font-bold px-8 py-4 rounded-2xl 
                               transition-all duration-200 hover:scale-105 active:scale-95">
                                        <Download size={22} />
                                        <div className="text-left">
                                            <p className="text-sm opacity-70 font-normal leading-none mb-0.5">Add to Home Screen</p>
                                            <p className="text-lg leading-none">Install FoodCourt</p>
                                        </div>
                                    </button>
                                    <p className="text-xs text-gray-600 mt-2">Tap for instructions</p>
                                </div>
                            )}

                            {/* Platform hints */}
                            <p className="text-xs text-gray-600 text-center">
                                Works on Android · iOS · Windows · Mac
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom footer links */}
            <div className="container-main py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm">🍽</span>
                        </div>
                        <span className="text-lg font-black text-white">
                            MOI<span className="text-brand-accent">EATS</span>
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} MOI-EATS. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer