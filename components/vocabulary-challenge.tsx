"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { vocabularyList } from "@/data/vocabulary"
import type { VocabularyItem, GameMode, Difficulty } from "@/lib/types"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './VocabularyChallenge.module.css'
import dynamic from 'next/dynamic'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

// 动态导入使用浏览器 API 的组件
const SpeechComponent = dynamic(
  () => import('./speech-component'),
  { ssr: false } // 禁用服务器端渲染
)

// 修改 getFilteredVocabularyList 函数
const getFilteredVocabularyList = (
  difficulty: Difficulty, 
  level: number,
  vocabularyList: VocabularyItem[],
  usedWords: Set<string>,
  correctWords: Set<string>
) => {
  // 直接根据难度筛选单词，不再根据关卡范围筛选
  return vocabularyList.filter(word => 
    word.difficulty === difficulty && !usedWords.has(word.word)
  );
};

// 安全的存储函数
const safeLocalStorage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage 不可用:', e)
      return null
    }
  },
  
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('localStorage 不可用:', e)
    }
  }
}

// 修改存储键名以包含难度
const getStorageKey = (difficulty: Difficulty) => `vocabularyProgress_${difficulty}`

// 定义 Props 类型
interface VocabularyChallengeProps {
  // 不再需要 selectedDifficulty
}

export default function VocabularyChallenge() {
  const router = useRouter()
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("A2"); // 默认难度
  const TOTAL_QUESTIONS = 20
  const POINTS_PER_QUESTION = 10
  const TOTAL_LEVELS = 35
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<number>(1)
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
  const [levelStars, setLevelStars] = useState<{ [key in Difficulty]: string }>({
    "A1": '✩✩✩',
    "A2": '✩✩✩',
    "B1": '✩✩✩',
    "B2": '✩✩✩',
    "C1": '✩✩✩',
    "C2": '✩✩✩'
  })
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set())
  const [currentLevelWords, setCurrentLevelWords] = useState<Set<string>>(new Set())
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [isLevelComplete, setIsLevelComplete] = useState(false)
  const [view, setView] = useState<'difficulty' | 'levels' | 'game'>('difficulty')
  const [levelProgress, setLevelProgress] = useState<{ [key in Difficulty]: number[] }>({
    "A1": [],
    "A2": [],
    "B1": [],
    "B2": [],
    "C1": [],
    "C2": []
  })
  const [showBalloons, setShowBalloons] = useState(false)
  const [showLightning, setShowLightning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [isReviewMode, setIsReviewMode] = useState(false)

  // 将 randomRef 移到组件的顶层
  const randomRef = useRef(Math.random());

  useEffect(() => {
    randomRef.current = Math.random(); // 仅在客户端生成随机数
  }, []);

  useEffect(() => {
    // 从本地存储加载进度
    const loadProgress = () => {
      const savedProgress = localStorage.getItem('vocabularyProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setTotalScore(progress.totalScore || 0);
        setCurrentLevel(progress.currentLevel || 1);
        setLevelStars(progress.levelStars || {
          "A1": '✩✩✩',
          "A2": '✩✩✩',
          "B1": '✩✩✩',
          "B2": '✩✩✩',
          "C1": '✩✩✩',
          "C2": '✩✩✩'
        });
        setUsedWords(new Set(progress.usedWords || []));
        setCorrectWords(new Set(progress.correctWords || []));
        
        // 加载特定难度的进度
        setLevelProgress(prev => ({
          ...prev,
          [selectedDifficulty]: progress.levelProgress[selectedDifficulty] || []
        }));
      } else {
        // 重置状态
        setTotalScore(0);
        setCurrentLevel(1);
        setLevelStars({
          "A1": '✩✩✩',
          "A2": '✩✩✩',
          "B1": '✩✩✩',
          "B2": '✩✩✩',
          "C1": '✩✩✩',
          "C2": '✩✩✩'
        });
        setUsedWords(new Set());
        setCorrectWords(new Set());
        setLevelProgress({
          "A1": [],
          "A2": [],
          "B1": [],
          "B2": [],
          "C1": [],
          "C2": []
        });
      }
    };
    loadProgress();
  }, []);

  // 修改保存进度函数
  const saveProgress = () => {
    // 直接使用 localStorage，不需要检查 window 对象
    const progressData = {
        totalScore,
        currentLevel,
        levelStars,
        usedWords: Array.from(usedWords),
        correctWords: Array.from(correctWords),
        levelProgress: levelProgress[selectedDifficulty] // 只保存当前难度的进度
    };
    localStorage.setItem(getStorageKey(selectedDifficulty), JSON.stringify(progressData));
    safeLocalStorage.set(getStorageKey(selectedDifficulty), JSON.stringify(progressData));
  }

  // 开始游戏
  const startLevel = (level: number) => {
    setCurrentLevel(level);
    setScore(0);
    setQuestionCount(0);
    setCurrentLevelWords(new Set());
    generateNewQuestion(); // 确保在这里调用生成新题目
  }

  // 返回关卡选择
  const returnToLevels = () => {
    if (window.location.pathname === '/vocabulary') {
      router.push('/')
    } else {
      setIsPlaying(false)
    }
  }

  // 添加一个播放声音的函数
  const playSound = (text: string, language: 'pt-PT' | 'zh-CN') => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      '2b59881623ab4dd1ae1491484f97184e',
      'eastasia'
    );
    speechConfig.speechSynthesisVoiceName = 
      language === 'pt-PT' ? 'pt-PT-FernandaNeural' : 'zh-CN-XiaoxiaoNeural';
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
    synthesizer.speakTextAsync(
      text,
      result => {
        synthesizer.close();
      },
      error => {
        console.error('Speech synthesis error:', error);
        synthesizer.close();
      }
    );
  };

  // 修改 generateNewQuestion 函数
  const generateNewQuestion = async () => {
    const newGameMode = randomRef.current < 0.5 ? "PT_TO_CN" : "CN_TO_PT"; 

    // 使用传递的难度
    const filteredList = getFilteredVocabularyList(
      selectedDifficulty,
      currentLevel,
      vocabularyList as VocabularyItem[],
      usedWords,
      correctWords
    );

    const availableWords = filteredList.filter(word => !currentLevelWords.has(word.word));

    if (availableWords.length === 0) {
        console.warn('所有单词都已使用过，重新开始');
        setCurrentLevelWords(new Set());
        return; // 不再递归调用
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[randomIndex];

    if (!word) {
        console.warn('无法获取单词，重新生成问题');
        return; // 不再递归调用
    }

    const correctAnswer = newGameMode === "PT_TO_CN" ? word.translation : word.word; 
    const otherOptions = filteredList
        .filter(w => !currentLevelWords.has(w.word) && w.word !== word.word)
        .map(w => newGameMode === "PT_TO_CN" ? w.translation : w.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const allOptions = [...otherOptions, correctAnswer].sort();

    setGameMode(newGameMode);
    setCurrentWord(word as VocabularyItem);
    setOptions(allOptions);
    setShowResult(false);
    setSelectedAnswer(null);
    
    // 如果是葡萄牙语到中文的模式，自动播放葡萄牙语读音
    if (newGameMode === "PT_TO_CN") {
      playSound(word.word, 'pt-PT');
    }

    setCurrentLevelWords(prev => {
        const newSet = new Set(prev);
        newSet.add(word.word);
        return newSet;
    });
  }

  // 处理答案选择
  const handleOptionClick = (selectedOption: string) => {
    if (showResult) return;

    const correctAnswer = gameMode === "PT_TO_CN" 
      ? currentWord?.translation || ''
      : currentWord?.word || '';

    setSelectedAnswer(selectedOption);
    setShowResult(true);
    setCorrectAnswer(correctAnswer);

    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);

    if (selectedOption === correctAnswer) {
      const pointsEarned = POINTS_PER_QUESTION;
      setScore(prevScore => prevScore + pointsEarned);
      setTotalScore(prevTotal => prevTotal + pointsEarned);
      
      // 更新连击计数
      const newStreakCount = (correctStreak + 1) % 10;
      setStreakCount(newStreakCount);
      setCorrectStreak(correctStreak + 1);

      // 处理特效
      if (newStreakCount === 3) {
        setShowBalloons(true);
        setTimeout(() => setShowBalloons(false), 2000);
      }

      if (newStreakCount === 5) {
        setShowLightning(true);
        setTimeout(() => setShowLightning(false), 2000);
      }

      if (newStreakCount === 0) { // 达到10连击
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      setCorrectWords(prev => {
        const newCorrectWords = new Set(prev);
        newCorrectWords.add(currentWord!.word);
        return newCorrectWords;
      });
    } else {
      setCorrectStreak(0);
      setStreakCount(0);
    }

    // 检查是否完成关卡
    if (newQuestionCount >= TOTAL_QUESTIONS) {
      const accuracy = (score / (TOTAL_QUESTIONS * POINTS_PER_QUESTION)) * 100;
      
      // 计算星级
      let stars = '⭐️';  // 默认一星
      if (accuracy >= 95) stars = '⭐⭐⭐';
      else if (accuracy >= 90) stars = '⭐⭐';
      else if (accuracy >= 80) stars = '⭐';

      // 处理得分逻辑
      if (score === 200) {
        stars = '⭐️⭐️⭐️'; // 确保得分200时显示三颗星
      }

      // 更新特定难度的星级
      setLevelStars(prev => ({
        ...prev,
        [selectedDifficulty]: stars
      }));

      // 保存关卡进度
      const savedProgress = localStorage.getItem('vocabularyProgress') || '{}';
      const progress = JSON.parse(savedProgress);
      progress.levelProgress = progress.levelProgress || {};
      progress.levelProgress[selectedDifficulty] = progress.levelProgress[selectedDifficulty] || [];
      if (!progress.levelProgress[selectedDifficulty].includes(currentLevel - 1)) {
        progress.levelProgress[selectedDifficulty].push(currentLevel - 1);
      }
      progress.levelStars = progress.levelStars || {};
      progress.levelStars[selectedDifficulty] = stars;
      localStorage.setItem('vocabularyProgress', JSON.stringify(progress));

      setIsLevelComplete(true);
      return; // 直接返回，不生成新题目
    }

    // 只有在未完成关卡时才生成新题目
    setTimeout(() => {
      generateNewQuestion();
    }, selectedOption === correctAnswer ? 500 : 1000);
  }

  // 只在开始游戏时初始化题目
  useEffect(() => {
    if (isPlaying && !currentWord) {
        generateNewQuestion(); // 确保在游戏开始时生成新问题
    }
  }, [isPlaying, currentWord]);

  useEffect(() => {
    if (showBalloons) {
      // 显示气球的逻辑
    }
  }, [showBalloons]);

  useEffect(() => {
    if (showLightning) {
      // 显示闪电的逻辑
    }
  }, [showLightning]);

  // 难度选择界面
  const DifficultySelection = () => {
    const difficulties = ["A2", "B1", "B2", "C1", "C2"];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">👑 词汇大师</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {difficulties.map((difficulty) => {
            // 获取当前难度的完成进度
            const completedLevels = levelProgress[difficulty as Difficulty]?.length || 0;
            const totalLevels = (() => {
              switch (difficulty) {
                case "A2": return 4;
                case "B1": return 15;
                case "B2": return 20;
                case "C1": return 10;
                case "C2": return 6;
                default: return 0;
              }
            })();
            
            return (
              <button
                key={difficulty}
                onClick={() => {
                  setSelectedDifficulty(difficulty as Difficulty);
                  setView('levels');
                }}
                className="p-6 rounded-lg text-center bg-white border-2 border-blue-500 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-2xl font-bold mb-2">{difficulty}</div>
                <div className="text-sm text-gray-600">
                  已完成 {completedLevels}/{totalLevels} 关
                </div>
                {completedLevels > 0 && (
                  <div className="mt-2 text-sm text-blue-500">
                    继续挑战
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 关卡选择界面
  const LevelSelection = () => {
    // 根据不同难度设置关卡数量
    const getLevelCount = (difficulty: Difficulty) => {
      switch (difficulty) {
        case "A2": return 4;
        case "B1": return 15;
        case "B2": return 20;
        case "C1": return 10;
        case "C2": return 6;
        default: return 0;
      }
    };

    const levelCount = getLevelCount(selectedDifficulty);
    const levels = Array(levelCount).fill(selectedDifficulty);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView('difficulty')}
            className="text-blue-500 hover:text-blue-600"
          >
            ← 返回难度选择
          </button>
          <h1 className="text-2xl font-bold text-center">{selectedDifficulty} 级别</h1>
          <div className="w-20"></div> {/* 占位，保持标题居中 */}
        </div>
        
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {levels.map((_, index) => {
            const isUnlocked = index === 0 || levelProgress[selectedDifficulty]?.includes(index - 1);
            const isCompleted = levelProgress[selectedDifficulty]?.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => {
                  if (isUnlocked) {
                    setCurrentLevel(index + 1);
                    setView('game');
                    setIsPlaying(true);
                    startLevel(index + 1);
                  }
                }}
                className={`
                  p-4 rounded-lg text-center
                  ${isUnlocked 
                    ? isCompleted
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-white border-2 border-blue-500 hover:shadow-lg'
                    : 'bg-gray-100 cursor-not-allowed'}
                  transition-shadow duration-200
                `}
              >
                <div className="text-lg font-bold">关卡 {index + 1}</div>
                {isCompleted && (
                  <div className="text-sm text-green-600">
                    {levelStars[selectedDifficulty]}
                  </div>
                )}
                {!isUnlocked && (
                  <div className="text-sm text-gray-500">
                    🔒 未解锁
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 游戏界面
  const GameView = () => {
    if (!currentWord) return <div className="text-center">加载中...</div>;

    const progress = (questionCount / TOTAL_QUESTIONS) * 100

    return (
      <div className="relative w-full h-full">
        <button 
          onClick={() => {
            setView('levels');
            setIsPlaying(false);
          }}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          🔙 返回关卡选择
        </button>

        <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-4 pt-16">
          <div className="text-xl font-bold mb-4">
            第{currentLevel}关
          </div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl font-bold mb-2">
                {gameMode === "PT_TO_CN" ? currentWord.word : currentWord.translation}
              </div>
              <button
                onClick={() => {
                  const language = gameMode === "PT_TO_CN" ? "pt-PT" : "zh-CN";
                  const textToSpeak = gameMode === "PT_TO_CN" ? currentWord.word : currentWord.chinese;
                  // 创建一个新的 SpeechComponent 实例
                  const speechConfig = sdk.SpeechConfig.fromSubscription(
                    '2b59881623ab4dd1ae1491484f97184e',
                    'eastasia'
                  );
                  speechConfig.speechSynthesisVoiceName = 
                    language === 'pt-PT' ? 'pt-PT-FernandaNeural' : 'zh-CN-XiaoxiaoNeural';
                  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
                  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
                  
                  synthesizer.speakTextAsync(
                    textToSpeak,
                    result => {
                      synthesizer.close();
                    },
                    error => {
                      console.error('Speech synthesis error:', error);
                      synthesizer.close();
                    }
                  );
                }}
                className="text-2xl hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="朗读单词"
              >
                👂
              </button>
            </div>
            <div className="text-gray-500 flex items-center justify-center gap-2">
              <span>{currentWord?.partOfSpeech}</span>
              <span className="border px-2 py-0.5 text-sm rounded">
                {currentWord?.difficulty}
              </span>
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
                    showResult && option === correctAnswer && selectedAnswer !== correctAnswer
                      ? 'bg-white border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' // 答错时正确答案显示蓝色光效果
                      : selectedAnswer === option
                        ? showResult
                          ? selectedAnswer === correctAnswer
                            ? 'bg-[#FADE4B]' // 答对时显示黄色高亮
                            : 'bg-red-500 text-white' // 错误答案显示红色
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

          {/* Excelente! 气球特效 */}
          {showBalloons && (
            <div className={styles.balloonContainer}>
              <div className={styles.excellentText}>
                Excelente!
              </div>
              <div className={styles.balloon}>🎈</div>
              <div className={styles.balloon}>🎈</div>
              <div className={styles.balloon}>🎈</div>
            </div>
          )}

          {/* Incrível! 闪电特效 */}
          {showLightning && (
            <div className={styles.lightningContainer}>
              <div className={styles.incredibleText}>
                Incrível!
              </div>
              <div className={styles.lightning}>⚡️</div>
              <div className={styles.lightning}>⚡️</div>
              <div className={styles.lightning}>⚡️</div>
              <div className={styles.lightning}>⚡️</div>
              <div className={styles.lightning}>⚡️</div>
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

          {isLevelComplete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[200]">
              <div className="bg-white p-6 rounded-lg text-center">
                {score >= TOTAL_QUESTIONS * POINTS_PER_QUESTION * 0.7 ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">
                      🎉 恭喜你完成了第{currentLevel}关！
                    </h2>
                    <p className="mb-2">得分: {score}</p>
                    <p className="mb-4">星级: {levelStars[selectedDifficulty].replace(/✩/g, '')}</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => {
                          setView('levels');
                          setIsPlaying(false);
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        返回
                      </button>
                      <button
                        onClick={() => handleNextLevel()}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        下一关
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4">
                      需要复习一下 🤔
                    </h2>
                    <p className="mb-4">
                      来复习一下刚刚做错的题目吧！
                      <br />
                      正确率需要达到70%才能进入下一关。
                    </p>
                    <button
                      onClick={() => {
                        // 筛选出本关错误的题目
                        const wrongWords = Array.from(currentLevelWords).filter(
                          word => !correctWords.has(word)
                        );
                        
                        // 重置关卡状态
                        setQuestionCount(0);
                        setScore(0);
                        setIsLevelComplete(false);
                        setCurrentLevelWords(new Set(wrongWords));
                        setIsReviewMode(true);
                        
                        // 生成新的复习题目
                        generateNewQuestion();
                      }}
                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      开始复习
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Espetacular! 礼花特效 */}
          {showConfetti && (
            <div className={styles.confettiContainer}>
              <div className={styles.spectacularText}>
                Espetacular!
              </div>
              {Array(10).fill('🎉').map((emoji, index) => (
                <div key={index} className={styles.confetti}>
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 修改按钮点击处理函数
  const handleNextLevel = () => {
    // 更新关卡进度，确保按顺序解锁
    setLevelProgress(prev => {
      const newProgress = { ...prev };
      const currentProgress = newProgress[selectedDifficulty] || [];
      
      // 获取最小未解锁关卡
      for (let i = 0; i < currentLevel; i++) {
        if (!currentProgress.includes(i)) {
          currentProgress.push(i);
        }
      }
      
      newProgress[selectedDifficulty] = currentProgress; // 更新特定难度的进度

      // 保存到本地存储
      const savedProgress = localStorage.getItem('vocabularyProgress') || '{}';
      const progress = JSON.parse(savedProgress);
      progress.levelProgress = newProgress;
      localStorage.setItem('vocabularyProgress', JSON.stringify(progress));
      
      return newProgress;
    });

    setCurrentLevel(prev => prev + 1);
    setQuestionCount(0);
    setScore(0);
    setIsLevelComplete(false);
    
    setTimeout(() => {
      generateNewQuestion();
    }, 300);
  };

  // 难度选择处理函数
  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  // 根据当前视图渲染对应的界面
  switch (view) {
    case 'difficulty':
      return <DifficultySelection />;
    case 'levels':
      return <LevelSelection />;
    case 'game':
      return <GameView />;
    default:
      return <DifficultySelection />;
  }

  return (
    <div suppressHydrationWarning>
      {/* 难度选择按钮 */}
      <div>
        {["A1", "A2", "B1", "B2", "C1", "C2"].map((difficulty) => (
          <Button key={difficulty} onClick={() => handleDifficultyChange(difficulty as Difficulty)}>
            {difficulty}
          </Button>
        ))}
      </div>

      {/* 游戏逻辑 */}
      {isPlaying && (
        <div>
          {/* 游戏内容 */}
        </div>
      )}
    </div>
  );
}

