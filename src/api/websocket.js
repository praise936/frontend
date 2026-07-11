let socket = null
let listeners = []

const wsBase = (import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000').replace(/\/$/, '').replace(/\/ws$/, '')

export const connectWebSocket = (token, onMessage) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    listeners.push(onMessage)
    return
  }

  socket = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`)

  socket.onopen = () => {
    console.log('🔌 WebSocket connected')
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    listeners.forEach((listener) => listener(data))
  }

  socket.onclose = () => {
    console.log('🔌 WebSocket disconnected')
    socket = null
  }

  socket.onerror = (err) => {
    console.error('WebSocket error:', err)
  }

  listeners = [onMessage]
}

export const subscribeToRestaurant = (restaurantId) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'SUBSCRIBE_RESTAURANT',
      restaurant_id: restaurantId,
    }))
  }
}

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close()
    socket = null
    listeners = []
  }
}

export const addMessageListener = (listener) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((entry) => entry !== listener)
  }
}
