// api/firebaseAuth.js
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)
const app = hasFirebaseConfig ? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig)) : null
const auth = app ? getAuth(app) : null

export const signInWithGooglePopup = async () => {
  if (!auth) {
    throw new Error('Firebase Google auth is not configured.')
  }

  try {
    const provider = new GoogleAuthProvider()
    // Add these scopes for better user data
    provider.addScope('email')
    provider.addScope('profile')
    
    const result = await signInWithPopup(auth, provider)
    
    // Get the ID token
    const idToken = await result.user.getIdToken()
    
    // Log for debugging (remove in production)
    console.log('✅ ID Token obtained:', idToken.substring(0, 50) + '...')
    console.log('✅ User email:', result.user.email)
    
    return idToken
  } catch (error) {
    console.error('❌ Google sign-in error:', error)
    throw error
  }
}

// Add this helper function for debugging
export const getCurrentUser = async () => {
  if (!auth) return null
  const user = auth.currentUser
  if (!user) return null
  return {
    email: user.email,
    displayName: user.displayName,
    uid: user.uid,
  }
}