import { EMOJI_FONT } from "../../config";
import type { ItemKind, KCtx } from "../../types";

const SIZE = 28;

export function addBerry(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(90, 100, 200),
    k.outline(2, k.rgb(30, 40, 110)),
    k.area(),
    k.anchor("center"),
    "item",
    "berry-item",
    { kind: "berry" as ItemKind },
  ]);

  obj.add([k.text("🫐", { size: 22, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, 0)]);

  return obj;
}
