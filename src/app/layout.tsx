import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "leaflet/dist/leaflet.css"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ResQNet - Intelligent Disaster Response",
  description: "Finding Who Needs Help Most",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
