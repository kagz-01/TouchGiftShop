"use client";

import { useState } from "react";
import {
  TASTE_QUESTIONS,
  saveTasteProfile,
  getTasteProfile,
  type TasteProfile,
} from "@/lib/taste-profile";

type TasteQuizProps = {
  recipientName: string;
  onComplete: (profile: TasteProfile) => void;
  onCancel?: () => void;
};

type Step = "name" | "style" | "interests" | "priceRange" | "colorPrefs" | "avoid" | "done";

export default function TasteQuiz({ recipientName, onComplete, onCancel }: TasteQuizProps) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState(recipientName);
  const [answers, setAnswers] = useState<Record<string, string[]>>({
    style: [],
    interests: [],
    priceRange: [],
    colorPrefs: [],
    avoid: [],
  });

  const currentQuestion = TASTE_QUESTIONS.find((q) => q.id === step);
  const stepIndex = TASTE_QUESTIONS.findIndex((q) => q.id === step);
  const progress = step === "name" ? 0 : ((stepIndex + 1) / TASTE_QUESTIONS.length) * 100;

  function handleToggle(questionId: string, value: string, type: "single" | "multi") {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === "single") {
        return { ...prev, [questionId]: [value] };
      }
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter((v) => v !== value) };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
  }

  function handleNext() {
    if (step === "name") {
      if (!name.trim()) return;
      setStep("style");
      return;
    }

    const steps: Step[] = ["style", "interests", "priceRange", "colorPrefs", "avoid"];
    const currentIndex = steps.indexOf(step);

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      // Build profile
      const profile: TasteProfile = {
        recipientName: name.trim(),
        style: answers.style || [],
        interests: answers.interests || [],
        priceRange: (answers.priceRange[0] as TasteProfile["priceRange"]) || "mid",
        colorPrefs: answers.colorPrefs || [],
        avoidCategories: answers.avoid?.filter((a) => a !== "none") || [],
        notes: "",
        lastUpdated: new Date().toISOString(),
      };

      saveTasteProfile(profile);
      setStep("done");
      onComplete(profile);
    }
  }

  function handleBack() {
    const steps: Step[] = ["name", "style", "interests", "priceRange", "colorPrefs", "avoid"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }

  // Done view
  if (step === "done") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Profile Created!</h3>
        <p className="mt-1 text-sm text-gray-500">
          We now know {name}&apos;s taste. Gifts will be tailored to their preferences.
        </p>
      </div>
    );
  }

  // Name step
  if (step === "name") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Taste Quiz</h3>
          {onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Answer a few quick questions and we&apos;ll remember their taste forever.
        </p>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Recipient&apos;s Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mama Wanjiku"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          Start Quiz →
        </button>
      </div>
    );
  }

  // Question steps
  if (!currentQuestion) return null;

  const selectedValues = answers[step] || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>Question {stepIndex + 1} of {TASTE_QUESTIONS.length}</span>
          <span>{name}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        {currentQuestion.question}
      </h3>

      {/* Options */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(step, option.value, currentQuestion.type)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
              {isSelected && (
                <span className="ml-auto text-purple-500">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={handleBack}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestion.type === "single" && selectedValues.length === 0}
          className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {step === "avoid" ? "Save Profile" : "Next →"}
        </button>
      </div>
    </div>
  );
}
