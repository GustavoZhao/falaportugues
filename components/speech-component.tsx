"use client"

import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { useEffect, useRef } from 'react'

interface SpeechComponentProps {
  text: string
  language: 'pt-PT' | 'zh-CN'
}

export default function SpeechComponent({ text, language }: SpeechComponentProps) {
  const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);

  useEffect(() => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      '2b59881623ab4dd1ae1491484f97184e',
      'eastasia'
    );

    speechConfig.speechSynthesisVoiceName = 
      language === 'pt-PT' ? 'pt-PT-FernandaNeural' : 'zh-CN-XiaoxiaoNeural';

    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizerRef.current = synthesizer;

    const speakText = async () => {
      try {
        await new Promise((resolve, reject) => {
          synthesizer.speakTextAsync(
            text,
            result => {
              resolve(result);
              synthesizer.close();
            },
            error => {
              console.error('Speech synthesis error:', error);
              reject(error);
              synthesizer.close();
            }
          );
        });
      } catch (error) {
        console.error('Speech synthesis error:', error);
      }
    };

    speakText();

    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
    };
  }, [text, language]);

  return null;
} 