import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ReportProvider } from '@/context/reports'
import { CommentProvider } from '@/context/comments'
import { UserProvider } from '@/context/users'
import customTheme from '@/customTheme'
import '@/components/common/DatePicker/style.css'
import { SWRConfig } from 'swr'

const theme = extendTheme(customTheme)

function App({ Component, pageProps, err }) {
  const router = useRouter()

  useEffect(() => {
    Fathom.load(process.env.NEXT_PUBLIC_FATHOM_TRACKING_CODE)

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router])

  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <ReportProvider>
          <CommentProvider>
            <SWRConfig
              value={{
                fetcher: (...args) => fetch(...args).then((res) => res.json()),
              }}
            >
              {/* Workaround for https://github.com/vercel/next.js/issues/8592 */}
              <Component {...pageProps} err={err} />
            </SWRConfig>
          </CommentProvider>
        </ReportProvider>
      </UserProvider>
    </ChakraProvider>
  )
}

export default App
