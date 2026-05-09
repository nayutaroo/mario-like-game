import { EMOJI_FONT } from "../../config";
import type { ItemKind, KCtx } from "../../types";

const SIZE = 28;

export function addLeaf(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(120, 200, 90),
    k.outline(2, k.rgb(40, 100, 30)),
    k.area(),
    k.anchor("center"),
    "item",
    "leaf-item",
    { kind: "leaf" as ItemKind },
  ]);

  obj.add([k.text("🍃", { size: 22, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, 0)]);

  return obj;
}
