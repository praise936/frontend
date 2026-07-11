// components/SearchBar.jsx — Unified search for restaurants and food

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const SearchBar = ({ onSearch, placeholder = "Search restaurants or food..." }) => {
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (query.trim()) {
            if (onSearch) {
                onSearch(query)
            } else {
                // Navigate to home with search query
                navigate(`/?search=${encodeURIComponent(query)}`)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full relative">
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-brand-white-soft 
                     focus:outline-none focus:ring-2 focus:ring-brand-black focus:bg-white
                     text-sm text-brand-black placeholder-gray-400 transition-all duration-200"
                />
            </div>
        </form>
    )
}

export default SearchBar