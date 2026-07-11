// components/FloatingCart.jsx — Floating cart button for mobile screens only
// Sits fixed on the right side, a few pixels from the top
// Only visible on small screens (md and below)

import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

const FloatingCart = ({ cartCount = 0 }) => {
    // Only render for non-admin users — admin has no cart
    return (
        <Link
            to="/cart"
            className="md:hidden fixed top-20 right-4 z-40 w-12 h-12 bg-brand-black 
                 rounded-2xl flex items-center justify-center shadow-shiny-lg
                 hover:bg-brand-black-light transition-all active:scale-95">
            <ShoppingCart size={20} className="text-white" />

            {/* Badge — only shows when cart has items */}
            {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-accent text-white
                         text-xs font-bold rounded-full flex items-center justify-center
                         shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                </span>
            )}
        </Link>
    )
}

export default FloatingCart