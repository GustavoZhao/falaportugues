"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

// 示例数据
const LEVELS = [
  {
    id: 1,
    verbs: [
      {
        infinitive: "ser",
        sentence: "Ele ___ professor.",
        options: ["é", "são", "sou", "és"],
        correct: "é",
      },
      // ... 更多动词
    ],
  },
  // ... 更多关卡
]

export default function ConjugationChallenge() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentVerb, setCurrentVerb] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const handleStartLevel = (level: number) => {
    setCurrentLevel(level)
    setCurrentVerb(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const handleAnswer = (answer: string) => {
    const currentVerbData = LEVELS[currentLevel - 1].verbs[currentVerb]
    const isCorrect = answer === currentVerbData.correct

    setSelectedAnswer(answer)
    setShowResult(true)

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      if (currentVerb < LEVELS[currentLevel - 1].verbs.length - 1) {
        setCurrentVerb(currentVerb + 1)
      } else {
        // 完成当前关卡
        setCurrentLevel(0)
      }
    }, 1500)
  }

  if (currentLevel === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">变位之神 🎯</h2>
          <p className="text-gray-600">
            选择正确的动词变位！
            <br />
            每关 20 个动词，共 5 关
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              onClick={() => handleStartLevel(level)}
              className="h-32 text-lg"
              variant={level === 1 ? "default" : "outline"}
              disabled={level !== 1} // 临时设置只能玩第一关
            >
              <div className="text-center space-y-2">
                <Star className="w-6 h-6 mx-auto" />
                <div>第 {level} 关</div>
                {level > 1 && <div className="text-sm text-gray-500">需完成上一关</div>}
              </div>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const currentVerbData = LEVELS[currentLevel - 1].verbs[currentVerb]
  const progress = (currentVerb / LEVELS[currentLevel - 1].verbs.length) * 100

  return (
    <div className="relative min-h-full">
      {/* 得分显示 */}
      <div className="absolute top-0 right-0 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="text-lg font-semibold">得分：{score}</div>
      </div>

      {/* 原有内容 */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">第 {currentLevel} 关</h3>
          <div className="flex items-center justify-center gap-4"></div>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="text-xl text-gray-500">动词原形：{currentVerbData.infinitive}</div>
            <div className="text-2xl font-medium">{currentVerbData.sentence}</div>

            <div className="grid grid-cols-2 gap-4">
              {currentVerbData.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  variant="outline"
                  className={`h-16 text-lg ${
                    showResult
                      ? option === currentVerbData.correct
                        ? "bg-green-100 border-green-500"
                        : option === selectedAnswer
                          ? "bg-red-100 border-red-500"
                          : ""
                      : ""
                  }`}
                  disabled={showResult}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部进度条 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="text-center text-sm text-gray-500">完成进度：{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  )
}

