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

export interface VocabularyWord {
  portuguese: string;
  chinese: string;
  partOfSpeech: string; // 词性，如 "n." "v." "adj." 等
}

export type GameMode = "PT_TO_CN" | "CN_TO_PT"; // PT = 葡萄牙语, CN = 中文

