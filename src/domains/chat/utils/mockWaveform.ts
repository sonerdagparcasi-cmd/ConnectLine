// src/domains/chat/utils/mockWaveform.ts

export function generateMockWaveform(
  length: number = 24
): number[] {
  return Array.from({ length }, () =>
    Math.min(1, Math.random() * 1.1)
  );
}