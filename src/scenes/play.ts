import { CANVAS, PHYSICS } from "../config";
import { addDangomushi } from "../entities/enemies/dangomushi";
import { addImomushi } from "../entities/enemies/imomushi";
import { addKobachi } from "../entities/enemies/kobachi";
import { addPlayer } from "../entities/player";
import type { KCtx, StageId } from "../types";
import { buildHelpOverlay } from "./help";

const TILE = CANVAS.tile;
const SPAWN_X = 80;
const SPAWN_Y = 540;

type PlatformDef = { x: number; y: number; w: number; h: number };

const PLATFORMS: PlatformDef[] = [
  { x: 0, y: 640, w: 480, h: 80 },
  { x: 640, y: 640, w: 480, h: 80 },
  { x: 840, y: 480, w: 160, h: 24 },
  { x: 1120, y: 560, w: 480, h: 160 },
  { x: 1380, y: 380, w: 160, h: 24 },
  { x: 1760, y: 640, w: 800, h: 80 },
  { x: 2200, y: 480, w: 160, h: 24 },
];

const GOAL = { x: 2480, y: 520, w: TILE, h: 120 };
const LEVEL_END_X = GOAL.x + GOAL.w + 80;
const DEATH_PLANE_Y = 900;

export function registerPlayScene(k: KCtx): void {
  k.scene("play", (opt: { stage: StageId }) => {
    k.setGravity(PHYSICS.gravity);

    k.add([k.rect(LEVEL_END_X, k.height()), k.pos(0, 0), k.color(135, 206, 235)]);

    for (const p of PLATFORMS) {
      k.add([
        k.rect(p.w, p.h),
        k.pos(p.x, p.y),
        k.color(80, 200, 100),
        k.outline(2, k.rgb(40, 120, 60)),
        k.area(),
        k.body({ isStatic: true }),
        "ground",
      ]);
    }

    k.add([
      k.rect(GOAL.w, GOAL.h),
      k.pos(GOAL.x, GOAL.y),
      k.color(255, 100, 100),
      k.outline(2, k.rgb(120, 30, 30)),
      k.area(),
      "goal",
    ]);

    const resetCamera = () => {
      k.setCamPos(k.width() / 2, k.height() / 2);
    };
    resetCamera();

    const player = addPlayer(k, SPAWN_X, SPAWN_Y, resetCamera);

    addImomushi(k, 320, 638);
    addImomushi(k, 900, 638);
    addKobachi(k, 580, 470, 480, 700);
    addDangomushi(k, 1300, 558);
    addImomushi(k, 1900, 638);
    addKobachi(k, 2050, 420, 1900, 2200);
    addDangomushi(k, 2300, 638);

    player.obj.onCollide("goal", () => {
      k.go("gameover", { reason: "cleared" });
    });

    k.onUpdate(() => {
      if (player.obj.pos.y > DEATH_PLANE_Y) {
        player.reset(SPAWN_X, SPAWN_Y);
        return;
      }

      const minCamX = k.width() / 2;
      const maxCamX = LEVEL_END_X - k.width() / 2;
      const desiredX = Math.max(minCamX, Math.min(player.obj.pos.x, maxCamX));
      const currentX = k.camPos().x;
      const nextX = Math.max(currentX, desiredX);
      k.setCamPos(nextX, k.height() / 2);
    });

    k.add([
      k.text(`Stage: ${opt.stage}    H: ヘルプ    Esc: タイトル`, { size: 18 }),
      k.pos(20, 20),
      k.color(255, 255, 255),
      k.fixed(),
    ]);

    let helpObjs: ReturnType<KCtx["add"]>[] = [];

    const setWorldPaused = (paused: boolean) => {
      player.setPaused(paused);
      for (const e of k.get("enemy")) {
        e.paused = paused;
      }
    };

    const closeHelp = () => {
      for (const o of helpObjs) o.destroy();
      helpObjs = [];
      setWorldPaused(false);
    };
    const openHelp = () => {
      helpObjs = buildHelpOverlay(k);
      setWorldPaused(true);
    };
    k.onKeyPress("h", () => {
      if (helpObjs.length > 0) {
        closeHelp();
      } else {
        openHelp();
      }
    });

    k.onKeyPress("escape", () => {
      closeHelp();
      k.go("title");
    });
  });
}
