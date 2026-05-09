import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

export type HudHandle = {
  setScore(n: number): void;
  setBerries(n: number): void;
  setLives(n: number): void;
  setTime(seconds: number): void;
  destroy(): void;
};

const HUD_HEIGHT = 48;
const TEXT_SIZE = 24;
const TEXT_Y = 12;
const CELL_WIDTH = 280;
const CELL_X_START = 20;

const formatScore = (n: number): string => `🏆 ${n}`;
const formatBerries = (n: number): string => `🫐 ${n}`;
const formatLives = (n: number): string => `🐤 x${n}`;
const formatTime = (seconds: number): string => `⏱ ${Math.max(0, Math.ceil(seconds))}`;

export function createHud(k: KCtx): HudHandle {
  const all: ReturnType<KCtx["add"]>[] = [];

  const bg = k.add([
    k.rect(k.width(), HUD_HEIGHT),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.5),
    k.fixed(),
    k.z(50),
  ]);
  all.push(bg);

  const scoreText = k.add([
    k.text(formatScore(0), { size: TEXT_SIZE, font: EMOJI_FONT }),
    k.pos(CELL_X_START, TEXT_Y),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(51),
  ]);
  all.push(scoreText);

  const berryText = k.add([
    k.text(formatBerries(0), { size: TEXT_SIZE, font: EMOJI_FONT }),
    k.pos(CELL_X_START + CELL_WIDTH, TEXT_Y),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(51),
  ]);
  all.push(berryText);

  const livesText = k.add([
    k.text(formatLives(3), { size: TEXT_SIZE, font: EMOJI_FONT }),
    k.pos(CELL_X_START + CELL_WIDTH * 2, TEXT_Y),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(51),
  ]);
  all.push(livesText);

  const timeText = k.add([
    k.text(formatTime(300), { size: TEXT_SIZE, font: EMOJI_FONT }),
    k.pos(CELL_X_START + CELL_WIDTH * 3, TEXT_Y),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(51),
  ]);
  all.push(timeText);

  return {
    setScore(n) {
      scoreText.text = formatScore(n);
    },
    setBerries(n) {
      berryText.text = formatBerries(n);
    },
    setLives(n) {
      livesText.text = formatLives(n);
    },
    setTime(seconds) {
      timeText.text = formatTime(seconds);
    },
    destroy() {
      for (const o of all) {
        o.destroy();
      }
      all.length = 0;
    },
  };
}
