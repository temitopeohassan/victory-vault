'use client'

import { useEffect } from 'react'
import { useReadContract, useSendTransaction, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { CONTRACT_ADDRESS, DIVVI_CONSUMER } from './config'
import { formatEther, parseEther, encodeFunctionData } from 'viem'
import { celo } from 'wagmi/chains'
import { getReferralTag, submitReferral } from '@divvi/referral-sdk'

// VictoryVault ABI - matches the deployed contract
// Outcome enum: 0=None, 1=TeamA, 2=TeamB, 3=Draw
const VICTORY_VAULT_ABI = [
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
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'uint8', name: 'outcome', type: 'uint8' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export function useMatchData(matchId: `0x${string}` | string) {
  const hash = typeof matchId === 'string' 
    ? (matchId.startsWith('0x') 
        ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
        : `0x${matchId.padStart(64, '0')}` as `0x${string}`)
    : matchId
  
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VICTORY_VAULT_ABI,
    functionName: 'matchesById',
    args: [hash],
  })
}

export function useStake() {
  const { address, chainId: currentChainId } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Submit referral when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId,
      }).catch((err) => {
        // Log error but don't fail the transaction
        console.warn('Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address, chainId])

  const stake = async (matchId: string, outcome: 1 | 2, amountInCELO: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Ensure we're on Celo chain before sending transaction
    const activeChainId = currentChainId || chainId
    if (activeChainId !== celo.id) {
      try {
        console.log(`Switching from chain ${activeChainId} to Celo (${celo.id})`)
        await switchChain({ chainId: celo.id })
        // Wait a bit for chain switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Verify chain switch was successful
        const newChainId = currentChainId || chainId
        if (newChainId !== celo.id) {
          throw new Error('Failed to switch to Celo network. Please switch manually.')
        }
      } catch (err: any) {
        console.error('Chain switch error:', err)
        if (err?.message?.includes('User rejected')) {
          throw new Error('Please approve the network switch to Celo to continue')
        }
        throw new Error('Please switch to Celo network to stake. The transaction requires CELO, not ETH.')
      }
    }

    // VictoryVault uses native CELO (18 decimals)
    // Amount should be in CELO (e.g., "1" = 1 CELO = 1000000000000000000 wei)
    const amountWei = parseEther(amountInCELO)
    
    // Convert matchId to bytes32 format
    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    // Step 1: Generate referral tag
    const referralTag = getReferralTag({
      user: address,
      consumer: DIVVI_CONSUMER,
    })

    // Step 2: Encode function data
    const functionData = encodeFunctionData({
      abi: VICTORY_VAULT_ABI,
      functionName: 'stake',
      args: [matchIdBytes32, outcome],
    })

    // Step 3: Append referral tag to calldata
    const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

    // Step 4: Send transaction with referral tag in calldata
    // Chain is already switched to Celo above, so transaction will be on Celo
    sendTransaction({
      to: CONTRACT_ADDRESS,
      data: dataWithReferral,
      value: amountWei, // Native CELO value
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
  const { address } = useAccount()
  const chainId = useChainId()
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Submit referral when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId,
      }).catch((err) => {
        // Log error but don't fail the transaction
        console.warn('Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address, chainId])

  const claimReward = async (matchId: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Convert matchId to bytes32 format
    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    // Step 1: Generate referral tag
    const referralTag = getReferralTag({
      user: address,
      consumer: DIVVI_CONSUMER,
    })

    // Step 2: Encode function data
    const functionData = encodeFunctionData({
      abi: VICTORY_VAULT_ABI,
      functionName: 'claimReward',
      args: [matchIdBytes32],
    })

    // Step 3: Append referral tag to calldata
    const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

    // Step 4: Send transaction with referral tag in calldata
    sendTransaction({
      to: CONTRACT_ADDRESS,
      data: dataWithReferral,
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

export function useClaimRefund() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Submit referral when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId,
      }).catch((err) => {
        // Log error but don't fail the transaction
        console.warn('Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address, chainId])

  const claimRefund = async (matchId: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Convert matchId to bytes32 format
    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    // Step 1: Generate referral tag
    const referralTag = getReferralTag({
      user: address,
      consumer: DIVVI_CONSUMER,
    })

    // Step 2: Encode function data
    const functionData = encodeFunctionData({
      abi: VICTORY_VAULT_ABI,
      functionName: 'claimRefund',
      args: [matchIdBytes32],
    })

    // Step 3: Append referral tag to calldata
    const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

    // Step 4: Send transaction with referral tag in calldata
    sendTransaction({
      to: CONTRACT_ADDRESS,
      data: dataWithReferral,
    })
  }

  return {
    claimRefund,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

