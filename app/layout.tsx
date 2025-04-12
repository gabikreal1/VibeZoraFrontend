import type { Metadata } from 'next'
import './globals.css'
import { WagmiProvider } from '@/components/wagmi-provider'

export const metadata: Metadata = {
  title: 'Vibe-Zora',
  description: 'Creations with Sora SDK',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log("RootLayout rendering...");
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  )
}
