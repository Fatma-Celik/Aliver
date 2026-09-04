import * as admin from 'firebase-admin'
import fs from 'node:fs'
import path from 'node:path'

let isInitialized = false

function initializeFirebase() {
  if (isInitialized || admin.apps.length > 0) return

  try {
    let serviceAccount: any = null
    
    // First try from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    } else {
      // Then try local file (for development or Render secret file)
      const filePath = path.join(process.cwd(), 'firebase-admin.json')
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      isInitialized = true
      console.log('Firebase Admin initialized successfully.')
    } else {
      console.warn('Firebase service account not found. Push notifications will not work.')
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
  }
}

initializeFirebase()

export const messaging = isInitialized || admin.apps.length > 0 ? admin.messaging() : null

/**
 * Send a notification to specific FCM tokens
 */
export async function sendPushNotification(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (!messaging || tokens.length === 0) return

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens: tokens,
    }
    const response = await messaging.sendEachForMulticast(message)
    console.log(`Successfully sent ${response.successCount} messages. Failed: ${response.failureCount}`)
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}
