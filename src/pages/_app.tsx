import '@/styles/globals.css'
import type { AppProps } from 'next/app';
//
// Hacky solution to start the stats collection only on the server
//
if (typeof window === 'undefined') {
  import('@/lib/StatsTracker').then((getTracker) => {
    getTracker.default().run();
  })
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
