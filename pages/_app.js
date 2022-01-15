import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import customTheme from '@/customTheme'
import '@/components/common/DatePicker/style.css'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

const theme = extendTheme(customTheme)

function App({ Component, pageProps, err }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  )
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
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ChakraProvider theme={theme}>
          {/* Workaround for https://github.com/vercel/next.js/issues/8592 */}
          <Component {...pageProps} err={err} />
        </ChakraProvider>
      </Hydrate>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
