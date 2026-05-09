import { PHYSICS } from "../config";
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
import { addMysteryBlock } from "../entities/mystery-block";
import { addPlayer } from "../entities/player";
import { addSemiSolid } from "../entities/semi-solid";
import { addWarp } from "../entities/warp";
import { getLevel } from "../levels";
import type { MysteryContent } from "../levels/types";
import { createBossHpBar } from "../systems/boss-hp-bar";
import { createHud } from "../systems/hud";
import { showToast } from "../systems/toast";
import { setTouchButtonsVisible } from "../systems/touch-buttons";
import { addVignette } from "../systems/vignette";
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
  // ボーナス面から戻る時の遷移先
  returnTo?: StageId;
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

    if (level.semiSolids) {
      for (const ss of level.semiSolids) {
        addSemiSolid(k, ss.x, ss.y, ss.w, ss.h, ss.variant);
      }
    }

    if (level.goal) {
      addGoal(k, level.goal.x, level.goal.y);
    }

    for (const cp of level.checkpoints) {
      addCheckpoint(k, cp.x, cp.y);
    }

    if (level.warps) {
      for (const w of level.warps) {
        addWarp(k, w.x, w.y, w.target, w.returnTo);
      }
    }

    const emitMysteryContent = (content: MysteryContent, cx: number, cy: number) => {
      if (content.type === "warp") {
        addWarp(k, cx, cy, content.target, content.returnTo);
        return;
      }
      // type === "item"
      switch (content.kind) {
        case "acorn":
          addAcorn(k, cx, cy);
          return;
        case "apple":
          addApple(k, cx, cy);
          return;
        case "leaf":
          addLeaf(k, cx, cy);
          return;
        case "berry":
          addBerry(k, cx, cy);
          return;
        case "sparkle":
          addSparkle(k, cx, cy);
          return;
        case "gold-chick":
          addGoldChick(k, cx, cy);
          return;
      }
    };

    if (level.mysteryBlocks) {
      for (const mb of level.mysteryBlocks) {
        addMysteryBlock(k, mb.x, mb.y, (cx, cy) => emitMysteryContent(mb.content, cx, cy));
      }
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
        showToast(k, player.obj.pos.x, player.obj.pos.y - 50, `+${BERRY_SCORE}`, {
          color: [180, 220, 255],
          size: 18,
          rise: 28,
          duration: 0.7,
        });
        if (berries >= BERRY_PER_LIFE) {
          berries -= BERRY_PER_LIFE;
          lives += 1;
          hud.setBerries(berries);
          hud.setLives(lives);
          showToast(k, k.width() / 2, k.height() * 0.4, "1UP!", {
            color: [180, 255, 180],
            size: 44,
            duration: 1.2,
            rise: 30,
            fixed: true,
            z: 90,
          });
        }
      },
      onLifeUp: () => {
        lives += 1;
        hud.setLives(lives);
        showToast(k, player.obj.pos.x, player.obj.pos.y - 50, "1UP!", {
          color: [180, 255, 180],
          size: 28,
          rise: 36,
          duration: 1.0,
        });
      },
    });

    spawnEnemies();

    const setupBoss = () => {
      if (!level.boss) return;
      const boss = addBoss(k, level.boss.x, level.boss.y);
      const hpBar = createBossHpBar(k, boss.getMaxHp());
      hpBar.setHp(boss.getHp());

      boss.obj.on("damaged", (hp: number) => {
        hpBar.setHp(hp);
        hpBar.flashDamage();
        // ボスの少し上にダメージトースト
        showToast(k, boss.obj.pos.x, boss.obj.pos.y - 80, "-1 HP", {
          color: [255, 200, 200],
          size: 26,
        });
      });
      boss.obj.on("seed-progress", (hits: number) => {
        hpBar.setSeedProgress(hits, boss.getSeedsPerDamage());
      });
      boss.obj.on("phase-change", (phase: string) => {
        // フェーズ突入のフィードバック
        const label = phase === "angry" ? "怒モード!" : phase === "panic" ? "ピンチ!! 暴走!!" : "";
        if (label) {
          showToast(k, k.width() / 2, k.height() * 0.35, label, {
            color: phase === "panic" ? [255, 100, 100] : [255, 180, 80],
            size: 38,
            duration: 1.4,
            rise: 10,
            fixed: true,
            z: 90,
          });
        }
      });
      // 衝撃波: ボス着地時にプレイヤーが地上に居れば damage
      boss.obj.on("shockwave", (info: { x: number; radius: number }) => {
        // 視覚演出: 中央に光る輪
        const ring = k.add([
          k.rect(40, 16, { radius: 8 }),
          k.pos(info.x, boss.obj.pos.y - 8),
          k.color(255, 220, 120),
          k.opacity(0.85),
          k.outline(2, k.rgb(255, 180, 60)),
          k.anchor("center"),
          k.z(50),
        ]);
        let t = 0;
        ring.onUpdate(() => {
          if (ring.paused) return;
          t += k.dt();
          ring.width = 40 + t * 1100;
          ring.opacity = Math.max(0, 0.85 - t * 2.4);
          if (t >= 0.36) ring.destroy();
        });
        // プレイヤーが地上 + 横距離内 → ダメージ
        const dx = Math.abs(player.obj.pos.x - info.x);
        if (dx <= info.radius && player.obj.isGrounded()) {
          player.damage();
        }
      });
      boss.obj.on("defeated", () => {
        score += 1000;
        hud.setScore(score);
        hpBar.setDefeated();
        showToast(k, k.width() / 2, k.height() * 0.4, "BOSS DEFEATED!", {
          color: [255, 240, 120],
          size: 48,
          duration: 1.6,
          rise: 24,
          fixed: true,
          z: 90,
        });
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
        showToast(k, enemy.pos.x, enemy.pos.y - 30, `+${STOMP_SCORE}`, {
          color: [255, 240, 120],
          size: 22,
        });
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
      // ボーナス面から戻る場合、opt.returnTo を優先
      if (opt.returnTo) {
        k.go("play", {
          stage: opt.returnTo,
          score,
          lives,
          berries,
        });
        return;
      }
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

    k.onCollide("player", "warp", (_p, warp) => {
      const ext = warp as unknown as { warpTarget?: StageId; warpReturnTo?: StageId };
      if (!ext.warpTarget) return;
      k.go("play", {
        stage: ext.warpTarget,
        score,
        lives,
        berries,
        returnTo: ext.warpReturnTo,
      });
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

    // 画面隅ビネット (HUD・ボタンよりも下、ステージより上)
    addVignette(k);

    setTouchButtonsVisible(true);

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
