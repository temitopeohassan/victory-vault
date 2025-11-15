import { Router } from 'express'
import admin from 'firebase-admin'
import bcrypt from 'bcrypt'
import { createCustomToken } from '../services/auth.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }

  // Login endpoint - verify email/password and create custom token
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      // Get user from Firestore admins collection
      const adminsRef = db.collection('admins')
      const adminQuery = await adminsRef.where('email', '==', email).limit(1).get()

      if (adminQuery.empty) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      const adminDoc = adminQuery.docs[0]
      const adminData = adminDoc.data()

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, adminData.password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Create custom token for Firebase Auth
      const uid = adminDoc.id
      const customToken = await createCustomToken(uid)

      res.json({
        ok: true,
        token: customToken,
        user: {
          id: uid,
          email: adminData.email,
          username: adminData.username || adminData.email,
        },
      })
    } catch (e) {
      next(e)
    }
  })

  // Verify token endpoint
  router.post('/verify', async (req, res, next) => {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({ error: 'Token is required' })
      }

      let uid
      
      // Try to verify with Firebase Admin first
      try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        uid = decodedToken.uid
      } catch (authError) {
        // If Firebase Auth is not configured, verify our simple token
        if (authError.code === 'auth/configuration-not-found' || authError.code === 'auth/invalid-id-token') {
          try {
            const crypto = await import('crypto')
            const secret = process.env.AUTH_SECRET || 'beyond-banter-admin-secret-change-in-production'
            const decoded = Buffer.from(token, 'base64').toString('utf-8')
            const [payload, signature] = decoded.split(':')
            
            // Verify signature
            const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
            if (signature !== expectedSignature) {
              return res.status(401).json({ error: 'Invalid token signature' })
            }
            
            // Extract uid from payload (format: uid:timestamp)
            const [tokenUid, timestamp] = payload.split(':')
            uid = tokenUid
            
            // Check if token is expired (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp, 10)
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            if (tokenAge > maxAge) {
              return res.status(401).json({ error: 'Token expired' })
            }
          } catch (tokenError) {
            return res.status(401).json({ error: 'Invalid token format' })
          }
        } else {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }
      }
      
      // Get user from admins collection
      const adminDoc = await db.collection('admins').doc(uid).get()
      
      if (!adminDoc.exists) {
        return res.status(401).json({ error: 'Admin not found' })
      }

      const adminData = adminDoc.data()

      res.json({
        ok: true,
        user: {
          id: uid,
          email: adminData.email,
          username: adminData.username || adminData.email,
        },
      })
    } catch (e) {
      next(e)
    }
  })

  // Logout endpoint (client-side mainly, but we can track if needed)
  router.post('/logout', async (_req, res) => {
    res.json({ ok: true, message: 'Logged out successfully' })
  })

  return router
}

