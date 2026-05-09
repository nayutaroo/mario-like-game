import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

const W = 40;
const H = 96;

export function addCheckpoint(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(W, H),
    k.pos(x - W / 2, y - H),
    k.color(255, 220, 240),
    k.outline(2, k.rgb(200, 100, 150)),
    k.opacity(0.55),
    k.area(),
    k.anchor("topleft"),
    "checkpoint",
    { passed: false, cpX: x, cpY: y - 4 },
  ]);

  obj.add([k.text("⛩️", { size: 48, font: EMOJI_FONT }), k.anchor("center"), k.pos(W / 2, H / 2)]);

  obj.on("activated", () => {
    const ext = obj as unknown as { passed: boolean };
    if (ext.passed) return;
    ext.passed = true;
    obj.color = k.rgb(255, 240, 100);
    obj.opacity = 0.85;
  });

  return obj;
}
