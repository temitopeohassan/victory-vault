'use client'

import { useEffect, useState } from 'react'
import { useReadContract, useSendTransaction, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { getAccount } from 'wagmi/actions'
import { CONTRACT_ADDRESS, DIVVI_CONSUMER } from './config'
import { parseEther, encodeFunctionData } from 'viem'
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
    chainId: celo.id, // CRITICAL: Force Celo chain for reads
  })
}

export function useStake() {
  const { address, chainId: currentChainId, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { sendTransaction, data: hash, isPending: isSending, error: sendError, reset } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  const [customError, setCustomError] = useState<Error | null>(null)
  const error = customError || sendError

  // Submit referral when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId: celo.id, // Always use Celo chain ID
      }).catch((err) => {
        console.warn('[useStake] Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address])

  const stake = async (matchId: string, outcome: 1 | 2, amountInCELO: string) => {
    // Reset errors
    setCustomError(null)
    reset()
    
    if (!address) {
      const err = new Error('Wallet not connected')
      setCustomError(err)
      throw err
    }

    // Get the current chain ID
    const account = getAccount()
    const activeChainId = account.chainId || currentChainId || chainId || chain?.id
    
    console.log('[useStake] Starting stake transaction:', {
      activeChainId,
      celoChainId: celo.id,
      isOnCelo: activeChainId === celo.id,
      address,
      matchId,
      outcome,
      amountInCELO
    })
    
    // CRITICAL: Ensure we're on Celo chain before sending transaction
    if (activeChainId !== celo.id) {
      console.warn(`[useStake] Wrong chain. Current: ${activeChainId}, Required: ${celo.id} (Celo)`)
      
      if (!switchChain) {
        const err = new Error(
          'Your wallet does not support network switching. ' +
          'Please manually switch to Celo network in your wallet settings.'
        )
        setCustomError(err)
        throw err
      }

      try {
        console.log(`[useStake] Switching from chain ${activeChainId} to Celo (${celo.id})`)
        
        await switchChain({ chainId: celo.id })
        
        // Wait for chain switch with timeout
        const startTime = Date.now()
        const maxWaitTime = 10000 // 10 seconds
        let switched = false
        
        while (Date.now() - startTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const updatedAccount = getAccount()
          const latestChainId = updatedAccount.chainId
          
          if (latestChainId === celo.id) {
            console.log('[useStake] Successfully switched to Celo')
            switched = true
            break
          }
        }
        
        if (!switched) {
          const finalAccount = getAccount()
          const finalChainId = finalAccount.chainId
          
          if (finalChainId !== celo.id) {
            const err = new Error(
              `Network switch timeout. Please manually switch to Celo network. ` +
              `Current: chain ${finalChainId || activeChainId}, Required: Celo (${celo.id})`
            )
            setCustomError(err)
            throw err
          }
        }
        
        // Wait a bit more to ensure wallet is ready
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (err: any) {
        console.error('[useStake] Chain switch error:', err)
        
        if (err.message?.includes('User rejected') || 
            err.message?.includes('rejected') || 
            err.message?.includes('denied')) {
          const error = new Error(
            'You rejected the network switch. ' +
            'Please manually switch to Celo network in your wallet and try again.'
          )
          setCustomError(error)
          throw error
        }
        
        if (err instanceof Error && err.message.includes('manually switch')) {
          throw err // Re-throw our custom error
        }
        
        const error = new Error(
          'Failed to switch to Celo network. ' +
          'Please manually switch to Celo in your wallet settings.'
        )
        setCustomError(error)
        throw error
      }
    }
    
    // Final verification before sending
    const preSendAccount = getAccount()
    const preSendChainId = preSendAccount.chainId
    
    console.log('[useStake] Pre-send verification:', {
      preSendChainId,
      celoChainId: celo.id,
      isCorrectChain: preSendChainId === celo.id
    })
    
    if (preSendChainId !== celo.id) {
      const err = new Error(
        `Transaction blocked: Wallet is on chain ${preSendChainId}, but Celo (${celo.id}) is required. ` +
        'Please ensure your wallet is on Celo network.'
      )
      setCustomError(err)
      throw err
    }

    try {
      // Parse amount to wei
      const amountWei = parseEther(amountInCELO)
      
      // Convert matchId to bytes32
      const matchIdBytes32 = matchId.startsWith('0x') 
        ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
        : `0x${matchId.padStart(64, '0')}` as `0x${string}`
      
      console.log('[useStake] Preparing transaction:', {
        matchIdBytes32,
        outcome,
        amountInCELO,
        amountWei: amountWei.toString(),
        contractAddress: CONTRACT_ADDRESS,
        chainId: celo.id
      })
      
      // Generate referral tag
      const referralTag = getReferralTag({
        user: address,
        consumer: DIVVI_CONSUMER,
      })

      // Encode function data
      const functionData = encodeFunctionData({
        abi: VICTORY_VAULT_ABI,
        functionName: 'stake',
        args: [matchIdBytes32, outcome],
      })

      // Append referral tag
      const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

      console.log('[useStake] Sending transaction on Celo:', {
        to: CONTRACT_ADDRESS,
        value: amountWei.toString(),
        chainId: celo.id
      })

      // CRITICAL: Explicitly specify chainId in sendTransaction
      sendTransaction({
        to: CONTRACT_ADDRESS,
        data: dataWithReferral,
        value: amountWei,
        chainId: celo.id, // CRITICAL: Force Celo chain
      })
      
      console.log('[useStake] Transaction sent')
    } catch (err: any) {
      console.error('[useStake] Transaction preparation error:', err)
      const error = new Error(err.message || 'Failed to prepare transaction')
      setCustomError(error)
      throw error
    }
  }

  return {
    stake,
    isPending: isSending || isConfirming || isSwitching,
    isSuccess,
    error,
    hash,
  }
}

export function useClaimReward() {
  const { address } = useAccount()
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId: celo.id,
      }).catch((err) => {
        console.warn('[useClaimReward] Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address])

  const claimReward = async (matchId: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    const referralTag = getReferralTag({
      user: address,
      consumer: DIVVI_CONSUMER,
    })

    const functionData = encodeFunctionData({
      abi: VICTORY_VAULT_ABI,
      functionName: 'claimReward',
      args: [matchIdBytes32],
    })

    const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

    // CRITICAL: Specify chainId
    sendTransaction({
      to: CONTRACT_ADDRESS,
      data: dataWithReferral,
      chainId: celo.id,
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
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess && hash && address) {
      submitReferral({
        txHash: hash,
        chainId: celo.id,
      }).catch((err) => {
        console.warn('[useClaimRefund] Failed to submit referral:', err)
      })
    }
  }, [isSuccess, hash, address])

  const claimRefund = async (matchId: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    const matchIdBytes32 = matchId.startsWith('0x') 
      ? (matchId.length === 66 ? matchId as `0x${string}` : `0x${matchId.slice(2).padStart(64, '0')}` as `0x${string}`)
      : `0x${matchId.padStart(64, '0')}` as `0x${string}`
    
    const referralTag = getReferralTag({
      user: address,
      consumer: DIVVI_CONSUMER,
    })

    const functionData = encodeFunctionData({
      abi: VICTORY_VAULT_ABI,
      functionName: 'claimRefund',
      args: [matchIdBytes32],
    })

    const dataWithReferral = (functionData + referralTag.slice(2)) as `0x${string}`

    // CRITICAL: Specify chainId
    sendTransaction({
      to: CONTRACT_ADDRESS,
      data: dataWithReferral,
      chainId: celo.id,
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