"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import SpellingChallenge from "./spelling-challenge"
import VocabularyChallenge from "./vocabulary-challenge"
import StoryChallenge from "./story-challenge"
import ConjugationChallenge from "./conjugation-challenge"
import localFont from 'next/font/local'

const sourceHanSans = localFont({
  src: '../public/fonts/SourceHanSansCN-Heavy.otf',
  variable: '--font-source-han-sans'
})

export default function PortugueseLearning() {
  const [activeTab, setActiveTab] = useState("vocabulary")

  return (
    <div className={`min-h-screen flex flex-col bg-background ${sourceHanSans.variable}`}>
      {/* 顶部导航栏 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-1">
              {/* Logo */}
              <Image 
                src="/fala-logo.png" 
                alt="Fala Logo" 
                width={48} 
                height={48}
                className="rounded-full"
              />
              <h1 className={`text-2xl text-[#2546FB] mr-10 ${sourceHanSans.className} whitespace-nowrap`}>
                光明的葡萄牙语
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: "vocabulary", name: "词汇大师" },
                  { id: "spelling", name: "拼写队长" },
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
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 移动端导航 */}
      <div className="md:hidden border-b bg-background">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {[
            { id: "vocabulary", name: "词汇大师" },
            { id: "spelling", name: "拼写队长" },
            { id: "stories", name: "故事大王" },
            { id: "conjugation", name: "变位之神" },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 whitespace-nowrap ${
                activeTab === item.id ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        {activeTab === "vocabulary" && <VocabularyChallenge />}
        {activeTab === "spelling" && <SpellingChallenge />}
        {activeTab === "stories" && <StoryChallenge />}
        {activeTab === "conjugation" && <ConjugationChallenge />}
      </main>
    </div>
  )
}

