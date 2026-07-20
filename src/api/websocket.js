// api/websocket.js

let socket = null
let listeners = []
let reconnectTimer = null
let isConnecting = false
let currentToken = null

const wsBase = (import.meta.env.VITE_WS_BASE_URL || 'wss://backend-production-c10e.up.railway.app')
  .replace(/\/$/, '')
  .replace(/\/ws$/, '')

// Core function to create WebSocket connection
const createWebSocket = (token) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket // Already connecting
  }

  currentToken = token
  socket = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`)

  socket.onopen = () => {
    console.log('🔌 WebSocket connected')
    isConnecting = false
    // Re-subscribe to any restaurants after reconnection
    listeners.forEach(listener => {
      if (listener.type === 'restaurant_subscription') {
        sendSubscription(listener.restaurantId)
      }
    })
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      listeners.forEach((entry) => {
        if (entry.type === 'message_listener') {
          entry.callback(data)
        }
      })
    } catch (err) {
      console.error('WebSocket message parse error:', err)
    }
  }

  socket.onclose = () => {
    console.log('🔌 WebSocket disconnected')
    socket = null
    isConnecting = false
    
    // Attempt reconnection after 3 seconds
    if (currentToken) {
      reconnectTimer = setTimeout(() => {
        console.log('🔄 Attempting to reconnect WebSocket...')
        connectWebSocket(currentToken)
      }, 3000)
    }
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err)
    // Don't close here - let onclose handle reconnection
  }

  return socket
}

// Send subscription message
const sendSubscription = (restaurantId) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'SUBSCRIBE_RESTAURANT',
      restaurant_id: restaurantId,
    }))
    return true
  }
  return false
}

// Main connection function
export const connectWebSocket = (token, onMessage) => {
  if (isConnecting) {
    // If already connecting, just add the listener
    if (onMessage) {
      addMessageListener(onMessage)
    }
    return
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    if (onMessage) {
      addMessageListener(onMessage)
    }
    return
  }

  // Clear any pending reconnect
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  isConnecting = true
  createWebSocket(token)
  
  if (onMessage) {
    addMessageListener(onMessage)
  }
}

// Add message listener
export const addMessageListener = (callback) => {
  // Check if listener already exists
  const exists = listeners.some(
    entry => entry.type === 'message_listener' && entry.callback === callback
  )
  
  if (!exists) {
    const listener = {
      type: 'message_listener',
      callback: callback
    }
    listeners.push(listener)
  }

  // Return cleanup function
  return () => {
    listeners = listeners.filter(
      entry => !(entry.type === 'message_listener' && entry.callback === callback)
    )
  }
}

// Subscribe to restaurant updates
export const subscribeToRestaurant = (restaurantId) => {
  // Store subscription for reconnection
  const exists = listeners.some(
    entry => entry.type === 'restaurant_subscription' && entry.restaurantId === restaurantId
  )
  
  if (!exists) {
    listeners.push({
      type: 'restaurant_subscription',
      restaurantId: restaurantId
    })
  }

  // Send subscription if socket is open
  if (socket && socket.readyState === WebSocket.OPEN) {
    sendSubscription(restaurantId)
  }
}

// Unsubscribe from restaurant
export const unsubscribeFromRestaurant = (restaurantId) => {
  listeners = listeners.filter(
    entry => !(entry.type === 'restaurant_subscription' && entry.restaurantId === restaurantId)
  )
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'UNSUBSCRIBE_RESTAURANT',
      restaurant_id: restaurantId,
    }))
  }
}

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  if (socket) {
    socket.close()
    socket = null
    isConnecting = false
    currentToken = null
    listeners = []
  }
}

// Check if WebSocket is connected
export const isWebSocketConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN
}

// Get connection status
export const getWebSocketStatus = () => {
  if (!socket) return 'disconnected'
  if (socket.readyState === WebSocket.CONNECTING) return 'connecting'
  if (socket.readyState === WebSocket.OPEN) return 'connected'
  if (socket.readyState === WebSocket.CLOSING) return 'closing'
  return 'closed'
}