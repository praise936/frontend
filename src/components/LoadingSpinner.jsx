// components/LoadingSpinner.jsx — Full page loading indicator

import React from 'react'

const LoadingSpinner = () => {
    return (
        <div className="min-h-screen bg-brand-white-soft flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Spinning ring */}
                <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-black rounded-full animate-spin" />
                <p className="text-brand-gray font-medium">Loading...</p>
            </div>
        </div>
    )
}

export default LoadingSpinner