import { Router } from 'express'
import { stakeSchema } from '../validation.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }
  const stakes = db.collection('stakes')
  const matches = db.collection('matches')
  const users = db.collection('users')

  // Get stakes (optionally filtered by matchId)
  router.get('/', async (req, res, next) => {
    try {
      const { matchId } = req.query
      let query = stakes.orderBy('timestamp', 'desc')
      if (matchId) {
        query = query.where('matchId', '==', matchId)
      }
      const snap = await query.limit(100).get()
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      res.json(items)
    } catch (e) {
      next(e)
    }
  })

  // Create stake and update pools atomically using a transaction
  router.post('/', async (req, res, next) => {
    try {
      const { error, value } = stakeSchema.validate(req.body, { stripUnknown: true })
      if (error) return res.status(400).json({ error: error.message })

      await db.runTransaction(async (tx) => {
        const matchRef = matches.doc(value.matchId)
        const matchSnap = await tx.get(matchRef)
        if (!matchSnap.exists) throw Object.assign(new Error('Match not found'), { status: 404 })
        const match = matchSnap.data()
        if (match.status !== 'active') throw Object.assign(new Error('Match not active'), { status: 400 })

        const stakeRef = stakes.doc()
        tx.set(stakeRef, value)

        const poolKey = value.outcome === 'teamA' ? 'poolA' : 'poolB'
        const updated = {
          totalPool: Number(match.totalPool || 0) + value.amount,
          [poolKey]: Number(match[poolKey] || 0) + value.amount,
        }
        tx.update(matchRef, updated)

        const userRef = users.doc(value.userId)
        const userSnap = await tx.get(userRef)
        if (userSnap.exists) {
          const prev = userSnap.data().totalStaked || 0
          tx.update(userRef, { totalStaked: prev + value.amount })
        }
      })

      res.status(201).json({ ok: true })
    } catch (e) { next(e) }
  })

  return router
}


