import { ClerkProvider, Show, UserButton } from '@clerk/tanstack-react-start'
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

const fathomSiteId = import.meta.env.VITE_FATHOM_SITE_ID

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
        {fathomSiteId && (
          <script src="https://cdn.usefathom.com/script.js" data-site={fathomSiteId}
            data-spa="history" defer />
        )}
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
      </body>
    </html>
  )
}
