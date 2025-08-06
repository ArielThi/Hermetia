import { Toaster } from "@/components/ui/toaster"; // <-- se agrega aquí
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import type React from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hermetia Vitalis",
  description: "Sistema de monitoreo para incubadoras de Hermetia illucens"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/Logo.svg" type="image/svg+xml" />
      </head>
      <body className={GeistSans.className}>
        {children}
        <Toaster /> {/* <-- se añade aquí para mostrar notificaciones */}
      </body>
    </html>
  )
}