import { EMOJI_FONT, PHYSICS } from "../config";
import { addCheckpoint } from "../entities/checkpoint";
import { addBoss } from "../entities/enemies/boss";
import { addDangomushi } from "../entities/enemies/dangomushi";
import { addImomushi } from "../entities/enemies/imomushi";
import { addKobachi } from "../entities/enemies/kobachi";
import { addGoal } from "../entities/goal";
import { addAcorn } from "../entities/items/acorn";
import { addApple } from "../entities/items/apple";
import { addBerry } from "../entities/items/berry";
import { addGoldChick } from "../entities/items/gold-chick";
import { addLeaf } from "../entities/items/leaf";
import { addSeed } from "../entities/items/seed";
import { addSparkle } from "../entities/items/sparkle";
import { addPlayer } from "../entities/player";
import { getLevel } from "../levels";
import { createHud } from "../systems/hud";
import type { KCtx, StageId } from "../types";
import { buildHelpOverlay } from "./help";

const INITIAL_LIVES = 3;
const INITIAL_TIME = 300;
const BERRY_PER_LIFE = 100;
const BERRY_SCORE = 10;
const STOMP_SCORE = 100;

type PlayOpt = {
  stage: StageId;
  score?: number;
  lives?: number;
  berries?: number;
};

export function registerPlayScene(k: KCtx): void {
  k.scene("play", (opt: PlayOpt) => {
    const level = getLevel(opt.stage);
    if (!level) {
      k.go("title");
      return;
    }

    k.setGravity(PHYSICS.gravity);

    let score = opt.score ?? 0;
    let berries = opt.berries ?? 0;
    let lives = opt.lives ?? INITIAL_LIVES;
    let timeLeft = INITIAL_TIME;
    const currentCheckpoint = { x: level.spawn.x, y: level.spawn.y };

    k.add([
      k.rect(level.width, level.height),
      k.pos(0, 0),
      k.color(level.theme.bg[0], level.theme.bg[1], level.theme.bg[2]),
    ]);

    for (const p of level.platforms) {
      k.add([
        k.rect(p.w, p.h),
        k.pos(p.x, p.y),
        k.color(level.theme.platform[0], level.theme.platform[1], level.theme.platform[2]),
        k.outline(
          2,
          k.rgb(
            level.theme.platformOutline[0],
            level.theme.platformOutline[1],
            level.theme.platformOutline[2],
          ),
        ),
        k.area(),
        k.body({ isStatic: true }),
        "ground",
      ]);
    }

    if (level.goal) {
      addGoal(k, level.goal.x, level.goal.y);
    }

    for (const cp of level.checkpoints) {
      addCheckpoint(k, cp.x, cp.y);
    }

    const spawnEnemies = () => {
      for (const e of level.enemies) {
        switch (e.kind) {
          case "imomushi":
            addImomushi(k, e.x, e.y);
            break;
          case "dangomushi":
            addDangomushi(k, e.x, e.y);
            break;
          case "kobachi":
            addKobachi(k, e.x, e.y, e.leftBound, e.rightBound);
            break;
        }
      }
    };

    const respawnEnemies = () => {
      for (const e of k.get("enemy")) e.destroy();
      spawnEnemies();
    };

    const hud = createHud(k);
    hud.setScore(score);
    hud.setBerries(berries);
    hud.setLives(lives);
    hud.setTime(timeLeft);

    const updateCamera = () => {
      const minCamX = k.width() / 2;
      const maxCamX = Math.max(minCamX, level.width - k.width() / 2);
      const desiredX = Math.max(minCamX, Math.min(currentCheckpoint.x, maxCamX));
      const camY = level.verticalScroll
        ? Math.max(k.height() / 2, Math.min(currentCheckpoint.y, level.height - k.height() / 2))
        : k.height() / 2;
      k.setCamPos(desiredX, camY);
    };
    updateCamera();

    const player = addPlayer(k, level.spawn.x, level.spawn.y, {
      onReset: () => {
        // カメラを現在のリスポーン位置にスナップ
        const minCamX = k.width() / 2;
        const maxCamX = Math.max(minCamX, level.width - k.width() / 2);
        const camX = Math.max(minCamX, Math.min(currentCheckpoint.x, maxCamX));
        const camY = level.verticalScroll
          ? Math.max(k.height() / 2, Math.min(currentCheckpoint.y, level.height - k.height() / 2))
          : k.height() / 2;
        k.setCamPos(camX, camY);
        // 残機が減ってリスポーンする際は敵を初期配置に戻す（アイテムは引き継ぎ）
        respawnEnemies();
      },
      onLifeLost: () => {
        lives = Math.max(0, lives - 1);
        hud.setLives(lives);
        if (lives === 0) {
          k.go("gameover", { reason: "died" });
        }
      },
      getRespawnPos: () => currentCheckpoint,
      onSeedFire: (sx, sy, dir) => {
        addSeed(k, sx + dir * 24, sy, dir);
      },
      onBerryCollect: () => {
        berries += 1;
        score += BERRY_SCORE;
        hud.setScore(score);
        hud.setBerries(berries);
        if (berries >= BERRY_PER_LIFE) {
          berries -= BERRY_PER_LIFE;
          lives += 1;
          hud.setBerries(berries);
          hud.setLives(lives);
        }
      },
      onLifeUp: () => {
        lives += 1;
        hud.setLives(lives);
      },
    });

    spawnEnemies();

    const setupBoss = () => {
      if (!level.boss) return;
      const boss = addBoss(k, level.boss.x, level.boss.y);
      const renderHearts = (hp: number, max: number) =>
        "❤️".repeat(Math.max(0, hp)) + "🖤".repeat(Math.max(0, max - hp));
      const bossHpText = k.add([
        k.text(`BOSS ${renderHearts(boss.getHp(), boss.getMaxHp())}`, {
          size: 22,
          font: EMOJI_FONT,
        }),
        k.pos(k.width() / 2, 24),
        k.anchor("center"),
        k.color(255, 220, 220),
        k.fixed(),
        k.z(60),
      ]);
      boss.obj.on("damaged", (hp: number) => {
        bossHpText.text = `BOSS ${renderHearts(hp, boss.getMaxHp())}`;
      });
      boss.obj.on("defeated", () => {
        score += 1000;
        hud.setScore(score);
        bossHpText.text = "BOSS DEFEATED!";
        bossHpText.color = k.rgb(255, 240, 120);
        k.wait(1.5, () => {
          k.go("gameover", { reason: "cleared" });
        });
      });
    };
    setupBoss();

    for (const it of level.items) {
      switch (it.kind) {
        case "acorn":
          addAcorn(k, it.x, it.y);
          break;
        case "apple":
          addApple(k, it.x, it.y);
          break;
        case "leaf":
          addLeaf(k, it.x, it.y);
          break;
        case "berry":
          addBerry(k, it.x, it.y);
          break;
        case "sparkle":
          addSparkle(k, it.x, it.y);
          break;
        case "gold-chick":
          addGoldChick(k, it.x, it.y);
          break;
      }
    }

    k.onCollide("seed", "enemy", (seed, enemy) => {
      seed.destroy();
      if (enemy.is("boss")) {
        enemy.trigger("seed-hit");
      } else {
        enemy.trigger("stomped");
        score += STOMP_SCORE;
        hud.setScore(score);
      }
    });

    k.onCollide("player", "checkpoint", (_p, cp) => {
      cp.trigger("activated");
      const ext = cp as unknown as { cpX?: number; cpY?: number };
      if (typeof ext.cpX === "number" && typeof ext.cpY === "number") {
        currentCheckpoint.x = ext.cpX;
        currentCheckpoint.y = ext.cpY;
      }
    });

    player.obj.onCollide("goal", () => {
      if (level.nextStage) {
        k.go("play", {
          stage: level.nextStage,
          score,
          lives,
          berries,
        });
      } else {
        k.go("gameover", { reason: "cleared" });
      }
    });

    k.onUpdate(() => {
      if (player.obj.paused) return;

      timeLeft = Math.max(0, timeLeft - k.dt());
      hud.setTime(timeLeft);
      if (timeLeft <= 0) {
        lives = Math.max(0, lives - 1);
        hud.setLives(lives);
        if (lives === 0) {
          k.go("gameover", { reason: "timeup" });
          return;
        }
        timeLeft = INITIAL_TIME;
        hud.setTime(timeLeft);
        player.reset(currentCheckpoint.x, currentCheckpoint.y);
      }

      if (player.obj.pos.y > level.deathPlaneY) {
        lives = Math.max(0, lives - 1);
        hud.setLives(lives);
        if (lives === 0) {
          k.go("gameover", { reason: "died" });
          return;
        }
        player.reset(currentCheckpoint.x, currentCheckpoint.y);
        return;
      }

      const minCamX = k.width() / 2;
      const maxCamX = Math.max(minCamX, level.width - k.width() / 2);
      const desiredX = Math.max(minCamX, Math.min(player.obj.pos.x, maxCamX));
      const currentX = k.camPos().x;
      const nextX = Math.max(currentX, desiredX);

      let nextY = k.height() / 2;
      if (level.verticalScroll) {
        const minCamY = k.height() / 2;
        const maxCamY = Math.max(minCamY, level.height - k.height() / 2);
        nextY = Math.max(minCamY, Math.min(player.obj.pos.y, maxCamY));
      }
      k.setCamPos(nextX, nextY);
    });

    k.add([
      k.text(`Stage: ${opt.stage}    H: ヘルプ    Esc: タイトル    Z: 種`, { size: 16 }),
      k.pos(20, 60),
      k.color(255, 255, 255),
      k.fixed(),
      k.z(60),
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
