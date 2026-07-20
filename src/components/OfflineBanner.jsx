import React from 'react'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const OfflineBanner = () => {
    const isOnline = useOnlineStatus()
    if (isOnline) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-800 text-white py-2 flex items-center justify-center gap-2 text-sm font-semibold">
            <WifiOff size={14} /> No internet connection
        </div>
    )
}

export default OfflineBanner