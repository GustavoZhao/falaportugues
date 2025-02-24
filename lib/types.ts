export type User = {
  id: string
  name: string
  avatar: string
  progress: {
    spelling: {
      currentLevel: number
      completedLevels: number[]
      scores: Record<number, number>
    }
    vocabulary: {
      currentLevel: number
      completedLevels: number[]
      scores: Record<number, number>
    }
    stories: {
      currentLevel: number
      completedLevels: number[]
      scores: Record<number, number>
    }
    conjugation: {
      currentLevel: number
      completedLevels: number[]
      scores: Record<number, number>
    }
  }
}

export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  translation: string;
  portuguese: string;
  chinese: string;
  difficulty?: Difficulty;
}

export type GameMode = "PT_TO_CN" | "CN_TO_PT"; // PT = 葡萄牙语, CN = 中文

// 定义难度类型
export type Difficulty = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

