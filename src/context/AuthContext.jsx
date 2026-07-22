// context/AuthContext.jsx — Global authentication state

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { connectWebSocket, disconnectWebSocket, addMessageListener } from '../api/websocket'
import { registerWebPush } from '../api/webPush'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        const savedUser = localStorage.getItem('user')
        if (token && savedUser) {
            setUser(JSON.parse(savedUser))
            connectWebSocket(token, () => { })
        }
        setLoading(false)
    }, [])

    // If an admin promotes/demotes this user while they're browsing,
    // flip their interface instantly — no logout/login needed.
    useEffect(() => {
        if (!user) return

        const removeListener = addMessageListener((data) => {
            if (data.type === 'ROLE_CHANGED') {
                const updatedUser = data.user
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))

                const token = localStorage.getItem('access_token')
                disconnectWebSocket()
                connectWebSocket(token, () => { })

                registerWebPush()

                window.location.href = '/'
            }
        })

        return removeListener
    }, [user?.id])

    const login = async (identifier, password) => {
        const res = await api.post('/auth/login/', { identifier, password })
        const { access, refresh, user: userData } = res.data

        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        connectWebSocket(access, () => { })

        registerWebPush()

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

        registerWebPush()
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

        registerWebPush()
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

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used inside AuthProvider')
    return context
}