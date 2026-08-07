"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRecommendation, type QuizAnswer } from "@/lib/gift-quiz";

type QuizOption = {
  value: string;
  label: string;
  emoji: string;
  description?: string;
};

type QuizStep = {
  id: string;
  question: string;
  emoji: string;
  multiple?: boolean;
  options: QuizOption[];
};

const STEPS: QuizStep[] = [
  {
    id: "recipient",
    question: "Who are you gifting?",
    emoji: "🎁",
    options: [
      { value: "her", label: "For Her", emoji: "👩", description: "Girlfriend, wife, sister, or mum" },
      { value: "him", label: "For Him", emoji: "👨", description: "Boyfriend, husband, brother, or dad" },
      { value: "couple", label: "A Couple", emoji: "👫", description: "Wedding, anniversary, or housewarming" },
      { value: "parents", label: "Parents", emoji: "👴👵", description: "Mum, dad, or grandparents" },
      { value: "child", label: "A Child", emoji: "🧒", description: "Niece, nephew, or your own" },
      { value: "baby", label: "A Baby", emoji: "👶", description: "Newborn or baby shower" },
      { value: "colleague", label: "Colleague", emoji: "👔", description: "Boss, coworker, or employee" },
      { value: "friend", label: "Friend", emoji: "🤝", description: "Bestie, classmate, or neighbour" },
    ],
  },
  {
    id: "occasion",
    question: "What's the occasion?",
    emoji: "📅",
    options: [
      { value: "birthday", label: "Birthday", emoji: "🎂" },
      { value: "wedding", label: "Wedding", emoji: "💒" },
      { value: "anniversary", label: "Anniversary", emoji: "💍" },
      { value: "baby-shower", label: "Baby Shower", emoji: "🍼" },
      { value: "graduation", label: "Graduation", emoji: "🎓" },
      { value: "valentines", label: "Valentine's Day", emoji: "❤️" },
      { value: "christmas", label: "Christmas", emoji: "🎄" },
      { value: "thank-you", label: "Thank You", emoji: "🙏" },
      { value: "just-because", label: "Just Because", emoji: "💝" },
      { value: "any", label: "No Occasion", emoji: "✨" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget?",
    emoji: "💰",
    options: [
      { value: "under-2k", label: "Under KSh 2,000", emoji: "💵", description: "Thoughtful & affordable" },
      { value: "2k-5k", label: "KSh 2,000 - 5,000", emoji: "💵💵", description: "Sweet spot for most gifts" },
      { value: "5k-10k", label: "KSh 5,000 - 10,000", emoji: "💵💵💵", description: "Premium gifting" },
      { value: "10k+", label: "Over KSh 10,000", emoji: "💎", description: "Go all out" },
      { value: "any", label: "Surprise Me", emoji: "🎲", description: "Show me everything" },
    ],
  },
  {
    id: "interests",
    question: "What do they love?",
    emoji: "💫",
    multiple: true,
    options: [
      { value: "food", label: "Food & Drinks", emoji: "🍷" },
      { value: "wellness", label: "Wellness & Spa", emoji: "🧖" },
      { value: "fashion", label: "Fashion & Style", emoji: "👗" },
      { value: "tech", label: "Tech & Gadgets", emoji: "📱" },
      { value: "books", label: "Books & Learning", emoji: "📚" },
      { value: "home", label: "Home & Living", emoji: "🏠" },
      { value: "experience", label: "Experiences", emoji: "🌟" },
    ],
  },
];

export default function GiftQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({
    recipient: "",
    occasion: "",
    budget: "",
    interests: [],
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canProceed = currentStep.multiple
    ? selectedInterests.length > 0
    : !!answers[currentStep.id as keyof QuizAnswer];

  const handleSelect = (value: string) => {
    if (currentStep.multiple) {
      setSelectedInterests((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep.multiple) {
      setAnswers((prev) => ({ ...prev, interests: selectedInterests }));
    }
    if (isLast) {
      // Navigate to results
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const recommendation = getRecommendation(answers);

  // Build results URL
  const resultsUrl = `/gift-quiz/results?${new URLSearchParams({
    recipient: answers.recipient,
    occasion: answers.occasion,
    budget: answers.budget,
    interests: answers.interests.join(","),
  }).toString()}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-brand-muted">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-brand">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500 rounded-full"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-5xl mb-4 block animate-float">{currentStep.emoji}</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {currentStep.question}
          </h2>
          {currentStep.multiple && (
            <p className="text-sm text-brand-muted">Select all that apply</p>
          )}
        </div>

        {/* Options */}
        <div className={cn(
          "grid gap-3 mb-8",
          currentStep.options.length <= 5 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"
        )}>
          {currentStep.options.map((option) => {
            const isSelected = currentStep.multiple
              ? selectedInterests.includes(option.value)
              : answers[currentStep.id as keyof QuizAnswer] === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left",
                  isSelected
                    ? "border-brand bg-brand/5 shadow-ribbon scale-105"
                    : "border-surface-border bg-white hover:border-brand/30 hover:shadow-card hover:-translate-y-1"
                )}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {option.emoji}
                  </span>
                  <div>
                    <p className={cn(
                      "font-semibold text-sm",
                      isSelected ? "text-brand" : "text-brand-deep"
                    )}>
                      {option.label}
                    </p>
                    {"description" in option && option.description && (
                      <p className="text-xs text-brand-muted mt-0.5">{String(option.description)}</p>
                    )}
                  </div>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              step === 0
                ? "opacity-0 cursor-not-allowed"
                : "text-brand-muted hover:text-brand hover:bg-brand/5"
            )}
          >
            ← Back
          </button>

          {isLast ? (
            <Link
              href={resultsUrl}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-soft",
                canProceed
                  ? "bg-brand text-white hover:bg-brand-deep hover:shadow-ribbon"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
              )}
            >
              Find My Gift 🎁
            </Link>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-soft",
                canProceed
                  ? "bg-brand text-white hover:bg-brand-deep hover:shadow-ribbon"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
