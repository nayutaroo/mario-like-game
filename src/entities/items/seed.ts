import type { KCtx } from "../../types";

const SIZE = 12;
const SPEED = 480;
const LIFETIME = 2;

export function addSeed(k: KCtx, x: number, y: number, dir: 1 | -1) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(120, 70, 30),
    k.outline(2, k.rgb(60, 30, 10)),
    k.area(),
    k.anchor("center"),
    "seed",
  ]);

  const updateHandle = k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    obj.pos.x += dir * SPEED * k.dt();
  });

  obj.onDestroy(() => {
    updateHandle.cancel();
  });

  k.onCollide("seed", "enemy", (s, e) => {
    if (s !== obj) return;
    e.trigger("stomped");
    if (obj.exists()) obj.destroy();
  });

  obj.onCollide("ground", () => {
    if (obj.exists()) obj.destroy();
  });

  k.wait(LIFETIME, () => {
    if (obj.exists()) obj.destroy();
  });

  return obj;
}
