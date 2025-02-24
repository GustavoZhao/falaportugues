"use client"

import { useEffect, useState } from 'react'

export function ThirdPartyComponent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  // 组件的其余部分
} 