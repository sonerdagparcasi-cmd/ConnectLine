// src/domains/corporate/ai/aiScore.types.ts

export type AiScoreBreakdown = {
  label: string;
  score: number; // 0-100
  weight: number; // %
};

export type AiScoreResult = {
  totalScore: number;
  breakdown: AiScoreBreakdown[];
  feedback: string[];
};