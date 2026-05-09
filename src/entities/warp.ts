import { EMOJI_FONT } from "../config";
import type { KCtx, StageId } from "../types";

const W = 48;
const H = 80;

export function addWarp(k: KCtx, x: number, y: number, target: StageId, returnTo?: StageId) {
  const obj = k.add([
    k.rect(W, H),
    k.pos(x - W / 2, y - H),
    k.color(140, 80, 220),
    k.outline(2, k.rgb(70, 30, 130)),
    k.opacity(0.65),
    k.area(),
    k.anchor("topleft"),
    "warp",
    { warpTarget: target, warpReturnTo: returnTo },
  ]);

  obj.add([k.text("💫", { size: 44, font: EMOJI_FONT }), k.anchor("center"), k.pos(W / 2, H / 2)]);

  return obj;
}
