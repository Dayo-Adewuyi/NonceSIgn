'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'; 
import { baseSepolia } from 'wagmi/chains'; 

import { getConfig } from '@/wagmi'

export function Providers(props: {
  children: ReactNode
  initialState?: State
}) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
          apiKey={"9e9830ab-9a3f-4259-b909-686200d9f823"}
          chain={baseSepolia}
          projectId={"544686cc-f912-4754-b951-99cd99aae6ac"}
        >
        {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
