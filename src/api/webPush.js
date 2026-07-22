import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getApps, initializeApp } from 'firebase/app'
import api from './axios'
import toast from 'react-hot-toast'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const registerWebPush = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.log('🔔 Push not supported in this browser')
      return
    }

    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission:', permission)
    if (permission !== 'granted') return

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    console.log('🔔 Service worker registered')

    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (!token) {
      console.log('🔔 No FCM token obtained')
      return
    }

    console.log('🔔 Web push token obtained, saving to backend')
    await api.post('/notifications/save-token/', { token })

    // Handle notifications that arrive while the tab IS open/focused
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {}
      toast(`${title || ''}: ${body || ''}`, { icon: '🔔' })
    })
  } catch (err) {
    console.log('🔔 Web push setup failed:', err.message)
  }
}