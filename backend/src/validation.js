import Joi from 'joi'

export const userSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  username: Joi.string().min(2).max(32).required(),
  totalStaked: Joi.number().min(0).default(0),
  totalEarned: Joi.number().min(0).default(0),
})

export const matchSchema = Joi.object({
  id: Joi.string().required(),
  teamA: Joi.string().required(),
  teamB: Joi.string().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().optional(),
  status: Joi.string().valid('active', 'upcoming', 'resolved').required(),
  totalPool: Joi.number().min(0).required(),
  poolA: Joi.number().min(0).required(),
  poolB: Joi.number().min(0).required(),
  result: Joi.string().valid('teamA', 'teamB', 'draw').allow(null),
  resolved: Joi.boolean().default(false),
})

export const stakeSchema = Joi.object({
  userId: Joi.string().required(),
  matchId: Joi.string().required(),
  outcome: Joi.string().valid('teamA', 'teamB').required(),
  amount: Joi.number().positive().required(),
  timestamp: Joi.date().default(() => new Date()),
})

export const oracleFeedSchema = Joi.object({
  matchId: Joi.string().required(),
  source: Joi.string().required(),
  result: Joi.string().valid('teamA', 'teamB', 'draw').required(),
  verifiedAt: Joi.date().default(() => new Date()),
})


