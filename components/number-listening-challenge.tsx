"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

type DifficultyLevel = "beginner" | "easy" | "medium" | "hard" | "hell"

// 葡萄牙语数字映射 (欧洲葡萄牙语)
const portugueseNumbers: Record<number, string> = {
  0: "zero",
  1: "um",
  2: "dois",
  3: "três",
  4: "quatro",
  5: "cinco",
  6: "seis",
  7: "sete",
  8: "oito",
  9: "nove",
  10: "dez",
  11: "onze",
  12: "doze",
  13: "treze",
  14: "catorze", // 欧洲葡萄牙语使用 catorze 而非 quatorze
  15: "quinze",
  16: "dezasseis", // 欧洲葡萄牙语使用 dezasseis 而非 dezesseis
  17: "dezassete", // 欧洲葡萄牙语使用 dezassete 而非 dezessete
  18: "dezoito",
  19: "dezanove", // 欧洲葡萄牙语使用 dezanove 而非 dezenove
  20: "vinte",
  30: "trinta",
  40: "quarenta",
  50: "cinquenta",
  60: "sessenta",
  70: "setenta",
  80: "oitenta",
  90: "noventa",
  100: "cem",
  200: "duzentos",
  300: "trezentos",
  400: "quatrocentos",
  500: "quinhentos",
  600: "seiscentos",
  700: "setecentos",
  800: "oitocentos",
  900: "novecentos",
  1000: "mil",
  1000000: "um milhão", // 欧洲葡萄牙语中的一百万
  1000000000: "mil milhões", // 欧洲葡萄牙语中的十亿
}

export default function NumberListeningChallenge() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [userInput, setUserInput] = useState("")
  const [feedback, setFeedback] = useState<string>("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 在客户端渲染时设置标志
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 组件挂载时生成第一个问题
  useEffect(() => {
    if (isClient) {
      generateNewQuestion()
    }
  }, [isClient])

  // 难度变化时重新生成问题
  useEffect(() => {
    if (isClient && currentNumber !== null) {
      generateNewQuestion()
    }
  }, [difficulty, isClient])

  // 如果还在服务端渲染，返回一个占位符
  if (!isClient) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-center">数字主宰</h2>
          <p className="text-center text-gray-500">
            加载中...
          </p>
        </div>
      </div>
    )
  }

  // 生成指定范围内的随机数
  const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 根据难度级别生成数字
  const generateNumberByDifficulty = (): number => {
    switch (difficulty) {
      case "beginner":
        return generateRandomNumber(0, 100)
      case "easy":
        return generateRandomNumber(0, 1000)
      case "medium":
        return generateRandomNumber(0, 10000)
      case "hard":
        return generateRandomNumber(0, 1000000)
      case "hell":
        return generateRandomNumber(0, 10000000000)
      default:
        return generateRandomNumber(0, 100)
    }
  }

  // 将数字转换为葡萄牙语文本 (欧洲葡萄牙语规则)
  const numberToPortuguese = (num: number): string => {
    if (num <= 20 || num === 30 || num === 40 || num === 50 || 
        num === 60 || num === 70 || num === 80 || num === 90) {
      return portugueseNumbers[num]
    }
    
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10
      const ones = num % 10
      return `${portugueseNumbers[tens]} e ${portugueseNumbers[ones]}`
    }
    
    if (num < 1000) {
      const hundreds = Math.floor(num / 100) * 100
      const remainder = num % 100
      
      // 处理100的特殊情况
      if (num === 100) return "cem"
      if (hundreds === 100) {
        if (remainder === 0) return "cem"
        return `cento e ${numberToPortuguese(remainder)}`
      }
      
      if (remainder === 0) return portugueseNumbers[hundreds]
      return `${portugueseNumbers[hundreds]} e ${numberToPortuguese(remainder)}`
    }
    
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000)
      const remainder = num % 1000
      
      // 处理1000的特殊情况
      let thousandText = thousands === 1 ? "mil" : `${numberToPortuguese(thousands)} mil`
      
      if (remainder === 0) return thousandText
      if (remainder < 100) return `${thousandText} e ${numberToPortuguese(remainder)}`
      return `${thousandText} ${numberToPortuguese(remainder)}`
    }
    
    if (num < 1000000000) {
      const millions = Math.floor(num / 1000000)
      const remainder = num % 1000000
      
      let millionText = millions === 1 
        ? "um milhão" 
        : `${numberToPortuguese(millions)} milhões`
      
      if (remainder === 0) return millionText
      if (remainder < 100) return `${millionText} e ${numberToPortuguese(remainder)}`
      return `${millionText} ${numberToPortuguese(remainder)}`
    }
    
    const billions = Math.floor(num / 1000000000)
    const remainder = num % 1000000000
    
    let billionText = billions === 1 
      ? "mil milhões" 
      : `${numberToPortuguese(billions)} mil milhões`
    
    if (remainder === 0) return billionText
    if (remainder < 100) return `${billionText} e ${numberToPortuguese(remainder)}`
    return `${billionText} ${numberToPortuguese(remainder)}`
  }

  // 使用Azure语音服务生成语音
  const speakNumber = (num: number, rate: number = 1) => {
    const text = numberToPortuguese(num)
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      '2b59881623ab4dd1ae1491484f97184e',
      'eastasia'
    )
    
    speechConfig.speechSynthesisVoiceName = 'pt-PT-FernandaNeural'
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
    
    // 使用SSML设置语速
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT">
        <voice name="pt-PT-FernandaNeural">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `
    
    setIsPlaying(true)
    synthesizer.speakSsmlAsync(
      ssml,
      (result: sdk.SpeechSynthesisResult) => {
        setIsPlaying(false)
        synthesizer.close()
      },
      (error: string) => {
        console.error('Speech synthesis error:', error)
        setIsPlaying(false)
        synthesizer.close()
      }
    )
  }

  // 生成新问题
  const generateNewQuestion = () => {
    const newNumber = generateNumberByDifficulty()
    setCurrentNumber(newNumber)
    setUserInput("")
    setFeedback("")
    setIsCorrect(null)
    // 只有在不是第一个问题时才自动朗读
    if (totalAttempts > 0) {
      speakNumber(newNumber, speed)
    }
  }

  // 检查答案
  const checkAnswer = () => {
    if (currentNumber === null) return
    
    const userAnswer = parseInt(userInput.trim())
    const isAnswerCorrect = !isNaN(userAnswer) && userAnswer === currentNumber
    
    setIsCorrect(isAnswerCorrect)
    setTotalAttempts(prev => prev + 1)
    
    if (isAnswerCorrect) {
      setFeedback(`正确！${currentNumber} 的葡萄牙语是 "${numberToPortuguese(currentNumber)}"`)
      setScore(prev => prev + 1)
      setTimeout(generateNewQuestion, 2000)
    } else {
      setFeedback(`错误。正确答案是 ${currentNumber}，葡萄牙语是 "${numberToPortuguese(currentNumber)}"`)
    }
  }

  // 重播当前数字
  const replayNumber = () => {
    if (currentNumber !== null) {
      speakNumber(currentNumber, speed)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-center">🔢 数字主宰</h2>
        <p className="text-center text-gray-500">
          听数字，输入对应的葡萄牙语数字
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* 难度选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">难度级别</label>
            <Select value={difficulty} onValueChange={(value: DifficultyLevel) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择难度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">入门 (0-100)</SelectItem>
                <SelectItem value="easy">简单 (0-1,000)</SelectItem>
                <SelectItem value="medium">中等 (0-10,000)</SelectItem>
                <SelectItem value="hard">困难 (0-1,000,000)</SelectItem>
                <SelectItem value="hell">地狱 (0-10,000,000,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 速度调节 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">播放速度</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1 [&>span:first-child]:bg-gray-100 [&>span:last-child]:bg-gray-100 [&>span:nth-child(2)]:bg-white [&>span:nth-child(2)]:border-0"
              />
              <span className="text-sm text-gray-500">{speed}x</span>
            </div>
          </div>

          {/* 当前分数 */}
          <div className="text-center">
            <p className="text-lg font-medium">当前分数: {score}</p>
            <p className="text-sm text-gray-500">总尝试次数: {totalAttempts}</p>
          </div>

          {/* 播放按钮 */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                if (currentNumber !== null) {
                  speakNumber(currentNumber, speed)
                }
              }}
              disabled={currentNumber === null}
              className="w-full"
            >
              点击收听数字
            </Button>
          </div>

          {/* 输入框 */}
          <div className="space-y-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="输入葡萄牙语数字..."
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkAnswer()
                }
              }}
            />
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={replayNumber}
                disabled={currentNumber === null}
                className="flex-1"
              >
                重新播放
              </Button>
              <Button
                onClick={isCorrect === false ? generateNewQuestion : checkAnswer}
                disabled={!userInput.trim()}
                className="flex-1"
              >
                {isCorrect === false ? "下一题" : "检查答案"}
              </Button>
            </div>
          </div>

          {/* 反馈信息 */}
          {feedback && (
            <div className={`text-center p-4 rounded-lg ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}