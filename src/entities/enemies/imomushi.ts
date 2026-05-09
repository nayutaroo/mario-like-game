import type { KCtx } from "../../types";

const WIDTH = 28;
const HEIGHT = 22;
const SPEED = 60;

export function addImomushi(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(WIDTH, HEIGHT),
    k.pos(x, y),
    k.color(120, 200, 80),
    k.outline(2, k.rgb(40, 100, 30)),
    k.area(),
    k.body(),
    k.anchor("bot"),
    "enemy",
    "imomushi",
  ]);

  let dir = -1;

  k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    obj.vel.x = dir * SPEED;
  });

  obj.onCollide("ground", (_g, col) => {
    if (col?.isLeft()) dir = 1;
    else if (col?.isRight()) dir = -1;
  });

  obj.on("stomped", () => {
    obj.destroy();
  });

  return obj;
}
