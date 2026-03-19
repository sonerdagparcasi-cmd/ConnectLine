// src/domains/corporate/recruitment/ai/ranking.types.ts
// 🔒 Backward compatible re-export layer
// Recruitment tarafındaki eski importları kırmadan,
// tek source-of-truth olan corporate/ai/ranking.types'a yönlendirir.

export {
  SortMode, type RankedItem, type RankingQuery, type StatusFilter
} from "../../ai/ranking.types";
