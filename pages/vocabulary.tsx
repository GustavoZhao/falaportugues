import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import VocabularyChallenge from '../components/vocabulary-challenge'

export default function VocabularyPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 仅在客户端执行
      const data = localStorage.getItem('myData');
      // 处理数据
    }
  }, []);

  return <VocabularyChallenge />
}