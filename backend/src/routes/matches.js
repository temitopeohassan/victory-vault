import { Router } from 'express'
import { matchSchema } from '../validation.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }
  const col = db.collection('matches')

  router.get('/', async (_req, res, next) => {
    try {
      const snap = await col.orderBy('startTime', 'desc').limit(100).get()
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      res.json(items)
    } catch (e) { next(e) }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const doc = await col.doc(req.params.id).get()
      if (!doc.exists) return res.status(404).json({ error: 'Match not found' })
      res.json({ id: doc.id, ...doc.data() })
    } catch (e) { next(e) }
  })

  router.post('/', async (req, res, next) => {
    try {
      const { error, value } = matchSchema.validate(req.body, { stripUnknown: true })
      if (error) return res.status(400).json({ error: error.message })
      await col.doc(value.id).set(value)
      const doc = await col.doc(value.id).get()
      res.status(201).json({ id: doc.id, ...doc.data() })
    } catch (e) { next(e) }
  })

  return router
}


