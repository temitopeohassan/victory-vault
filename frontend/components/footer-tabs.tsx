"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, Trophy, User } from "lucide-react"

export function FooterTabs() {
  const pathname = usePathname()

  const tabs = [
    { href: "/", label: "Markets", icon: Home },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/leaderboard", label: "Top Pundits", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-screen-sm grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={
                "flex flex-col items-center justify-center py-2 text-xs " +
                (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}


