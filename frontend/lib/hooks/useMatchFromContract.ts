'use client'

import { useMatchData } from '@/lib/contracts/usePredictionMarket'
import { formatUnits } from 'viem'
import { useMemo } from 'react'

export function useMatchFromContract(matchId: string) {
  // Convert string ID to bytes32 (assuming hex string)
  const matchIdBytes32 = matchId.startsWith('0x') 
    ? matchId as `0x${string}` 
    : `0x${matchId.padStart(64, '0')}` as `0x${string}`
  
  const { data, isLoading, error } = useMatchData(matchIdBytes32)

  const match = useMemo(() => {
    if (!data) return null

    const [teamA, teamB, startTime, endTime, resolved, result, totalPool, poolA, poolB] = data

    return {
      id: matchId, // Use the original matchId
      teamA,
      teamB,
      startTime: new Date(Number(startTime) * 1000),
      endTime: endTime ? new Date(Number(endTime) * 1000) : null,
      resolved: Boolean(resolved),
      result: Number(result), // 0=None, 1=TeamA, 2=TeamB, 3=Draw
      totalPool: Number(formatUnits(totalPool, 18)), // CELO uses 18 decimals
      poolA: Number(formatUnits(poolA, 18)),
      poolB: Number(formatUnits(poolB, 18)),
      status: resolved ? 'resolved' : Number(startTime) > Math.floor(Date.now() / 1000) ? 'upcoming' : 'active',
      odds: {
        teamA: Number(poolA) > 0 ? Number(totalPool) / Number(poolA) : 1,
        teamB: Number(poolB) > 0 ? Number(totalPool) / Number(poolB) : 1,
      },
    }
  }, [data])

  return { match, isLoading, error }
}

