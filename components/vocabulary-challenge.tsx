"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { vocabularyList } from "@/data/vocabulary"
import type { VocabularyItem, GameMode } from "@/lib/types"
import { useRouter } from 'next/navigation'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import Link from 'next/link'

export default function VocabularyChallenge() {
  const router = useRouter()
  const TOTAL_QUESTIONS = 20
  const POINTS_PER_QUESTION = 10
  const TOTAL_LEVELS = 35
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [gameMode, setGameMode] = useState<GameMode>("PT_TO_CN")
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [levelStars, setLevelStars] = useState<string[]>(Array(TOTAL_LEVELS).fill('☆☆☆'))
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set())

  // 初始化语音合成配置
  const speechConfig = sdk.SpeechConfig.fromSubscription('2b59881623ab4dd1ae1491484f97184e', 'eastasia')
  speechConfig.speechSynthesisVoiceName = 'pt-PT-RaquelNeural' // 默认葡萄牙语

  // 初始化中文语音配置
  const chineseSpeechConfig = sdk.SpeechConfig.fromSubscription('2b59881623ab4dd1ae1491484f97184e', 'eastasia')
  chineseSpeechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural' // 中文普通话

  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()

  // 加载游戏进度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('vocabularyProgress')
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setTotalScore(progress.totalScore)
        setCurrentLevel(progress.currentLevel)
        setLevelStars(progress.levelStars || Array(TOTAL_LEVELS).fill('☆☆☆'))
        setUsedWords(new Set(progress.usedWords || []))
        setCorrectWords(new Set(progress.correctWords || []))
      }
    }
  }, [])

  // 保存游戏进度
  const saveProgress = () => {
    if (typeof window !== 'undefined') {
      const progress = {
        totalScore,
        currentLevel,
        levelStars,
        usedWords: Array.from(usedWords),
        correctWords: Array.from(correctWords)
      }
      localStorage.setItem('vocabularyProgress', JSON.stringify(progress))
    }
  }

  // 开始游戏
  const startLevel = (level: number) => {
    setCurrentLevel(level)
    setIsPlaying(true)
    setScore(0)
    setQuestionCount(0)
    setCorrectStreak(0)
    generateNewQuestion()
  }

  // 返回关卡选择
  const returnToLevels = () => {
    if (window.location.pathname === '/vocabulary') {
      router.push('/')
    } else {
      setIsPlaying(false)
    }
  }

  // 朗读单词
  const speakWord = (word: VocabularyItem, mode: "PT_TO_CN" | "CN_TO_PT") => {
    if (mode === "PT_TO_CN") {
      // PT_TO_CN 模式：显示葡语题目，朗读葡语
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
      synthesizer.speakTextAsync(word.word, result => {
        if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
          console.error('Error synthesizing speech:', result.errorDetails)
        }
        synthesizer.close()
      })
    } else {
      // CN_TO_PT 模式：显示中文题目，朗读中文
      const synthesizer = new sdk.SpeechSynthesizer(chineseSpeechConfig, audioConfig)
      synthesizer.speakTextAsync(word.chinese, result => {
        if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
          console.error('Error synthesizing speech:', result.errorDetails)
        }
        synthesizer.close()
      })
    }
  }

  // 生成新的题目
  const generateNewQuestion = () => {
    const newGameMode = Math.random() < 0.5 ? "PT_TO_CN" : "CN_TO_PT"
    setGameMode(newGameMode)

    const wrongWords = vocabularyList.filter(word => 
      usedWords.has(word.word) && !correctWords.has(word.word)
    )
    const newWords = vocabularyList.filter(word => !usedWords.has(word.word))
    const availableWords = wrongWords.length > 0 ? wrongWords : newWords

    const randomIndex = Math.floor(Math.random() * availableWords.length)
    const word = availableWords[randomIndex]
    setCurrentWord(word as VocabularyItem)

    // 确保朗读的语言与显示的题目语言一致
    setTimeout(() => {
      speakWord(word as VocabularyItem, newGameMode)
    }, 100)

    // 生成选项（包括正确答案）
    const correctAnswer = newGameMode === "PT_TO_CN" ? word.translation : word.word
    const otherOptions = availableWords
      .filter(w => w.word !== word.word)
      .map(w => newGameMode === "PT_TO_CN" ? w.translation : w.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    // 随机插入正确答案
    const allOptions = [...otherOptions, correctAnswer]
    setOptions(allOptions.sort(() => Math.random() - 0.5))
    
    // 重置状态
    setShowResult(false)
    setSelectedAnswer(null)
  }

  // 处理答案选择
  const handleOptionClick = (selectedOption: string) => {
    if (showResult) return

    const correctAnswer = gameMode === "PT_TO_CN" 
      ? currentWord?.translation 
      : currentWord?.word

    setSelectedAnswer(selectedOption)
    setShowResult(true)

    if (selectedOption === correctAnswer) {
      // 正确回答时增加得分
      const pointsEarned = POINTS_PER_QUESTION; // 每题的得分
      setScore(prevScore => prevScore + pointsEarned);
      setTotalScore(prevTotal => prevTotal + pointsEarned); // 更新总分
      setCorrectStreak(correctStreak + 1);
      
      // 记录正确答对的单词
      setCorrectWords(prev => {
        const newCorrectWords = new Set(prev);
        newCorrectWords.add(currentWord!.word);
        return newCorrectWords;
      });
    } else {
      setCorrectStreak(0);
    }

    setQuestionCount(prev => prev + 1);

    // 显示庆祝特效
    if (correctStreak + 1 === 3 || correctStreak + 1 === 5) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        if (correctStreak + 1 === 5) {
          setCorrectStreak(0); // 重置连续答对计数
        }
      }, 1000); // 1秒后隐藏特效
    }

    // 延迟显示下一题
    setTimeout(() => {
      if (questionCount < TOTAL_QUESTIONS - 1) {
        generateNewQuestion();
      } else {
        // 处理游戏结束逻辑
        const accuracy = (score / (TOTAL_QUESTIONS * POINTS_PER_QUESTION)) * 100;
        let stars = '☆☆☆';
        if (accuracy >= 95) {
          stars = '⭐️⭐️⭐️';
        } else if (accuracy >= 90) {
          stars = '⭐️⭐️☆';
        } else if (accuracy >= 80) {
          stars = '⭐️☆☆';
        }

        alert(`关卡完成！你的得分是: ${score + (selectedOption === correctAnswer ? POINTS_PER_QUESTION : 0)}分\n星级评分: ${stars}`);
        
        // 更新星级评分
        setLevelStars((prevStars: string[]) => {
          const newStars = [...prevStars];
          newStars[currentLevel - 1] = stars;
          return newStars;
        });

        // 记录已使用的单词
        setUsedWords(prevUsedWords => {
          const newUsedWords = new Set(prevUsedWords);
          newUsedWords.add(currentWord!.word);
          return newUsedWords;
        });

        saveProgress();

        // 显示完成动画
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          setIsPlaying(false);
          setCurrentLevel(prev => prev + 1);
        }, 700); // 0.7秒后隐藏特效
      }
    }, 1500);
  }

  // 只在开始游戏时初始化题目
  useEffect(() => {
    if (isPlaying && !currentWord) {
      generateNewQuestion()
    }
  }, [isPlaying, currentWord])

  if (!isPlaying) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto px-4">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <h2 className="text-2xl font-bold">词汇大师 📚</h2>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                <div className="text-lg font-semibold whitespace-nowrap">总分：{totalScore}</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            挑战你的词汇量！
            <br />
            每关 {TOTAL_QUESTIONS} 个单词，共 {TOTAL_LEVELS} 关，答对率达到 95% 可获得三星！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: TOTAL_LEVELS }).map((_, index) => (
            <Button
              key={index}
              onClick={() => startLevel(index + 1)}
              className="h-32 text-lg"
              variant="outline"
              disabled={index > 0 && totalScore < index * TOTAL_QUESTIONS * POINTS_PER_QUESTION}
            >
              <div className="text-center space-y-2">
                <div>第 {index + 1} 关</div>
                <div className="text-sm">{levelStars[index] || '☆☆☆'}</div>
                {index > 0 && totalScore < index * TOTAL_QUESTIONS * POINTS_PER_QUESTION && (
                  <div className="text-sm text-gray-500">完成上一关后解锁</div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (!currentWord) return <div className="text-center">加载中...</div>

  const progress = (questionCount / TOTAL_QUESTIONS) * 100

  return (
    <div className="relative w-full h-full">
      <button 
        onClick={() => {
          if (window.location.pathname === '/vocabulary') {
            router.push('/')
          } else {
            setIsPlaying(false)
          }
        }}
        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg text-gray-600"
      >
        🔙 Voltar
      </button>

      <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-4 pt-16">
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold mb-2">
            {gameMode === "PT_TO_CN" ? currentWord.word : currentWord.translation}
          </div>
          <div className="text-gray-500">
            {currentWord.partOfSpeech} {/* 总是显示词性 */}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`
                p-4 rounded-lg text-lg font-semibold
                transition-colors duration-200
                outline-none
                ${
                  selectedAnswer === option
                    ? showResult
                      ? (gameMode === "PT_TO_CN" 
                          ? option === currentWord.translation 
                          : option === currentWord.word)
                        ? 'bg-[#FADE4B]' // 正确答案使用黄色高亮
                        : 'bg-red-500 text-white' // 错误答案保持红色
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                }
              `}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="text-center text-xl font-semibold">
          得分: {score} | 总得分: {totalScore}
        </div>

        {/* 撒花特效 */}
        {showCelebration && correctStreak >= 3 && correctStreak < 5 && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="text-4xl text-yellow-500 animate-bounce">🎉</div>
          </div>
        )}

        {/* 闪电特效 */}
        {showCelebration && correctStreak >= 5 && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="text-4xl text-blue-500 animate-pulse">Incrível ⚡</div>
          </div>
        )}

        {/* 进度条 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto space-y-2">
            <Progress 
              value={progress} 
              className="w-full h-2 bg-gray-100" 
              indicatorClassName="bg-blue-500"
            />
            <div className="text-center text-sm text-gray-500">
              进度：{questionCount} / {TOTAL_QUESTIONS}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

