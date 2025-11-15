import { Router } from 'express'
import { userSchema } from '../validation.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }
  const col = db.collection('users')

  router.get('/', async (req, res, next) => {
    try {
      const { leaderboard, limit = '1000' } = req.query
      let query = col.limit(Number(limit))
      
      // If leaderboard is requested, order by totalEarned descending
      if (leaderboard === 'true') {
        query = col.orderBy('totalEarned', 'desc').limit(Number(limit) || 100)
      }
      
      const snap = await query.get()
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      res.json(items)
    } catch (e) { next(e) }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const snap = await col.doc(req.params.id).get()
      if (!snap.exists) return res.status(404).json({ error: 'User not found' })
      res.json({ id: snap.id, ...snap.data() })
    } catch (e) { next(e) }
  })

  router.post('/', async (req, res, next) => {
    try {
      const { error, value } = userSchema.validate(req.body, { stripUnknown: true })
      if (error) return res.status(400).json({ error: error.message })
      const ref = col.doc(value.walletAddress)
      await ref.set(value, { merge: true })
      const snap = await ref.get()
      res.status(201).json({ id: ref.id, ...snap.data() })
    } catch (e) { next(e) }
  })

  return router
}


