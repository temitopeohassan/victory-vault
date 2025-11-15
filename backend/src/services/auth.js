import admin from 'firebase-admin'
import crypto from 'crypto'

/**
 * Create a custom token for Firebase Authentication
 * Falls back to a simple JWT-like token if Firebase Auth is not configured
 * @param {string} uid - User ID
 * @returns {Promise<string>} Custom token
 */
export async function createCustomToken(uid) {
  try {
    const customToken = await admin.auth().createCustomToken(uid)
    return customToken
  } catch (error) {
    // If Firebase Auth is not configured, create a simple signed token
    if (error.code === 'auth/configuration-not-found') {
      console.log('⚠️  Firebase Auth not configured, using simple token')
      // Create a simple token: base64(uid + timestamp + secret)
      const secret = process.env.AUTH_SECRET || 'beyond-banter-admin-secret-change-in-production'
      const timestamp = Date.now()
      const payload = `${uid}:${timestamp}`
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
      const token = Buffer.from(`${payload}:${signature}`).toString('base64')
      return token
    }
    console.error('Error creating custom token:', error)
    throw new Error('Failed to create authentication token')
  }
}

