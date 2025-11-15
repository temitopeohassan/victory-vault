import admin from 'firebase-admin'

// rewardFormula: (userStake / totalWinningPool) * (totalPool * (1 - platformFee))
const PLATFORM_FEE = 0.02

/**
 * Distribute rewards for a resolved match
 * @param {FirebaseFirestore.Firestore} db - Firestore database instance
 * @param {string} matchId - Match ID to distribute rewards for
 * @returns {Promise<{ distributed: number, totalAmount: number }>}
 */
export async function distributeRewards(db, matchId) {
  const stakes = db.collection('stakes')
  const matches = db.collection('matches')
  const users = db.collection('users')
  const txns = db.collection('transactions')

  const matchSnap = await matches.doc(matchId).get()
  if (!matchSnap.exists) {
    throw new Error('Match not found')
  }

  const match = matchSnap.data()
  if (!match.resolved || !match.result) {
    throw new Error('Match not resolved')
  }

  const winningKey = match.result === 'teamA' ? 'teamA' : match.result === 'teamB' ? 'teamB' : 'draw'
  if (winningKey === 'draw') {
    throw new Error('Draw payouts not implemented')
  }

  const poolTotal = Number(match.totalPool || 0)
  const distributable = poolTotal * (1 - PLATFORM_FEE)

  const winningStakesSnap = await stakes
    .where('matchId', '==', matchId)
    .where('outcome', '==', winningKey)
    .get()

  const totalWinningPool = winningStakesSnap.docs.reduce((sum, d) => sum + Number(d.data().amount || 0), 0)
  if (totalWinningPool <= 0) {
    return { distributed: 0, totalAmount: 0 }
  }

  // Process rewards in a batch
  const batch = db.batch()
  let count = 0
  let totalDistributed = 0

  for (const doc of winningStakesSnap.docs) {
    const s = doc.data()
    const reward = (Number(s.amount) / totalWinningPool) * distributable
    totalDistributed += reward

    const txnRef = txns.doc()
    batch.set(txnRef, {
      txHash: txnRef.id,
      userId: s.userId,
      type: 'reward',
      amount: reward,
      status: 'success',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      matchId,
    })

    const userRef = users.doc(s.userId)
    batch.update(userRef, {
      totalEarned: admin.firestore.FieldValue.increment(reward),
    })

    count++
  }

  await batch.commit()
  return { distributed: count, totalAmount: totalDistributed }
}

