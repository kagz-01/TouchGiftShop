"use client";

import { useState, useRef, useCallback } from "react";

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
};

export default function VoiceInput({ onTranscript, onError, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (disabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-KE"; // Kenya English

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        onError?.("No speech detected. Please try again.");
      } else if (event.error === "audio-capture") {
        onError?.("No microphone found. Please check your settings.");
      } else if (event.error === "not-allowed") {
        onError?.("Microphone access denied. Please allow microphone access.");
      } else {
        onError?.("Voice input error. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [disabled, onTranscript, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          isListening
            ? "bg-red-500 text-white shadow-lg animate-pulse"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } disabled:opacity-50`}
      >
        <svg
          className={`h-5 w-5 ${isListening ? "text-white" : "text-gray-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
        {isListening ? "Listening..." : "Voice Search"}
      </button>

      {/* Live transcript */}
      {isListening && transcript && (
        <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-lg border border-gray-100">
          <p className="text-xs text-gray-400">You said:</p>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
}
