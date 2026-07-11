// components/MenuItemCard.jsx — A single food item card

import React from 'react'
import { ShoppingCart, Clock } from 'lucide-react'

const MenuItemCard = ({ item, onAddToCart, isManagerView = false, onToggleAvailability }) => {
    const {
        id,
        name,
        description,
        price,
        image_url,
        availability,
        prep_time_minutes,
        category_name,
    } = item

    // Color coding for availability status
    const availabilityConfig = {
        available: { label: 'Available Now', class: 'badge-green' },
        later: { label: 'Available Later', class: 'badge-amber' },
        unavailable: { label: 'Not Available', class: 'badge-red' },
    }

    const avail = availabilityConfig[availability] || availabilityConfig.unavailable

    return (
        <div className={`card overflow-hidden transition-all duration-200 
                     ${availability === 'unavailable' ? 'opacity-60' : 'hover:shadow-shiny'}`}>

            {/* Food image */}
            <div className="relative h-40 bg-gray-50 overflow-hidden">
                {image_url ? (
                    <img
                        src={image_url}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl">🍴</span>
                    </div>
                )}
                {/* Availability badge */}
                <div className="absolute top-2 left-2">
                    <span className={avail.class}>{avail.label}</span>
                </div>
            </div>

            {/* Card content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h4 className="font-bold text-brand-black">{name}</h4>
                        {category_name && (
                            <p className="text-xs text-brand-gray mt-0.5">{category_name}</p>
                        )}
                    </div>
                    <span className="font-black text-brand-black text-lg">
                        KSh {Number(price).toLocaleString()}
                    </span>
                </div>

                {description && (
                    <p className="text-sm text-brand-gray mt-1.5 line-clamp-2">{description}</p>
                )}

                {/* Prep time */}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-gray">
                    <Clock size={11} />
                    <span>{prep_time_minutes} min</span>
                </div>

                {/* Actions */}
                <div className="mt-3">
                    {isManagerView ? (
                        // Manager can toggle availability
                        <div className="flex gap-2 flex-wrap">
                            {['available', 'later', 'unavailable'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => onToggleAvailability(id, status)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                    ${availability === status
                                            ? 'bg-brand-black text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>
                                    {status === 'available' ? 'Now' : status === 'later' ? 'Later' : 'Unavailable'}
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Customer can add to cart
                        <button
                            onClick={() => onAddToCart && onAddToCart(item)}
                            disabled={availability !== 'available'}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl 
                          font-semibold text-sm transition-all duration-200
                          ${availability === 'available'
                                    ? 'btn-primary'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                            <ShoppingCart size={15} />
                            {availability === 'available' ? 'Add to Cart' : 'Unavailable'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MenuItemCard