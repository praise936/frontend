// context/AuthContext.jsx — Global authentication state

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { connectWebSocket, disconnectWebSocket } from '../api/websocket'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)          // current logged in user
    const [loading, setLoading] = useState(true)    // initial auth check

    // On app load, try to restore session from localStorage
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        const savedUser = localStorage.getItem('user')
        if (token && savedUser) {
            setUser(JSON.parse(savedUser))
            // Re-establish WebSocket connection
            connectWebSocket(token, () => { })
        }
        setLoading(false)
    }, [])

    // context/AuthContext.jsx
const login = async (identifier, password) => {  // Changed from 'username' to 'identifier'
    const res = await api.post('/auth/login/', { identifier, password })
    const { access, refresh, user: userData } = res.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(userData))

    setUser(userData)
    connectWebSocket(access, () => { })

    return userData
}

    const loginWithGoogle = async (idToken) => {
        const res = await api.post('/auth/google/', { id_token: idToken })
        const { access, refresh, user: userData } = res.data

        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        connectWebSocket(access, () => { })
        return userData
    }

    const register = async (formData) => {
        const res = await api.post('/auth/register/', formData)
        const { access, refresh, user: userData } = res.data

        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        connectWebSocket(access, () => { })
        return userData
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
        disconnectWebSocket()
    }

    const updateUser = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook for easy access to auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used inside AuthProvider')
    return context
}