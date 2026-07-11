// hooks/usePWAInstall.js — Captures the browser install prompt for PWA

import { useState, useEffect } from 'react'

const usePWAInstall = () => {
    // Store the deferred install prompt event
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isInstallable, setIsInstallable] = useState(false)

    useEffect(() => {
        // Check if already installed as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Listen for the browser's beforeinstallprompt event
        // This fires when the app meets PWA install criteria
        const handler = (e) => {
            // Prevent browser from showing its own prompt automatically
            e.preventDefault()
            // Save it so we can trigger it manually on button click
            setInstallPrompt(e)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setIsInstallable(false)
            setInstallPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const triggerInstall = async () => {
        if (!installPrompt) return false

        // Show the browser's native install dialog
        installPrompt.prompt()

        // Wait for user's choice
        const { outcome } = await installPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstalled(true)
            setIsInstallable(false)
            setInstallPrompt(null)
            return true
        }

        return false
    }

    return { isInstallable, isInstalled, triggerInstall }
}

export default usePWAInstall