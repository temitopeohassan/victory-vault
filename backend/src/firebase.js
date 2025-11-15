import admin from 'firebase-admin'

let app

export function initFirebase() {
  if (app) return admin.firestore()

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️  Firebase credentials not set - using Firestore emulator or default credentials')
    // In development, you might want to use Firebase emulator
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode without Firebase credentials')
    } else {
      throw new Error('Missing Firebase credentials in env')
    }
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      }),
    })
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw error
  }

  return admin.firestore()
}


