
import './globals.css'
import '@coinbase/onchainkit/styles.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { type ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'
import { getConfig } from '../wagmi'
import { Providers } from './providers'




export const metadata: Metadata = {
  title: "NonceSign",
  description: "NonceSign",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get('cookie'),
  )
  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  )
}
