import type { LevelData } from "./types";

export const STAGE_1_1: LevelData = {
  id: "1-1",
  theme: {
    bg: [135, 206, 235],
    platform: [80, 200, 100],
    platformOutline: [40, 120, 60],
  },
  width: 2640,
  height: 720,
  spawn: { x: 80, y: 540 },
  deathPlaneY: 900,
  verticalScroll: false,
  platforms: [
    { x: 0, y: 640, w: 480, h: 80 },
    { x: 640, y: 640, w: 480, h: 80 },
    { x: 840, y: 480, w: 160, h: 24 },
    { x: 1120, y: 560, w: 480, h: 160 },
    { x: 1380, y: 380, w: 160, h: 24 },
    { x: 1760, y: 640, w: 800, h: 80 },
    { x: 2200, y: 480, w: 160, h: 24 },
  ],
  enemies: [
    { kind: "imomushi", x: 320, y: 638 },
    { kind: "imomushi", x: 900, y: 638 },
    { kind: "kobachi", x: 580, y: 470, leftBound: 480, rightBound: 700 },
    { kind: "dangomushi", x: 1300, y: 558 },
    { kind: "imomushi", x: 1900, y: 638 },
    { kind: "kobachi", x: 2050, y: 420, leftBound: 1900, rightBound: 2200 },
    { kind: "dangomushi", x: 2300, y: 638 },
  ],
  items: [
    { kind: "acorn", x: 200, y: 600 },
    { kind: "berry", x: 720, y: 600 },
    { kind: "berry", x: 760, y: 600 },
    { kind: "berry", x: 800, y: 600 },
    { kind: "leaf", x: 920, y: 440 },
    { kind: "apple", x: 1300, y: 510 },
    { kind: "berry", x: 1400, y: 340 },
    { kind: "berry", x: 1440, y: 340 },
    { kind: "berry", x: 1480, y: 340 },
    { kind: "sparkle", x: 2240, y: 440 },
    { kind: "gold-chick", x: 2400, y: 600 },
  ],
  checkpoints: [{ x: 1340, y: 558 }],
  goal: { x: 2496, y: 638 },
  mysteryBlocks: [
    // 序盤の穴の上空に、叩くとベリーが出るブロック
    { x: 540, y: 480, content: { type: "item", kind: "berry" } },
    // 中盤の段差近くに隠しブロック → ボーナス面ワープ
    { x: 1700, y: 460, content: { type: "warp", target: "bonus-1", returnTo: "1-2" } },
  ],
  nextStage: "1-2",
};
