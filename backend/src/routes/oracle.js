import { Router } from 'express'
import { oracleFeedSchema } from '../validation.js'
import { distributeRewards } from '../services/rewards.js'

export function createRouter(db) {
  const router = Router()
  if (!db) {
    router.use((_req, res) => res.status(503).json({ error: 'Database not available' }))
    return router
  }
  const feeds = db.collection('oracleFeeds')
  const matches = db.collection('matches')

  // Post oracle result, mark match resolved, and automatically distribute rewards
  router.post('/', async (req, res, next) => {
    try {
      const { error, value } = oracleFeedSchema.validate(req.body, { stripUnknown: true })
      if (error) return res.status(400).json({ error: error.message })

      let matchId = value.matchId

      // Mark match as resolved
      await db.runTransaction(async (tx) => {
        const matchRef = matches.doc(matchId)
        const matchSnap = await tx.get(matchRef)
        if (!matchSnap.exists) throw Object.assign(new Error('Match not found'), { status: 404 })

        tx.set(feeds.doc(), value)
        tx.update(matchRef, { result: value.result, resolved: true, status: 'resolved' })
      })

      // Automatically distribute rewards after match is resolved
      let distributionResult = null
      try {
        distributionResult = await distributeRewards(db, matchId)
        console.log(`✅ Rewards distributed for match ${matchId}: ${distributionResult.distributed} users, $${distributionResult.totalAmount.toFixed(2)} total`)
      } catch (distError) {
        // Log error but don't fail the oracle post - rewards can be distributed manually later
        console.error(`⚠️  Failed to auto-distribute rewards for match ${matchId}:`, distError.message)
      }

      res.status(201).json({
        ok: true,
        message: 'Match resolved',
        rewardsDistributed: distributionResult ? {
          distributed: distributionResult.distributed,
          totalAmount: distributionResult.totalAmount,
        } : null,
        distributionError: distributionResult ? null : 'Rewards distribution will need to be done manually',
      })
    } catch (e) {
      next(e)
    }
  })

  return router
}


