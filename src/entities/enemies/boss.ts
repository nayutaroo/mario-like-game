import { EMOJI_FONT } from "../../config";
import type { KCtx } from "../../types";

const W = 80;
const H = 60;
const WALK_SPEED = 100;
const JUMP_FORCE = 760;
const WALK_DURATION = 2.0;
const STUN_DURATION = 0.8;
const HURT_DURATION = 0.5;
const SEEDS_PER_DAMAGE = 5;
const MAX_HP = 3;
const DEATH_POP = 320;

type BossMode = "walking" | "jumping" | "landing-stun" | "hurt" | "dead";

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

  obj.add([k.text("🪲", { size: 56, font: EMOJI_FONT }), k.anchor("center"), k.pos(0, -H / 2)]);

  const state = {
    mode: "walking" as BossMode,
    dir: -1 as -1 | 1,
    hp: MAX_HP,
    seedHits: 0,
    timer: WALK_DURATION,
    hurtTimer: 0,
  };

  const setHurt = () => {
    state.mode = "hurt";
    state.hurtTimer = HURT_DURATION;
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
      obj.trigger("defeated");
    } else {
      setHurt();
    }
  };

  k.onUpdate(() => {
    if (!obj.exists() || obj.paused) return;
    const dt = k.dt();

    if (state.hurtTimer > 0) {
      state.hurtTimer = Math.max(0, state.hurtTimer - dt);
      const blink = Math.floor(state.hurtTimer * 16) % 2 === 0;
      obj.opacity = blink ? 0.4 : 1;
      if (state.hurtTimer === 0 && state.mode !== "dead") {
        obj.opacity = 1;
        state.mode = "walking";
        state.timer = WALK_DURATION;
      }
    }

    if (state.mode === "dead") {
      obj.vel.y += 1500 * dt;
      obj.opacity = Math.max(0, obj.opacity - dt * 0.7);
      return;
    }

    if (state.mode === "walking") {
      obj.vel.x = state.dir * WALK_SPEED;
      state.timer -= dt;
      if (state.timer <= 0 && obj.isGrounded()) {
        state.mode = "jumping";
        obj.vel.y = -JUMP_FORCE;
      }
    } else if (state.mode === "jumping") {
      obj.vel.x = state.dir * WALK_SPEED * 0.6;
      if (obj.isGrounded() && obj.vel.y >= 0) {
        state.mode = "landing-stun";
        state.timer = STUN_DURATION;
        obj.vel.x = 0;
      }
    } else if (state.mode === "landing-stun") {
      obj.vel.x = 0;
      state.timer -= dt;
      if (state.timer <= 0) {
        state.mode = "walking";
        state.timer = WALK_DURATION;
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
  };
}
