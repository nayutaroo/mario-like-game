import { CANVAS } from "../config";
import type { KCtx, StageId } from "../types";

const PLAYER_SPEED = 240;

export function registerPlayScene(k: KCtx): void {
  k.scene("play", (opt: { stage: StageId }) => {
    k.add([k.rect(k.width(), k.height()), k.color(135, 206, 235)]);

    const groundHeight = 80;
    k.add([
      k.rect(k.width(), groundHeight),
      k.pos(0, k.height() - groundHeight),
      k.color(80, 200, 100),
      k.area(),
      k.body({ isStatic: true }),
      "ground",
    ]);

    const playerSize = CANVAS.tile * 2;
    const player = k.add([
      k.rect(playerSize, playerSize),
      k.pos(80, k.height() - groundHeight - playerSize),
      k.color(240, 200, 60),
      k.area(),
      "player",
    ]);

    const goalWidth = CANVAS.tile;
    const goalHeight = CANVAS.tile * 4;
    k.add([
      k.rect(goalWidth, goalHeight),
      k.pos(k.width() - 120, k.height() - groundHeight - goalHeight),
      k.color(255, 100, 100),
      k.area(),
      "goal",
    ]);

    k.add([
      k.text(`Stage: ${opt.stage}  ←/→ or A/D to move`, { size: 20 }),
      k.pos(20, 20),
      k.color(255, 255, 255),
      k.fixed(),
    ]);

    k.onKeyDown(["right", "d"], () => {
      player.move(PLAYER_SPEED, 0);
    });
    k.onKeyDown(["left", "a"], () => {
      player.move(-PLAYER_SPEED, 0);
    });
    k.onKeyPress("escape", () => {
      k.go("title");
    });

    player.onCollide("goal", () => {
      k.go("gameover", { reason: "cleared" });
    });
  });
}
