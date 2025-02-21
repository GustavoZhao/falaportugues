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

