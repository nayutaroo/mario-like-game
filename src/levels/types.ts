import type { ItemKind, StageId } from "../types";

export type PlatformDef = { x: number; y: number; w: number; h: number };

// すり抜け足場 (one-way / semi-solid platform)
// 上から落下してきたときのみ着地し、下から / 横からはすり抜ける
export type SemiSolidVariant = "cloud" | "branch" | "grass" | "rock";
export type SemiSolidDef = {
  x: number;
  y: number;
  w: number;
  h: number;
  variant?: SemiSolidVariant;
};

export type EnemyDef =
  | { kind: "imomushi"; x: number; y: number }
  | { kind: "dangomushi"; x: number; y: number }
  | { kind: "kobachi"; x: number; y: number; leftBound: number; rightBound: number };

export type ItemDef = {
  kind: ItemKind;
  x: number;
  y: number;
};

export type WarpDef = {
  x: number;
  y: number;
  target: StageId;
  returnTo?: StageId;
};

export type MysteryContent =
  | { type: "item"; kind: ItemKind }
  | { type: "warp"; target: StageId; returnTo?: StageId };

export type MysteryBlockDef = {
  x: number;
  y: number;
  content: MysteryContent;
};

export type LevelTheme = {
  bg: [number, number, number];
  platform: [number, number, number];
  platformOutline: [number, number, number];
};

export type LevelData = {
  id: StageId;
  theme: LevelTheme;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  deathPlaneY: number;
  verticalScroll: boolean;
  platforms: PlatformDef[];
  semiSolids?: SemiSolidDef[];
  enemies: EnemyDef[];
  items: ItemDef[];
  checkpoints: { x: number; y: number }[];
  goal?: { x: number; y: number };
  boss?: { x: number; y: number };
  warps?: WarpDef[];
  mysteryBlocks?: MysteryBlockDef[];
  nextStage: StageId | null;
};
