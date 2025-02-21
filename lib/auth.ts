"use server"

import { cookies } from "next/headers"

export async function getUser() {
  const token = cookies().get("user-token")
  if (!token) return null

  // 这里应该调用你的后端 API 验证 token 并返回用户信息
  // 示例实现
  try {
    const response = await fetch("YOUR_API_ENDPOINT/user", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}

