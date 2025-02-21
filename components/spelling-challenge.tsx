"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"

// 示例数据 - 实际应用中应该有更多单词
const LEVELS = [
  {
    id: 1,
    words: [
      { chinese: "早上好", portuguese: "bom dia", hint: "b_m d__" },
      { chinese: "晚上", portuguese: "noite", hint: "n__te" },
      { chinese: "谢谢", portuguese: "obrigado", hint: "obr___do" },
      // ... 更多单词
    ],
  },
  // ... 更多关卡
]

export default function SpellingChallenge() {
  const [currentLevel, setCurrentLevel] = useState(0) // 0 表示关卡选择界面
  const [currentWord, setCurrentWord] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [levelStars, setLevelStars] = useState(Array(LEVELS.length).fill('☆☆☆'))

  const handleStartLevel = (level: number) => {
    setCurrentLevel(level)
    setCurrentWord(0)
    setScore(0)
    setUserInput("")
    setShowResult(false)
  }

  const handleSubmit = () => {
    const currentWordData = LEVELS[currentLevel - 1].words[currentWord]
    const isAnswerCorrect = userInput.toLowerCase() === currentWordData.portuguese.toLowerCase()

    setIsCorrect(isAnswerCorrect)
    setShowResult(true)

    if (isAnswerCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      setShowResult(false)
      setUserInput("")
      if (currentWord < LEVELS[currentLevel - 1].words.length - 1) {
        setCurrentWord(currentWord + 1)
      } else {
        // 完成当前关卡
        const accuracy = (score / LEVELS[currentLevel - 1].words.length) * 100
        let stars = '☆☆☆'
        if (accuracy >= 100) {
          stars = '⭐️⭐️⭐️'
        } else if (accuracy >= 90) {
          stars = '⭐️⭐️☆'
        } else if (accuracy >= 80) {
          stars = '⭐️☆☆'
        }

        alert(`关卡完成！你的得分是: ${score}分\n星级评分: ${stars}`)

        setLevelStars(prevStars => {
          const newStars = [...prevStars]
          newStars[currentLevel - 1] = stars
          return newStars
        })

        setCurrentLevel(0)
      }
    }, 1500)
  }

  if (currentLevel === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">拼写队长 ✍️</h2>
          <p className="text-gray-600">
            根据中文意思和提示字母完成单词拼写
            <br />
            每关 25 个单词，共 5 关
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((level) => (
            <Button
              key={level.id}
              onClick={() => handleStartLevel(level.id)}
              className="h-32 text-lg"
              variant="outline" // 默认使用 outline 样式
              disabled={level.id !== 1} // 临时设置只能玩第一关
            >
              <div className="text-center space-y-2">
                <div>第 {level.id} 关</div>
                <div className="text-sm">{levelStars[level.id - 1]}</div>
                {level.id > 1 && <div className="text-sm text-gray-500">完成上一关后解锁</div>}
              </div>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const currentWordData = LEVELS[currentLevel - 1].words[currentWord]
  const progress = (currentWord / LEVELS[currentLevel - 1].words.length) * 100

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
          <span className="text-sm text-gray-500">
            {currentWord + 1} / {LEVELS[currentLevel - 1].words.length}
          </span>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="text-2xl font-medium">{currentWordData.chinese}</div>
            <div className="text-4xl font-mono tracking-wider">{currentWordData.hint}</div>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="输入完整单词..."
              className="text-center text-xl"
              autoFocus
            />
            <Button onClick={handleSubmit} className="w-full" disabled={!userInput.trim()}>
              确认
            </Button>
          </div>

          {showResult && (
            <div className={`text-center text-lg font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}>
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  正确！
                </div>
              ) : (
                <div>错误！正确答案：{currentWordData.portuguese}</div>
              )}
            </div>
          )}
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

