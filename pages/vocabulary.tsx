import { useRouter } from 'next/router'
import React from 'react'
import VocabularyChallenge from '../components/vocabulary-challenge'

export default function VocabularyPage() {
  const router = useRouter()

  return <VocabularyChallenge />
}