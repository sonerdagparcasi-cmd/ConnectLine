// src/domains/chat/config/chatSpacing.ts
// 8pt grid – consistent spacing across chat components

export const CHAT_SPACING = {
  /** Gap between messages (base). */
  messageGap: 8,
  /** Gap when previous message is from same sender. */
  sameSenderGap: 4,
  /** Gap when previous message is from different sender (user switch). */
  userSwitchGap: 12,

  /** Space between avatar and bubble. */
  avatarToBubble: 8,
  /** Horizontal padding from screen edge. */
  screenEdge: 16,

  /** Bubble inner padding. */
  bubblePaddingVertical: 10,
  bubblePaddingHorizontal: 14,
  /** Bubble max width as % of screen (0–1). */
  bubbleMaxWidthPercent: 0.72,

  /** Reaction badge offset from bubble. */
  reactionOffsetVertical: 4,
  reactionOffsetHorizontal: 6,

  /** Day separator vertical padding. */
  daySeparatorTop: 24,
  daySeparatorBottom: 24,

  /** Composer container padding. */
  composerPaddingVertical: 10,
  composerPaddingHorizontal: 12,
} as const;
