// components/RestaurantCard.jsx — Card shown on landing page

import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react'

const RestaurantCard = ({ restaurant }) => {
    const {
        id,
        name,
        cuisine_type,
        cover_image_url,
        logo_url,
        average_rating,
        total_reviews,
        address,
        opening_hours,
        is_open,
        status,
    } = restaurant

    return (
        <Link to={`/restaurant/${id}`}>
            <div className="card hover:shadow-shiny-lg transition-all duration-300 hover:-translate-y-1 
                      overflow-hidden cursor-pointer group">

                {/* Cover image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {cover_image_url ? (
                        <img
                            src={cover_image_url}
                            alt={`${name} cover`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        // Placeholder if no cover image
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 
                            flex items-center justify-center">
                            <span className="text-4xl">🍽️</span>
                        </div>
                    )}

                    {/* Open/Closed badge */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold
                           ${is_open && status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-800 text-white opacity-80'}`}>
                        {is_open && status === 'active' ? '● Open' : '● Closed'}
                    </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h3 className="font-bold text-brand-black text-lg leading-tight">{name}</h3>
                            {cuisine_type && (
                                <p className="text-sm text-brand-gray mt-0.5">{cuisine_type}</p>
                            )}
                        </div>
                        {/* Logo */}
                        {logo_url && (
                            <img src={logo_url} alt={`${name} logo`}
                                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <Star size={14} className="text-brand-accent fill-brand-accent" />
                        <span className="text-sm font-semibold text-brand-black">{average_rating || '—'}</span>
                        <span className="text-xs text-brand-gray">({total_reviews} reviews)</span>
                    </div>

                    {/* Address and hours */}
                    <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-brand-gray">
                            <MapPin size={11} />
                            <span className="truncate">{address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-brand-gray">
                            <Clock size={11} />
                            <span>{opening_hours}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default RestaurantCard