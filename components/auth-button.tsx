"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WechatIcon } from "./icons"

export function AuthButton() {
  const [showDialog, setShowDialog] = useState(false)

  const handleWechatLogin = async () => {
    // 实现微信登录逻辑
    // 1. 调用微信登录 API
    // 2. 获取授权码
    // 3. 发送到后端验证
    // 4. 获取用户信息和 token
    window.location.href = "/api/auth/wechat"
  }

  return (
    <>
      <Button
        variant="outline"
        className="text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-100"
        onClick={() => setShowDialog(true)}
      >
        登录
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">登录账号</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Button variant="outline" className="w-full max-w-xs h-12 gap-2" onClick={handleWechatLogin}>
              <WechatIcon className="w-5 h-5" />
              微信登录
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

