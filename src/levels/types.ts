import type { ItemKind, StageId } from "../types";

export type PlatformDef = { x: number; y: number; w: number; h: number };

export type EnemyDef =
  | { kind: "imomushi"; x: number; y: number }
  | { kind: "dangomushi"; x: number; y: number }
  | { kind: "kobachi"; x: number; y: number; leftBound: number; rightBound: number };

export type ItemDef = {
  kind: ItemKind;
  x: number;
  y: number;
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
  enemies: EnemyDef[];
  items: ItemDef[];
  checkpoints: { x: number; y: number }[];
  goal?: { x: number; y: number };
  boss?: { x: number; y: number };
  nextStage: StageId | null;
};
