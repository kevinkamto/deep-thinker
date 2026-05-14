import type { Metadata } from "next"
import { JetBrains_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "Deep Thinker",
  description: "AI-powered deep research agent - parallel web search, synthesis, live streaming",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} ${playfairDisplay.variable}`}>
      <body>{children}</body>
    </html>
  )
}
