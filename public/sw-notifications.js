/**
 * Service Worker for AI Cost Guardian System Notifications
 * Handles background notifications and click actions
 */

const CACHE_NAME = 'ai-cost-guardian-notifications-v1'
const NOTIFICATION_ENDPOINT = '/api/notifications'

// Install event
self.addEventListener('install', (event) => {
  console.log('Notification service worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Notification service worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event (for future server-sent notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  if (event.data) {
    try {
      const data = event.data.json()

      const options = {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        tag: data.tag || 'ai-cost-guardian',
        requireInteraction: data.priority === 'urgent' || data.priority === 'high',
        silent: data.priority === 'low',
        data: data.data || {},
        actions: data.actions || [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/view-icon.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/dismiss-icon.png'
          }
        ]
      }

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      )
    } catch (error) {
      console.error('Error parsing push data:', error)

      // Show generic notification
      event.waitUntil(
        self.registration.showNotification('AI Cost Guardian', {
          body: 'You have a new notification',
          icon: '/icons/notification-icon.png',
          tag: 'ai-cost-guardian-generic'
        })
      )
    }
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  const notification = event.notification
  const action = event.action
  const data = notification.data || {}

  notification.close()

  // Handle different actions
  switch (action) {
    case 'view':
      handleViewAction(data)
      break
    case 'dismiss':
      handleDismissAction(data)
      break
    default:
      // Default click action - open the app
      handleDefaultClick(data)
      break
  }

  // Log the interaction
  logNotificationInteraction(action || 'click', data)
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)

  const data = event.notification.data || {}
  logNotificationInteraction('close', data)
})

/**
 * Handle view action
 */
function handleViewAction(data) {
  const url = data.url || '/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if the app is already open
        for (const client of clientList) {
          if (client.url.includes(new URL(url, self.location.origin).pathname)) {
            return client.focus()
          }
        }

        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
      .catch((error) => {
        console.error('Error handling view action:', error)
      })
  )
}

/**
 * Handle dismiss action
 */
function handleDismissAction(data) {
  // Mark notification as dismissed
  if (data.notificationId) {
    fetch(`${NOTIFICATION_ENDPOINT}/${data.notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'DISMISSED',
        dismissedAt: new Date().toISOString()
      })
    }).catch((error) => {
      console.error('Failed to mark notification as dismissed:', error)
    })
  }
}

/**
 * Handle default click action
 */
function handleDefaultClick(data) {
  const url = data.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        if (clientList.length > 0) {
          const client = clientList[0]
          if (client.url !== url) {
            // Navigate to the notification URL
            client.postMessage({
              type: 'NAVIGATE',
              url: url,
              data: data
            })
          }
          return client.focus()
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
      .catch((error) => {
        console.error('Error handling default click:', error)
      })
  )
}

/**
 * Log notification interaction for analytics
 */
function logNotificationInteraction(action, data) {
  const logData = {
    action: action,
    timestamp: new Date().toISOString(),
    notificationData: data,
    userAgent: self.navigator.userAgent
  }

  // Send to analytics endpoint
  fetch('/api/analytics/notification-interaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(logData)
  }).catch((error) => {
    console.error('Failed to log notification interaction:', error)
  })
}

/**
 * Handle background sync for failed notification interactions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-interaction-retry') {
    event.waitUntil(retryFailedInteractions())
  }
})

/**
 * Retry failed notification interactions
 */
function retryFailedInteractions() {
  // Implementation for retrying failed API calls
  // This would typically involve checking IndexedDB for failed requests
  // and attempting to resend them

  return Promise.resolve()
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data)

  const { type, data } = event.data

  switch (type) {
    case 'SHOW_NOTIFICATION':
      showNotification(data)
      break
    case 'CLEAR_NOTIFICATIONS':
      clearNotifications(data.tag)
      break
    case 'UPDATE_BADGE':
      updateBadge(data.count)
      break
    default:
      console.log('Unknown message type:', type)
  }
})

/**
 * Show notification from main thread
 */
function showNotification(data) {
  const options = {
    body: data.body,
    icon: data.icon || '/icons/notification-icon.png',
    badge: data.badge || '/icons/badge-icon.png',
    tag: data.tag || 'ai-cost-guardian',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    data: data.data || {},
    actions: data.actions || []
  }

  return self.registration.showNotification(data.title, options)
}

/**
 * Clear notifications by tag
 */
function clearNotifications(tag) {
  return self.registration.getNotifications({ tag })
    .then((notifications) => {
      notifications.forEach((notification) => notification.close())
    })
}

/**
 * Update badge count (if supported)
 */
function updateBadge(count) {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count)
    } else {
      navigator.clearAppBadge()
    }
  }
}

console.log('AI Cost Guardian notification service worker loaded')