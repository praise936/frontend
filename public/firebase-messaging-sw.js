// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyA-7D4soz_njDyv35vby5dYCNbcFyF57ag',
  authDomain: 'foodcourt-a68fe.firebaseapp.com',
  projectId: 'foodcourt-a68fe',
  appId: '1:160496630161:web:af612aac174c60049b0230',
})

const messaging = firebase.messaging()

// Handles notifications that arrive while no tab is open/focused
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'MoiEats', {
    body: body || '',
    icon: icon || '/icon-192x192.png',
  })
})