import 'dotenv/config'
import { initFirebase } from '../src/firebase.js'
import admin from 'firebase-admin'
import readline from 'readline'
import bcrypt from 'bcrypt'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function addAdmin() {
  try {
    // Initialize Firebase
    const db = initFirebase()
    console.log('✅ Firebase initialized\n')

    // Get admin details
    const email = await question('Enter admin email: ')
    const username = await question('Enter admin username (optional, press Enter to use email): ') || email
    const password = await question('Enter admin password: ')

    if (!email || !password) {
      console.error('❌ Email and password are required')
      process.exit(1)
    }

    // Hash password with bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('✅ Password hashed')

    // Check if admin already exists
    const adminsRef = db.collection('admins')
    const existingAdmin = await adminsRef.where('email', '==', email).limit(1).get()

    let adminId
    if (!existingAdmin.empty) {
      console.log('⚠️  Admin with this email already exists. Updating...')
      adminId = existingAdmin.docs[0].id
      await adminsRef.doc(adminId).update({
        username,
        password: hashedPassword,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log('✅ Admin updated in Firestore')
    } else {
      // Generate a unique ID for the admin (we'll use email as base and create a simple UID)
      // For Firebase Auth compatibility, we could create the user later, but for now use email hash
      const crypto = await import('crypto')
      adminId = crypto.createHash('sha256').update(email).digest('hex').substring(0, 28)
      
      // Try to create Firebase Auth user (optional - if Auth is configured)
      try {
        const firebaseUser = await admin.auth().createUser({
          email,
          emailVerified: false,
          disabled: false,
          uid: adminId,
        })
        console.log('✅ Firebase Auth user created:', firebaseUser.uid)
        adminId = firebaseUser.uid
      } catch (authError) {
        // If Firebase Auth is not configured or user exists, that's okay
        // We'll still create the Firestore document
        if (authError.code === 'auth/email-already-exists') {
          try {
            const user = await admin.auth().getUserByEmail(email)
            adminId = user.uid
            console.log('⚠️  Firebase Auth user already exists, using existing UID:', adminId)
          } catch (e) {
            console.log('⚠️  Could not get Firebase Auth user, using generated UID:', adminId)
          }
        } else if (authError.code === 'auth/configuration-not-found') {
          console.log('⚠️  Firebase Auth not configured, creating admin in Firestore only')
          // Use the generated ID
        } else {
          console.log('⚠️  Firebase Auth error (non-critical):', authError.message)
          // Continue with Firestore-only approach
        }
      }

      // Create admin document in Firestore
      await adminsRef.doc(adminId).set({
        email,
        username,
        password: hashedPassword, // Stored as hashed password
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log('✅ Admin document created in Firestore')
    }

    console.log('\n✅ Admin added successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Username: ${username}`)
    console.log(`   UID: ${adminId}`)
  } catch (error) {
    console.error('❌ Error adding admin:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

addAdmin()

