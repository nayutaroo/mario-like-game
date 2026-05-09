import type kaplay from "kaplay";

export type KCtx = ReturnType<typeof kaplay>;

export type StageId = "1-1" | "1-2" | "1-3" | "1-4" | "1-5" | "bonus-1";

export type PlayerForm = "normal" | "acorn" | "apple";

export type ItemKind = "acorn" | "apple" | "leaf" | "berry" | "sparkle" | "gold-chick";

export type EnemyKind = "imomushi" | "dangomushi" | "kobachi" | "boss";

export type GameoverReason = "cleared" | "died" | "timeup";
