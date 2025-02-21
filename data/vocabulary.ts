import * as XLSX from 'xlsx';

export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  translation: string;
}

// 从Excel文件读取数据的函数
export function loadVocabularyFromExcel(filePath: string): VocabularyItem[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map((row: any) => ({
    word: row['单词'] || row.word,
    partOfSpeech: row['词性'] || row.partOfSpeech,
    translation: row['中文意思'] || row.translation,
  }));
}

// 将词汇按难度分级
export function groupVocabularyByLevel(vocabulary: VocabularyItem[], wordsPerLevel: number = 20) {
  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  const levels = [];
  
  for (let i = 0; i < shuffled.length; i += wordsPerLevel) {
    levels.push(shuffled.slice(i, i + wordsPerLevel));
  }
  
  return levels;
}