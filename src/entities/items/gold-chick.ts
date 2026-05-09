import { EMOJI_FONT } from "../../config";
import type { ItemKind, KCtx } from "../../types";

const SIZE = 28;

export function addGoldChick(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(255, 200, 40),
    k.outline(2, k.rgb(160, 100, 0)),
    k.area(),
    k.anchor("center"),
    "item",
    "gold-chick-item",
    { kind: "gold-chick" as ItemKind },
  ]);

  obj.add([k.text("🐥", { size: 22, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, 0)]);

  return obj;
}
