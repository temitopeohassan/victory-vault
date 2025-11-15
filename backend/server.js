import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { initFirebase } from './src/firebase.js'
import { createRouter as createUsers } from './src/routes/users.js'
import { createRouter as createMatches } from './src/routes/matches.js'
import { createRouter as createStakes } from './src/routes/stakes.js'
import { createRouter as createOracle } from './src/routes/oracle.js'
import { createRouter as createTxns } from './src/routes/transactions.js'
import { createRouter as createAuth } from './src/routes/auth.js'

const app = express()

app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean) || true }))
app.use(express.json())
app.use(morgan('dev'))

// Default route
app.get('/', (_req, res) => {
  res.send('<h1>Welcome To Victory  Vault API</h1>')
})

// Health
app.get('/health', (_req, res) => res.json({ ok: true }))

// Init Firebase
let db
try {
  db = initFirebase()
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message)
  // In development, allow server to start without Firebase (for testing)
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1)
  }
  db = null
}

// Routers
if (db) {
  app.use('/api/auth', createAuth(db))
  app.use('/api/users', createUsers(db))
  app.use('/api/matches', createMatches(db))
  app.use('/api/stakes', createStakes(db))
  app.use('/api/oracle', createOracle(db))
  app.use('/api/transactions', createTxns(db))
} else {
  console.warn('⚠️  Running without database - routes disabled')
}

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Victory  Vault backend listening on :${port}`)
})


