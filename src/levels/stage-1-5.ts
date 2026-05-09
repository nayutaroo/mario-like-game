import type { LevelData } from "./types";

// ボス面: 単画面のアリーナ。両端は壁、中央付近にボス。
// goal は無し。ボス撃破でクリア。
export const STAGE_1_5: LevelData = {
  id: "1-5",
  theme: {
    bg: [40, 22, 32],
    platform: [90, 60, 70],
    platformOutline: [40, 20, 30],
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
    { x: 200, y: 480, w: 100, h: 24 },
    { x: 980, y: 480, w: 100, h: 24 },
  ],
  enemies: [],
  items: [
    { kind: "acorn", x: 240, y: 440 },
    { kind: "apple", x: 1020, y: 440 },
  ],
  checkpoints: [],
  boss: { x: 640, y: 638 },
  nextStage: null,
};
