'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/auth-store'
import { toast } from 'sonner'

export default function PushNotificationListener() {
  const token = useAppStore((state) => state.token)

  useEffect(() => {
    let isRegistered = false

    const setupPushNotifications = async () => {
      if (!token) return

      try {
        if (
          typeof window === 'undefined' ||
          !(window as any).Capacitor?.isNativePlatform()
        ) {
          return // Only run on native Android/iOS
        }

        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Request permission
        let permStatus = await PushNotifications.checkPermissions()

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions()
        }

        if (permStatus.receive !== 'granted') {
          console.log('User denied push notification permissions')
          return
        }

        // Register with Apple / Google to receive token
        await PushNotifications.register()

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', async (data) => {
          console.log('Push registration success, token: ' + data.value)
          
          // Send FCM token to our backend
          try {
            await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/users/fcm-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ fcmToken: data.value }),
            })
          } catch (e) {
            console.error('Failed to save FCM token', e)
          }
        })

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error))
        })

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification))
          toast(notification.title || 'Yeni Bildirim', {
            description: notification.body || '',
            duration: 4000,
          })
        })

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification))
          // We could route to a specific page here based on notification.data
        })

        isRegistered = true
      } catch (e) {
        console.error('Push Notifications setup failed', e)
      }
    }

    setupPushNotifications()

    return () => {
      if (isRegistered) {
        import('@capacitor/push-notifications').then(({ PushNotifications }) => {
          PushNotifications.removeAllListeners()
        })
      }
    }
  }, [token])

  return null
}
