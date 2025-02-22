import vocabularyJson from './vocabulary.json'

export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  translation: string;
}
// 将 JSON 数据映射为 VocabularyItem 类型的数组
export const vocabularyList: VocabularyItem[] = vocabularyJson.map(item => ({
  word: item.word,
  partOfSpeech: item.partOfSpeech,
  translation: item.translation,
  portuguese: item.word,
  chinese: item.translation,
}));

// 将词汇按难度分级
export function groupVocabularyByLevel(vocabulary: VocabularyItem[], wordsPerLevel: number = 20) {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  const levels = [];
  
  for (let i = 0; i < shuffled.length; i += wordsPerLevel) {
    levels.push(shuffled.slice(i, i + wordsPerLevel));
  }
  
  return levels;
}