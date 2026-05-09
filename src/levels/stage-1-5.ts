import type { LevelData } from "./types";

// ボス面: 横長アリーナ。両端は壁、中央付近にボス。
// goal は無し。ボス撃破でクリア。
//
// 1280→1920 に拡張: 中央台 + 左右 2 箇所の高台 + すり抜け足場で
// 立体的に逃げ撃ちできる構成。後方フェーズの衝撃波をかわす逃げ場として機能する。
export const STAGE_1_5: LevelData = {
  id: "1-5",
  theme: {
    bg: [40, 22, 32],
    platform: [90, 60, 70],
    platformOutline: [40, 20, 30],
  },
  width: 1920,
  height: 720,
  spawn: { x: 80, y: 540 },
  deathPlaneY: 900,
  verticalScroll: false,
  platforms: [
    { x: 0, y: 640, w: 1920, h: 80 },
    { x: 0, y: 0, w: 32, h: 720 },
    { x: 1888, y: 0, w: 32, h: 720 },
    // 左右の高台 (踏み攻撃の launch ポイント)
    { x: 200, y: 500, w: 140, h: 24 },
    { x: 1580, y: 500, w: 140, h: 24 },
    // 中央の小さな段 (種を撃ちながら横に動く拠点)
    { x: 880, y: 540, w: 160, h: 24 },
  ],
  // すり抜け足場: 衝撃波の高さ (地上) を回避できる中段
  semiSolids: [
    { x: 540, y: 420, w: 140, h: 12, variant: "rock" },
    { x: 1240, y: 420, w: 140, h: 12, variant: "rock" },
  ],
  enemies: [],
  items: [
    { kind: "acorn", x: 250, y: 460 },
    { kind: "apple", x: 1640, y: 460 },
    { kind: "apple", x: 940, y: 500 },
  ],
  checkpoints: [],
  boss: { x: 960, y: 638 },
  nextStage: null,
};
