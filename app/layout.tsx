import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import Image from 'next/image';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "光明的葡萄牙语",
  description: "一起快乐学葡语吧！",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        {children}
      </body>
    </html>
  )
}



import './globals.css'