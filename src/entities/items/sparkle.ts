import { EMOJI_FONT } from "../../config";
import type { ItemKind, KCtx } from "../../types";

const SIZE = 28;

export function addSparkle(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(255, 230, 120),
    k.outline(2, k.rgb(180, 130, 20)),
    k.area(),
    k.anchor("center"),
    "item",
    "sparkle-item",
    { kind: "sparkle" as ItemKind },
  ]);

  obj.add([k.text("✨", { size: 22, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, 0)]);

  return obj;
}
