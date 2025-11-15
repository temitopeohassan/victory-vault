'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS } from './config'
import { formatEther, parseUnits } from 'viem'

// Note: Import ABI from the compiled contract JSON
// For now, we'll use a minimal ABI with the functions we need
const PREDICTION_MARKET_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'matchesById',
    outputs: [
      { internalType: 'string', name: 'teamA', type: 'string' },
      { internalType: 'string', name: 'teamB', type: 'string' },
      { internalType: 'uint64', name: 'startTime', type: 'uint64' },
      { internalType: 'uint64', name: 'endTime', type: 'uint64' },
      { internalType: 'bool', name: 'resolved', type: 'bool' },
      { internalType: 'uint8', name: 'result', type: 'uint8' },
      { internalType: 'uint256', name: 'totalPool', type: 'uint256' },
      { internalType: 'uint256', name: 'poolA', type: 'uint256' },
      { internalType: 'uint256', name: 'poolB', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'uint8', name: 'outcome', type: 'uint8' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export function useMatchData(matchId: `0x${string}` | string) {
  const hash = typeof matchId === 'string' ? (matchId as `0x${string}`) : matchId
  
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'matchesById',
    args: [hash],
  })
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const stake = (matchId: string, outcome: 1 | 2, amount: string) => {
    // USDC uses 6 decimals, so parse as units (not wei which is 18 decimals)
    // Amount should be in USDC (e.g., "10" = 10 USDC = 10000000 units)
    const amountUnits = parseUnits(amount, 6) // 6 decimals for USDC
    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'stake',
      args: [matchIdBytes32, outcome, amountUnits],
    })
  }

  return {
    stake,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useClaimReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claimReward = (matchId: string) => {
    const matchIdBytes32 = matchId.startsWith('0x') ? matchId as `0x${string}` : `0x${matchId}` as `0x${string}`
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'claimReward',
      args: [matchIdBytes32],
    })
  }

  return {
    claimReward,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

