"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

// 示例数据
const LEVELS = [
  {
    id: 1,
    sentences: [
      {
        chinese: "我每天早上喝咖啡。",
        words: ["café", "manhã", "tomo", "toda", "de"],
        correct: "tomo café toda de manhã",
      },
      // ... 更多句子
    ],
  },
  // ... 更多关卡
]

export default function StoryChallenge() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const handleStartLevel = (level: number) => {
    setCurrentLevel(level)
    setCurrentSentence(0)
    setScore(0)
    setShowResult(false)
    setSelectedWords([])
    setAvailableWords(LEVELS[level - 1].sentences[0].words.sort(() => Math.random() - 0.5))
  }

  const handleWordSelect = (word: string) => {
    setSelectedWords([...selectedWords, word])
    setAvailableWords(availableWords.filter((w) => w !== word))
  }

  const handleWordRemove = (index: number) => {
    const word = selectedWords[index]
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
    setAvailableWords([...availableWords, word])
  }

  const handleCheck = () => {
    const currentSentenceData = LEVELS[currentLevel - 1].sentences[currentSentence]
    const isCorrect = selectedWords.join(" ") === currentSentenceData.correct

    setShowResult(true)

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      setShowResult(false)
      if (currentSentence < LEVELS[currentLevel - 1].sentences.length - 1) {
        setCurrentSentence(currentSentence + 1)
        setSelectedWords([])
        setAvailableWords(LEVELS[currentLevel - 1].sentences[currentSentence + 1].words.sort(() => Math.random() - 0.5))
      } else {
        // 完成当前关卡
        setCurrentLevel(0)
      }
    }, 2000)
  }

  if (currentLevel === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">故事大王 📖</h2>
          <p className="text-gray-600">
            组织单词，完成句子！
            <br />
            每关 20 个句子，共 5 关
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

  const currentSentenceData = LEVELS[currentLevel - 1].sentences[currentSentence]
  const progress = (currentSentence / LEVELS[currentLevel - 1].sentences.length) * 100

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
          <div className="text-sm text-gray-500">得分：{score}</div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="text-2xl font-medium mb-6">{currentSentenceData.chinese}</div>

            {/* 已选择的单词 */}
            <div className="min-h-[60px] p-4 border rounded-lg mb-4 flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <Button key={index} variant="secondary" className="h-8" onClick={() => handleWordRemove(index)}>
                  {word}
                </Button>
              ))}
            </div>

            {/* 可选择的单词 */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {availableWords.map((word, index) => (
                <Button key={index} variant="outline" className="h-8" onClick={() => handleWordSelect(word)}>
                  {word}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleCheck}
              className="w-32"
              disabled={selectedWords.length !== currentSentenceData.words.length}
            >
              检查
            </Button>
          </div>

          {showResult && (
            <div
              className={`text-center text-lg font-medium ${
                selectedWords.join(" ") === currentSentenceData.correct ? "text-green-500" : "text-red-500"
              }`}
            >
              {selectedWords.join(" ") === currentSentenceData.correct ? (
                "正确！"
              ) : (
                <div>
                  <div>错误！</div>
                  <div className="text-base mt-2">正确答案：{currentSentenceData.correct}</div>
                </div>
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

