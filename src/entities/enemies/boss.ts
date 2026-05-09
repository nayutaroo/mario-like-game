import { EMOJI_FONT } from "../../config";
import type { KCtx } from "../../types";

// ヌシイモ (1-5 ボス)
//
// HP 5 で 3 段階のフェーズ構成:
//   - calm  (HP 5-4): 通常パターン (歩く → 大ジャンプ叩きつけ → スタン)
//   - angry (HP 3-2): 移動速い、ジャンプ間隔短い、踏み着地で衝撃波
//   - panic (HP 1):   さらに速くなり、二段ジャンプで距離詰め、ピンチ表情
//
// 弱点 = 上からの踏み (1HP)、種は 5 発で 1HP。
// "ジャンプ前に光る" 接近警告と、HP 段階で表情を変える絵文字差し替えも乗せる。

const W = 80;
const H = 60;
const SEEDS_PER_DAMAGE = 5;
const MAX_HP = 5;
const HURT_DURATION = 0.5;
const DEATH_POP = 320;

type BossMode =
  | "walking"
  | "telegraph" // ジャンプ前の予兆 (光る)
  | "jumping"
  | "landing-stun"
  | "shockwave" // 着地衝撃波（angry/panic 限定）
  | "hurt"
  | "dead";

type Phase = "calm" | "angry" | "panic";

type PhaseProfile = {
  walkSpeed: number;
  walkDuration: number;
  telegraphDuration: number;
  jumpForce: number;
  jumpAirX: number; // 空中左右速度倍率 (× walkSpeed)
  stunDuration: number;
  shockwave: boolean;
  doubleJump: boolean;
  emoji: string;
  bodyColor: [number, number, number];
};

const PHASE_PROFILE: Record<Phase, PhaseProfile> = {
  calm: {
    walkSpeed: 100,
    walkDuration: 2.0,
    telegraphDuration: 0.4,
    jumpForce: 820,
    jumpAirX: 0.6,
    stunDuration: 0.8,
    shockwave: false,
    doubleJump: false,
    emoji: "🪲",
    bodyColor: [140, 60, 60],
  },
  angry: {
    walkSpeed: 160,
    walkDuration: 1.2,
    telegraphDuration: 0.3,
    jumpForce: 920,
    jumpAirX: 0.9,
    stunDuration: 0.55,
    shockwave: true,
    doubleJump: false,
    emoji: "👹",
    bodyColor: [180, 70, 60],
  },
  panic: {
    walkSpeed: 210,
    walkDuration: 0.8,
    telegraphDuration: 0.2,
    jumpForce: 980,
    jumpAirX: 1.1,
    stunDuration: 0.4,
    shockwave: true,
    doubleJump: true,
    emoji: "😡",
    bodyColor: [220, 70, 60],
  },
};

const SHOCKWAVE_RADIUS = 220; // 衝撃波 (横距離) でプレイヤーが地上にいるとダメージ
const SHOCKWAVE_DURATION = 0.35;

function phaseFor(hp: number): Phase {
  if (hp >= 4) return "calm";
  if (hp >= 2) return "angry";
  return "panic";
}

export function addBoss(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(W, H),
    k.pos(x, y),
    k.color(140, 60, 60),
    k.outline(3, k.rgb(60, 20, 20)),
    k.area(),
    k.body(),
    k.opacity(1),
    k.anchor("bot"),
    "enemy",
    "boss",
  ]);

  // 表情用の絵文字。phase 切り替え時に text を差し替える
  const face = obj.add([
    k.text("🪲", { size: 56, font: EMOJI_FONT }),
    k.anchor("center"),
    k.pos(0, -H / 2),
  ]);

  // ジャンプ予兆中の発光リング (transparent → 黄色光)
  const telegraphRing = obj.add([
    k.rect(W + 24, H + 24, { radius: 12 }),
    k.color(255, 240, 120),
    k.opacity(0),
    k.outline(3, k.rgb(255, 200, 60)),
    k.anchor("center"),
    k.pos(0, -H / 2),
    k.z(-1),
  ]);

  const state = {
    mode: "walking" as BossMode,
    dir: -1 as -1 | 1,
    hp: MAX_HP,
    seedHits: 0,
    timer: PHASE_PROFILE.calm.walkDuration,
    hurtTimer: 0,
    phase: "calm" as Phase,
    jumpsLeft: 0, // panic フェーズの 2 段ジャンプ用
    shockwaveTimer: 0,
  };

  const applyPhaseLook = () => {
    const p = PHASE_PROFILE[state.phase];
    face.text = p.emoji;
    obj.color = k.rgb(p.bodyColor[0], p.bodyColor[1], p.bodyColor[2]);
  };
  applyPhaseLook();

  const updatePhaseFromHp = () => {
    const next = phaseFor(state.hp);
    if (next !== state.phase) {
      state.phase = next;
      applyPhaseLook();
      obj.trigger("phase-change", state.phase);
    }
  };

  const setHurt = () => {
    state.mode = "hurt";
    state.hurtTimer = HURT_DURATION;
    telegraphRing.opacity = 0;
  };

  const takeDamage = () => {
    if (state.mode === "hurt" || state.mode === "dead") return;
    state.hp -= 1;
    obj.trigger("damaged", state.hp);
    if (state.hp <= 0) {
      state.mode = "dead";
      obj.vel = k.vec2(0, -DEATH_POP);
      obj.untag("enemy");
      obj.untag("boss");
      telegraphRing.opacity = 0;
      obj.trigger("defeated");
    } else {
      updatePhaseFromHp();
      setHurt();
    }
  };

  // 衝撃波: ランディング時に "shockwave" トリガを飛ばす（play.ts 側でプレイヤーへ判定）
  const emitShockwave = () => {
    state.mode = "shockwave";
    state.shockwaveTimer = SHOCKWAVE_DURATION;
    obj.trigger("shockwave", { x: obj.pos.x, radius: SHOCKWAVE_RADIUS });
  };

  k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    const dt = k.dt();
    const profile = PHASE_PROFILE[state.phase];

    if (state.hurtTimer > 0) {
      state.hurtTimer = Math.max(0, state.hurtTimer - dt);
      const blink = Math.floor(state.hurtTimer * 16) % 2 === 0;
      obj.opacity = blink ? 0.4 : 1;
      if (state.hurtTimer === 0 && state.mode !== "dead") {
        obj.opacity = 1;
        state.mode = "walking";
        state.timer = profile.walkDuration;
      }
    }

    if (state.mode === "dead") {
      obj.vel.y += 1500 * dt;
      obj.opacity = Math.max(0, obj.opacity - dt * 0.7);
      return;
    }

    // モード遷移
    if (state.mode === "walking") {
      obj.vel.x = state.dir * profile.walkSpeed;
      state.timer -= dt;
      if (state.timer <= 0 && obj.isGrounded()) {
        state.mode = "telegraph";
        state.timer = profile.telegraphDuration;
        obj.vel.x = 0;
      }
    } else if (state.mode === "telegraph") {
      obj.vel.x = 0;
      state.timer -= dt;
      // 警告点滅
      const t = 1 - state.timer / profile.telegraphDuration;
      telegraphRing.opacity = 0.2 + 0.6 * Math.abs(Math.sin(t * Math.PI * 4));
      if (state.timer <= 0) {
        telegraphRing.opacity = 0;
        state.mode = "jumping";
        obj.vel.y = -profile.jumpForce;
        state.jumpsLeft = profile.doubleJump ? 1 : 0;
      }
    } else if (state.mode === "jumping") {
      obj.vel.x = state.dir * profile.walkSpeed * profile.jumpAirX;
      // 上昇のピーク付近で 2 段ジャンプ (panic のみ)
      if (state.jumpsLeft > 0 && obj.vel.y > -profile.jumpForce * 0.2 && obj.vel.y < 0) {
        obj.vel.y = -profile.jumpForce * 0.85;
        state.jumpsLeft = 0;
      }
      if (obj.isGrounded() && obj.vel.y >= 0) {
        if (profile.shockwave) {
          emitShockwave();
        } else {
          state.mode = "landing-stun";
          state.timer = profile.stunDuration;
          obj.vel.x = 0;
        }
      }
    } else if (state.mode === "shockwave") {
      obj.vel.x = 0;
      state.shockwaveTimer = Math.max(0, state.shockwaveTimer - dt);
      if (state.shockwaveTimer === 0) {
        state.mode = "landing-stun";
        state.timer = profile.stunDuration;
      }
    } else if (state.mode === "landing-stun") {
      obj.vel.x = 0;
      state.timer -= dt;
      if (state.timer <= 0) {
        state.mode = "walking";
        state.timer = profile.walkDuration;
      }
    }
  });

  obj.onCollide("ground", (_g, col) => {
    if (state.mode === "dead") return;
    if (col?.isLeft()) state.dir = 1;
    else if (col?.isRight()) state.dir = -1;
  });

  obj.on("stomped", () => {
    takeDamage();
  });

  obj.on("seed-hit", () => {
    if (state.mode === "hurt" || state.mode === "dead") return;
    state.seedHits += 1;
    obj.trigger("seed-progress", state.seedHits);
    if (state.seedHits >= SEEDS_PER_DAMAGE) {
      state.seedHits = 0;
      takeDamage();
    }
  });

  return {
    obj,
    getHp: () => state.hp,
    getMaxHp: () => MAX_HP,
    getPhase: () => state.phase,
    getSeedsPerDamage: () => SEEDS_PER_DAMAGE,
  };
}
