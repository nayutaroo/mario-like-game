import type { KCtx } from "../../types";

const WIDTH = 28;
const HEIGHT = 22;
const SPEED = 100;

export function addKobachi(k: KCtx, x: number, y: number, leftBound: number, rightBound: number) {
  const obj = k.add([
    k.rect(WIDTH, HEIGHT),
    k.pos(x, y),
    k.color(255, 220, 80),
    k.outline(2, k.rgb(120, 80, 0)),
    k.area(),
    k.anchor("center"),
    "enemy",
    "kobachi",
  ]);

  let dir = -1;

  k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    obj.move(dir * SPEED, 0);
    if (obj.pos.x < leftBound) {
      obj.pos.x = leftBound;
      dir = 1;
    } else if (obj.pos.x > rightBound) {
      obj.pos.x = rightBound;
      dir = -1;
    }
  });

  obj.on("stomped", () => {
    obj.destroy();
  });

  return obj;
}
