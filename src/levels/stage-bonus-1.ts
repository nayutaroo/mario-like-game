import type { LevelData } from "./types";

// ボーナス面「木の実の部屋」: 敵なし、ベリーと金のヒナを集めまくる短いごほうび面。
// goal はあるが nextStage は null。`opt.returnTo` が設定されていれば play.ts がそれに遷移。
export const STAGE_BONUS_1: LevelData = {
  id: "bonus-1",
  theme: {
    bg: [120, 70, 60],
    platform: [200, 130, 90],
    platformOutline: [120, 70, 30],
  },
  width: 1280,
  height: 720,
  spawn: { x: 80, y: 540 },
  deathPlaneY: 900,
  verticalScroll: false,
  platforms: [
    { x: 0, y: 640, w: 1280, h: 80 },
    { x: 0, y: 0, w: 32, h: 720 },
    { x: 1248, y: 0, w: 32, h: 720 },
    { x: 200, y: 520, w: 100, h: 24 },
    { x: 400, y: 420, w: 100, h: 24 },
    { x: 600, y: 320, w: 100, h: 24 },
    { x: 800, y: 420, w: 100, h: 24 },
    { x: 1000, y: 520, w: 100, h: 24 },
  ],
  enemies: [],
  items: [
    // ベリー大量配置
    { kind: "berry", x: 120, y: 600 },
    { kind: "berry", x: 160, y: 600 },
    { kind: "berry", x: 240, y: 480 },
    { kind: "berry", x: 280, y: 480 },
    { kind: "berry", x: 440, y: 380 },
    { kind: "berry", x: 480, y: 380 },
    { kind: "berry", x: 640, y: 280 },
    { kind: "berry", x: 680, y: 280 },
    { kind: "berry", x: 840, y: 380 },
    { kind: "berry", x: 880, y: 380 },
    { kind: "berry", x: 1040, y: 480 },
    { kind: "berry", x: 1080, y: 480 },
    { kind: "berry", x: 1140, y: 600 },
    { kind: "berry", x: 1180, y: 600 },
    // 金のヒナ 2 体（M6 仕様: ボーナスで集める）
    { kind: "gold-chick", x: 660, y: 280 },
    { kind: "gold-chick", x: 1180, y: 600 },
  ],
  checkpoints: [],
  // ゴールは右端、これに触れて元ステージの続きへ戻る
  goal: { x: 1200, y: 638 },
  nextStage: null,
};
