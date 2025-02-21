"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import SpellingChallenge from "./components/spelling-challenge"
import VocabularyChallenge from "./components/vocabulary-challenge"
import StoryChallenge from "./components/story-challenge"
import ConjugationChallenge from "./components/conjugation-challenge"

export default function PortugueseLearning() {
  const [activeTab, setActiveTab] = useState("spelling")

  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      {/* 顶部导航栏 */}
      <header className="border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-4">
              {/* Logo 预留位置 */}
              <div className="w-12 h-12 rounded overflow-hidden bg-white/10">
                {/* 替换为实际的 Logo */}
                <div className="w-full h-full bg-gray-200/20" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                光明的葡萄牙语
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: "spelling", name: "拼写队长" },
                  { id: "vocabulary", name: "词汇大师" },
                  { id: "stories", name: "故事大王" },
                  { id: "conjugation", name: "变位之神" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 ${
                      activeTab === item.id
                        ? "bg-primary text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </Button>
                ))}
              </nav>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* 移动端导航 */}
      <div className="md:hidden border-b border-white/10 bg-background">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {[
            { id: "spelling", name: "拼写队长" },
            { id: "vocabulary", name: "词汇大师" },
            { id: "stories", name: "故事大王" },
            { id: "conjugation", name: "变位之神" },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 whitespace-nowrap ${
                activeTab === item.id ? "bg-primary text-white" : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        {activeTab === "spelling" && <SpellingChallenge />}
        {activeTab === "vocabulary" && <VocabularyChallenge />}
        {activeTab === "stories" && <StoryChallenge />}
        {activeTab === "conjugation" && <ConjugationChallenge />}
      </main>
    </div>
  )
}

