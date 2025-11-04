"use client";

import { useEffect, useImperativeHandle, forwardRef, useRef, useState } from "react";

export interface VoiceServiceRef {
  isConnected: boolean;
  startCall: () => void;
  endCall: () => void;
  speak: (text: string) => void;
}

interface VoiceServiceProps {
  onTranscription?: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
  currentCode?: string;
  currentQuestion?: string;
  company?: string;
}

const VoiceService = forwardRef<VoiceServiceRef, VoiceServiceProps>((props, ref) => {
  const {
    onTranscription,
    onSpeechStart,
    onSpeechEnd,
    onError,
    currentCode,
    currentQuestion,
    company
  } = props;

  const [isConnected, setIsConnected] = useState(false);
  const vapiRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      // Try to use Web Speech API for recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');

          if (onTranscription) {
            onTranscription(transcript);
          }
        };

        recognitionRef.current.onstart = () => {
          if (onSpeechStart) onSpeechStart();
        };

        recognitionRef.current.onend = () => {
          if (onSpeechEnd) onSpeechEnd();
          // Auto-restart if still connected
          if (isConnected) {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (onError) {
            onError(`Speech recognition error: ${event.error}`);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startCall = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsConnected(true);
        speak("Voice interview started. I'm ready to help you. What would you like to do?");
      } else {
        if (onError) {
          onError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
        }
      }
    } catch (e: any) {
      if (onError) {
        onError(`Failed to start voice interview: ${e.message}`);
      }
    }
  };

  const endCall = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsConnected(false);
      speak("Voice interview ended. Good luck with your preparation!");
    } catch (e: any) {
      if (onError) {
        onError(`Failed to end voice interview: ${e.message}`);
      }
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      synthRef.current.speak(utterance);
    }
  };

  useImperativeHandle(ref, () => ({
    isConnected,
    startCall,
    endCall,
    speak,
  }));

  return null; // This is a service component, no UI
});

VoiceService.displayName = "VoiceService";

export default VoiceService;
