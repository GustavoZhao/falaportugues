"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { VocabularyItem, groupVocabularyByLevel } from "@/data/vocabulary"
import vocabularyData from '@/data/vocabulary.json'

// 修改 LEVELS 的定义
interface Level {
  id: number;
  words: VocabularyItem[];
  challenges: Challenge[];
}

interface Challenge {
  type: "pt-to-cn" | "cn-to-pt";
  word: string;
  partOfSpeech: string;
  options: string[];
  correct: string;
}

// 生成选项的辅助函数
function generateOptions(correct: string, allWords: VocabularyItem[]): string[] {
  const options = [correct];
  const otherTranslations = allWords
    .filter(item => item.translation !== correct)
    .map(item => item.translation);
  
  // 随机选择3个错误选项
  while (options.length < 4 && otherTranslations.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherTranslations.length);
    options.push(otherTranslations[randomIndex]);
    otherTranslations.splice(randomIndex, 1);
  }
  
  return options.sort(() => Math.random() - 0.5);
}

// 生成关卡数据
function generateLevels(vocabulary: VocabularyItem[][]): Level[] {
  return vocabulary.map((words, index) => ({
    id: index + 1,
    words,
    challenges: words.map(word => ({
      type: Math.random() > 0.5 ? "pt-to-cn" : "cn-to-pt",
      word: word.word,
      partOfSpeech: word.partOfSpeech,
      options: generateOptions(word.translation, words),
      correct: word.translation,
    })),
  }));
}

export default function VocabularyChallenge() {
  const [levels, setLevels] = useState<Level[]>([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 修改数据加载逻辑
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // 使用JSON数据
        const vocabulary = vocabularyData // 直接使用 vocabularyData
        const groupedVocabulary = groupVocabularyByLevel(vocabulary)
        const generatedLevels = generateLevels(groupedVocabulary)
        setLevels(generatedLevels)
        console.log("Levels loaded:", generatedLevels)
      } catch (error) {
        console.error('Failed to load vocabulary:', error)
        // 添加测试数据作为后备
        const testLevels: Level[] = [
          {
            id: 1,
            words: [],
            challenges: [
              {
                type: "pt-to-cn",
                word: "测试单词",
                partOfSpeech: "n.",
                options: ["选项1", "选项2", "选项3", "选项4"],
                correct: "选项1"
              }
            ]
          }
        ]
        setLevels(testLevels)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 添加调试日志
  console.log("Current state:", { levels, currentLevel, isLoading })

  const handleStartLevel = (level: number) => {
    console.log('Starting level:', level) // 添加调试日志
    if (levels.length === 0) {
      console.error('No levels data available')
      return
    }
    
    if (level < 1 || level > levels.length) {
      console.error('Invalid level number:', level)
      return
    }

    setCurrentLevel(level)
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  const handleAnswer = (answer: string) => {
    const currentQuestionData = levels[currentLevel - 1].challenges[currentQuestion]
    const isCorrect = answer === currentQuestionData.correct

    setSelectedAnswer(answer)
    setShowResult(true)

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      if (currentQuestion < levels[currentLevel - 1].challenges.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // 完成当前关卡
        setCurrentLevel(0)
      }
    }, 1500)
  }

  if (isLoading) {
    return <div className="text-center">加载中...</div>
  }

  if (currentLevel === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">词汇大师 📚</h2>
          <p className="text-gray-600">
            挑战你的词汇量！
            <br />
            每关 20 个单词，共 {levels.length} 关
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.max(1, levels.length) }).map((_, index) => (
            <Button
              key={index}
              onClick={() => handleStartLevel(index + 1)}
              className="h-32 text-lg"
              variant={index === 0 ? "default" : "outline"}
              disabled={index !== 0}
            >
              <div className="text-center space-y-2">
                <Star className="w-6 h-6 mx-auto" />
                <div>第 {index + 1} 关</div>
                {index > 0 && <div className="text-sm text-gray-500">需完成上一关</div>}
              </div>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // 添加安全检查
  const currentLevelData = levels[currentLevel - 1]
  if (!currentLevelData) {
    return <div className="text-center">关卡数据加载错误</div>
  }

  const currentQuestionData = currentLevelData.challenges[currentQuestion]
  if (!currentQuestionData) {
    return <div className="text-center">题目数据加载错误</div>
  }

  const progress = (currentQuestion / currentLevelData.challenges.length) * 100

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

        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="text-2xl font-medium mb-6">{currentQuestionData.word}</div>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestionData.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  variant="outline"
                  className={`h-20 text-base font-normal break-words ${
                    showResult
                      ? option === currentQuestionData.correct
                        ? "bg-green-100 border-green-500"
                        : option === selectedAnswer
                          ? "bg-red-100 border-red-500"
                          : ""
                      : ""
                  }`}
                  disabled={showResult}
                >
                  <span className="px-2 py-1">{option}</span>
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

