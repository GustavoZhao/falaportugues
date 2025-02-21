"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { vocabularyList } from "@/data/vocabulary"
import type { VocabularyWord, GameMode } from "@/lib/types"
import { useRouter } from 'next/navigation'

export default function VocabularyChallenge() {
  const router = useRouter()
  const TOTAL_QUESTIONS = 20
  const POINTS_PER_QUESTION = 10
  const TOTAL_LEVELS = 35
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [gameMode, setGameMode] = useState<GameMode>("PT_TO_CN")
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [levelStars, setLevelStars] = useState(() => {
    const savedProgress = localStorage.getItem('vocabularyProgress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      return progress.levelStars || Array(TOTAL_LEVELS).fill('☆☆☆')
    }
    return Array(TOTAL_LEVELS).fill('☆☆☆')
  })
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set())

  // 加载游戏进度
  useEffect(() => {
    const savedProgress = localStorage.getItem('vocabularyProgress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setTotalScore(progress.totalScore)
      setCurrentLevel(progress.currentLevel)
      setLevelStars(progress.levelStars || Array(TOTAL_LEVELS).fill('☆☆☆'))
      setUsedWords(new Set(progress.usedWords || []))
      setCorrectWords(new Set(progress.correctWords || []))
    }
  }, [])

  // 保存游戏进度
  const saveProgress = () => {
    const progress = {
      totalScore,
      currentLevel,
      levelStars,
      usedWords: Array.from(usedWords),
      correctWords: Array.from(correctWords)
    }
    localStorage.setItem('vocabularyProgress', JSON.stringify(progress))
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

  // 生成新的题目
  const generateNewQuestion = () => {
    const newGameMode = Math.random() < 0.5 ? "PT_TO_CN" : "CN_TO_PT"
    setGameMode(newGameMode)

    // 优先使用答错过的单词，如果没有答错的单词才使用新单词
    const wrongWords = vocabularyList.filter(word => 
      usedWords.has(word.portuguese) && !correctWords.has(word.portuguese)
    )
    const newWords = vocabularyList.filter(word => !usedWords.has(word.portuguese))
    const availableWords = wrongWords.length > 0 ? wrongWords : newWords

    // 随机选择一个单词
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    const word = availableWords[randomIndex]
    setCurrentWord(word)

    // 生成选项（包括正确答案）
    const correctAnswer = newGameMode === "PT_TO_CN" ? word.chinese : word.portuguese
    const otherOptions = availableWords
      .filter(w => w.portuguese !== word.portuguese)
      .map(w => newGameMode === "PT_TO_CN" ? w.chinese : w.portuguese)
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
      ? currentWord?.chinese 
      : currentWord?.portuguese

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
        newCorrectWords.add(currentWord!.portuguese);
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
          newUsedWords.add(currentWord!.portuguese);
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
          <h2 className="text-2xl font-bold">词汇大师 📚</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm" style={{width: 'fit-content', fontSize: '0.5rem', borderRadius: '20px', position: 'relative', top: '5%', transform: 'translateY(-100%)'}}>
            <div className="text-lg font-semibold">当前总分：{totalScore}</div>
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
    <div className="space-y-8 max-w-2xl mx-auto p-4 relative">
      {/* 返回按钮 */}
      <button 
        onClick={returnToLevels}
        className="absolute top-4 left-4 bg-gray-200 p-2 rounded"
      >
        返回
      </button>

      <div className="text-center space-y-2">
        <div className="text-2xl font-bold mb-2">
          {gameMode === "PT_TO_CN" ? currentWord.portuguese : currentWord.chinese}
        </div>
        <div className="text-gray-500">
          {currentWord.partOfSpeech} {/* 总是显示词性 */}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleOptionClick(option)}
            variant="outline"
            className={`h-20 text-lg ${
              showResult
                ? option === (gameMode === "PT_TO_CN" ? currentWord.chinese : currentWord.portuguese)
                  ? "bg-green-100 border-green-500"
                  : option === selectedAnswer
                    ? "bg-red-100 border-red-500"
                    : ""
                : "hover:bg-gray-100"
            }`}
            disabled={showResult}
          >
            {option}
          </Button>
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
  )
}

