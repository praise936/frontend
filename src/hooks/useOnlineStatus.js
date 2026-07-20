import { useState, useEffect } from 'react'

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => { console.log('📶 Back online'); setIsOnline(true) }
        const handleOffline = () => { console.log('📶 Went offline'); setIsOnline(false) }
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}