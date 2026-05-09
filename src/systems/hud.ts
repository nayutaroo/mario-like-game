import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

export type HudHandle = {
  setScore(n: number): void;
  setBerries(n: number): void;
  setLives(n: number): void;
  setTime(seconds: number): void;
  destroy(): void;
};

const HUD_HEIGHT = 56;
const PANEL_PAD_X = 16;
const PANEL_PAD_Y = 8;
const CELL_GAP = 16;
const ICON_SIZE = 28;
const VALUE_SIZE = 24;
const TIME_LOW_THRESHOLD = 60;

function buildCell(k: KCtx, x: number, icon: string, initial: string, width: number) {
  const bg = k.add([
    k.rect(width, HUD_HEIGHT - 16, { radius: 10 }),
    k.pos(x, PANEL_PAD_Y),
    k.color(0, 0, 0),
    k.opacity(0.4),
    k.outline(1, k.rgb(255, 255, 255)),
    k.fixed(),
    k.z(51),
  ]);
  const iconObj = k.add([
    k.text(icon, { size: ICON_SIZE, font: EMOJI_FONT }),
    k.pos(x + 12, HUD_HEIGHT / 2),
    k.anchor("left"),
    k.fixed(),
    k.z(52),
  ]);
  const valueObj = k.add([
    k.text(initial, { size: VALUE_SIZE, font: EMOJI_FONT }),
    k.pos(x + 12 + ICON_SIZE + 8, HUD_HEIGHT / 2),
    k.anchor("left"),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(52),
  ]);
  return { bg, icon: iconObj, value: valueObj, width };
}

export function createHud(k: KCtx): HudHandle {
  const all: ReturnType<KCtx["add"]>[] = [];

  // 上部ストリップ全体の背景バー（柔らかめ）
  const stripBg = k.add([
    k.rect(k.width(), HUD_HEIGHT),
    k.pos(0, 0),
    k.color(10, 14, 26),
    k.opacity(0.55),
    k.fixed(),
    k.z(50),
  ]);
  all.push(stripBg);

  // セル幅: 4 つを並べる
  const totalContent = k.width() - PANEL_PAD_X * 2;
  const cellW = (totalContent - CELL_GAP * 3) / 4;
  let cursor = PANEL_PAD_X;

  const score = buildCell(k, cursor, "🏆", "0", cellW);
  cursor += cellW + CELL_GAP;
  const berries = buildCell(k, cursor, "🫐", "0", cellW);
  cursor += cellW + CELL_GAP;
  const lives = buildCell(k, cursor, "🐤", "x3", cellW);
  cursor += cellW + CELL_GAP;
  const time = buildCell(k, cursor, "⏱", "300", cellW);

  for (const cell of [score, berries, lives, time]) {
    all.push(cell.bg, cell.icon, cell.value);
  }

  return {
    setScore(n) {
      score.value.text = String(n);
    },
    setBerries(n) {
      berries.value.text = String(n);
    },
    setLives(n) {
      lives.value.text = `x${n}`;
    },
    setTime(seconds) {
      const v = Math.max(0, Math.ceil(seconds));
      time.value.text = String(v);
      // 時間残り少ない時は赤く点滅
      if (v <= TIME_LOW_THRESHOLD) {
        const blink = Math.floor(v * 2) % 2 === 0;
        time.value.color = blink ? k.rgb(255, 90, 90) : k.rgb(255, 200, 200);
      } else {
        time.value.color = k.rgb(255, 255, 255);
      }
    },
    destroy() {
      for (const o of all) o.destroy();
      all.length = 0;
    },
  };
}
