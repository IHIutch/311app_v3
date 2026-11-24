import { ClerkProvider, Show, UserButton } from '@clerk/tanstack-react-start'
import { HeadContent, Link, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { load, trackPageview } from 'fathom-client'
import { useEffect, useRef } from 'react'

import appCss from '../styles.css?url'

const fathomSiteId = import.meta.env.VITE_FATHOM_SITE_ID

function FathomAnalytics({ siteId }: { siteId: string }) {
  const pathname = useLocation({ select: (location) => location.pathname })
  const lastPathname = useRef<string | undefined>(undefined)

  useEffect(() => {
    load(siteId, { auto: false })
  }, [siteId])

  useEffect(() => {
    if (lastPathname.current === pathname) return
    lastPathname.current = pathname
    trackPageview({ url: pathname, referrer: document.referrer })
  }, [pathname])

  return null
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Buffalo 311',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <nav aria-label="Main navigation">
            <Link to="/">Buffalo 311</Link>
            <Link to="/create">Open a report</Link>
            <Show when="signed-out">
              <Link to="/sign-in">Sign in</Link>
              <Link to="/register">Sign up</Link>
            </Show>
            <Show when="signed-in">
              <Link to="/profile">Profile</Link>
              <UserButton />
            </Show>
          </nav>
          {children}
        </ClerkProvider>

        <Scripts />
        {fathomSiteId && <FathomAnalytics siteId={fathomSiteId} />}
      </body>
    </html>
  )
}
