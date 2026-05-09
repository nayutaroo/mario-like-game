import { EMOJI_FONT } from "../../config";
import type { ItemKind, KCtx } from "../../types";

const SIZE = 28;

export function addAcorn(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(180, 130, 70),
    k.outline(2, k.rgb(90, 60, 20)),
    k.area(),
    k.anchor("center"),
    "item",
    "acorn-item",
    { kind: "acorn" as ItemKind },
  ]);

  obj.add([k.text("🌰", { size: 22, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, 0)]);

  return obj;
}
