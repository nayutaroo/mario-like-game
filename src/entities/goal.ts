import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

const SIZE = 80;

export function addGoal(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x - SIZE / 2, y - SIZE),
    k.color(255, 230, 100),
    k.outline(3, k.rgb(255, 180, 60)),
    k.opacity(0.55),
    k.area(),
    k.anchor("topleft"),
    "goal",
  ]);

  obj.add([
    k.text("🌀", { size: 56, font: EMOJI_FONT }),
    k.anchor("center"),
    k.pos(SIZE / 2, SIZE / 2),
  ]);

  return obj;
}
