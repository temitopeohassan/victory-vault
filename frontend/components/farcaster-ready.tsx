"use client"

import { useEffect } from "react"

// Call actions.ready() ASAP after first paint, per Farcaster docs
// https://miniapps.farcaster.xyz/docs/guides/loading
export function FarcasterReady() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const callReady = async () => {
      try {
        // Prefer the injected farcaster object if present
        const fc = (window as any).farcaster
        const injectedActions = fc?.actions
        if (injectedActions?.ready) {
          await injectedActions.ready()
          return
        }

        // Fallback: dynamic import and attempt to locate actions on the module/default
        const mod: any = await import("@farcaster/miniapp-sdk").catch(() => null)
        const maybeActions = mod?.actions || mod?.default?.actions
        if (maybeActions?.ready) {
          await maybeActions.ready()
        }
      } catch {
        // Ignore when not running inside Farcaster
      }
    }

    // Defer one frame to avoid reflow/jitter
    requestAnimationFrame(() => {
      void callReady()
    })
  }, [])

  return null
}


