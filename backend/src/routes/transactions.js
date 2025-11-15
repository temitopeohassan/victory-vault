import { Router } from 'express'
import { distributeRewards } from '../services/rewards.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }

  router.post('/distribute/:matchId', async (req, res, next) => {
    try {
      const matchId = req.params.matchId
      const result = await distributeRewards(db, matchId)
      res.json({ ok: true, distributed: result.distributed, totalAmount: result.totalAmount })
    } catch (e) {
      if (e.message === 'Match not found') {
        return res.status(404).json({ error: e.message })
      }
      if (e.message === 'Match not resolved') {
        return res.status(400).json({ error: e.message })
      }
      if (e.message === 'Draw payouts not implemented') {
        return res.status(400).json({ error: e.message })
      }
      next(e)
    }
  })

  return router
}


