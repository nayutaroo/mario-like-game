import { EMOJI_FONT } from "../../config";
import type { KCtx } from "../../types";

const WIDTH = 28;
const HEIGHT = 26;
const WALK_SPEED = 60;
const ROLL_SPEED = 360;

type DangoMode = "walk" | "ball" | "roll";

export function addDangomushi(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(WIDTH, HEIGHT),
    k.pos(x, y),
    k.color(170, 110, 60),
    k.outline(2, k.rgb(80, 50, 20)),
    k.area(),
    k.body(),
    k.anchor("bot"),
    "enemy",
    "dangomushi",
  ]);

  obj.add([
    k.text("🐞", { size: 22, font: EMOJI_FONT }),
    k.anchor("center"),
    k.pos(0, -HEIGHT / 2),
  ]);

  const state = { mode: "walk" as DangoMode, dir: -1 };
  const extras = obj as unknown as { stillBall?: boolean };

  k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    if (state.mode === "walk") {
      obj.vel.x = state.dir * WALK_SPEED;
    } else if (state.mode === "ball") {
      obj.vel.x = 0;
    } else {
      obj.vel.x = state.dir * ROLL_SPEED;
    }
  });

  obj.onCollide("ground", (_g, col) => {
    if (col?.isLeft()) state.dir = 1;
    else if (col?.isRight()) state.dir = -1;
  });

  obj.onCollide("enemy", (other) => {
    if (state.mode === "roll" && other !== obj) {
      other.trigger("stomped");
    }
  });

  obj.on("stomped", () => {
    if (state.mode === "walk" || state.mode === "roll") {
      state.mode = "ball";
      extras.stillBall = true;
      obj.color = k.rgb(120, 80, 40);
    }
  });

  obj.on("kicked", (fromDir: number) => {
    if (state.mode === "ball") {
      state.mode = "roll";
      extras.stillBall = false;
      state.dir = -fromDir;
      obj.color = k.rgb(200, 130, 70);
    }
  });

  return obj;
}
