import type { KCtx } from "../types";

const SIZE = 32;
const HIT_BOUNCE_FRAMES = 8;
const HIT_BOUNCE_HEIGHT = 6;

export function addMysteryBlock(
  k: KCtx,
  x: number,
  y: number,
  onHit: (cx: number, cy: number) => void,
) {
  const obj = k.add([
    k.rect(SIZE, SIZE),
    k.pos(x, y),
    k.color(230, 180, 60),
    k.outline(2, k.rgb(140, 90, 0)),
    k.area(),
    k.body({ isStatic: true }),
    k.anchor("topleft"),
    "ground",
    "mystery",
    { mysteryUsed: false },
  ]);

  const mark = obj.add([
    k.text("?", { size: 22 }),
    k.color(255, 255, 255),
    k.outline(2, k.rgb(140, 90, 0)),
    k.anchor("center"),
    k.pos(SIZE / 2, SIZE / 2),
  ]);

  let bounceFrames = 0;
  const baseY = y;

  k.onUpdate(() => {
    if (!obj.exists()) return;
    if (bounceFrames > 0) {
      bounceFrames--;
      const t = bounceFrames / HIT_BOUNCE_FRAMES;
      obj.pos.y = baseY - HIT_BOUNCE_HEIGHT * Math.sin(t * Math.PI);
      if (bounceFrames === 0) obj.pos.y = baseY;
    }
  });

  obj.onCollide("player", (_p, col) => {
    const ext = obj as unknown as { mysteryUsed?: boolean };
    if (ext.mysteryUsed) return;
    // col.isBottom() from block's perspective = player came from below (head bonk)
    if (!col?.isBottom()) return;
    ext.mysteryUsed = true;
    obj.color = k.rgb(130, 120, 110);
    obj.outline.color = k.rgb(70, 60, 50);
    mark.destroy();
    bounceFrames = HIT_BOUNCE_FRAMES;
    // 中身は block の上端中央あたりからポップさせる
    onHit(x + SIZE / 2, y - 4);
  });

  return obj;
}
