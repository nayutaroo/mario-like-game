import { EMOJI_FONT, PHYSICS } from "../config";
import type { KCtx } from "../types";

const PLAYER_WIDTH = 36;
const PLAYER_HEIGHT = 44;
const STOMP_BOUNCE = 360;

type EnemyLike = {
  pos: { x: number; y: number };
  stillBall?: boolean;
  trigger: (event: string, ...args: unknown[]) => void;
};

export function addPlayer(k: KCtx, spawnX: number, spawnY: number, onReset?: () => void) {
  const obj = k.add([
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT),
    k.pos(spawnX, spawnY),
    k.color(240, 200, 60),
    k.outline(2, k.rgb(80, 50, 0)),
    k.area(),
    k.body(),
    k.opacity(1),
    k.anchor("bot"),
    "player",
  ]);

  obj.add([
    k.text("🐤", { size: 32, font: EMOJI_FONT }),
    k.anchor("center"),
    k.pos(0, -PLAYER_HEIGHT / 2),
  ]);

  let coyoteTimer = 0;
  let jumpBufferTimer = 0;
  let isJumpHeld = false;
  let invincibleTimer = 0;
  let paused = false;

  const reset = (rx: number = spawnX, ry: number = spawnY) => {
    obj.pos = k.vec2(rx, ry);
    obj.vel = k.vec2(0, 0);
    coyoteTimer = 0;
    jumpBufferTimer = 0;
    isJumpHeld = false;
    onReset?.();
  };

  const damage = (): boolean => {
    if (invincibleTimer > 0) return false;
    reset();
    invincibleTimer = PHYSICS.invincibleTime;
    return true;
  };

  const setPaused = (p: boolean) => {
    paused = p;
    obj.paused = p;
    if (p) {
      jumpBufferTimer = 0;
    }
  };

  k.onUpdate(() => {
    const dt = k.dt();

    if (invincibleTimer > 0) {
      invincibleTimer = Math.max(0, invincibleTimer - dt);
      const blink = Math.floor(invincibleTimer * 12) % 2 === 0;
      obj.opacity = invincibleTimer > 0 ? (blink ? 0.35 : 1) : 1;
    }

    if (paused) return;

    const onGround = obj.isGrounded();

    if (onGround) {
      coyoteTimer = PHYSICS.coyoteTime;
    } else if (coyoteTimer > 0) {
      coyoteTimer = Math.max(0, coyoteTimer - dt);
    }

    if (jumpBufferTimer > 0) {
      jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);
    }

    if (jumpBufferTimer > 0 && coyoteTimer > 0) {
      obj.vel.y = -PHYSICS.jumpVel;
      jumpBufferTimer = 0;
      coyoteTimer = 0;
      isJumpHeld = true;
    }

    const left = k.isKeyDown("left") || k.isKeyDown("a");
    const right = k.isKeyDown("right") || k.isKeyDown("d");
    const dash = k.isKeyDown("shift");

    const dir = (right ? 1 : 0) + (left ? -1 : 0);
    const targetSpeed = dir * (dash ? PHYSICS.dashSpeed : PHYSICS.walkSpeed);
    const accel = onGround ? PHYSICS.groundAccel : PHYSICS.airAccel;

    if (dir !== 0) {
      const diff = targetSpeed - obj.vel.x;
      const change = Math.sign(diff) * Math.min(Math.abs(diff), accel * dt);
      obj.vel.x += change;
    } else if (onGround && obj.vel.x !== 0) {
      const change = Math.sign(obj.vel.x) * Math.min(Math.abs(obj.vel.x), PHYSICS.groundDecel * dt);
      obj.vel.x -= change;
    }
  });

  k.onKeyPress("space", () => {
    if (paused) return;
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });
  k.onKeyPress("k", () => {
    if (paused) return;
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });

  const releaseJump = () => {
    if (paused) return;
    if (isJumpHeld && obj.vel.y < 0) {
      obj.vel.y *= PHYSICS.jumpReleaseCut;
    }
    isJumpHeld = false;
  };
  k.onKeyRelease("space", releaseJump);
  k.onKeyRelease("k", releaseJump);

  const handleEnemyContact = (enemy: unknown, isInitial: boolean) => {
    if (paused) return;
    const e = enemy as EnemyLike;

    if (obj.pos.y < e.pos.y) {
      if (isInitial) {
        e.trigger("stomped");
        obj.vel.y = -STOMP_BOUNCE;
      }
      return;
    }

    if (e.stillBall) {
      if (isInitial) {
        const fromDir = e.pos.x < obj.pos.x ? 1 : -1;
        e.trigger("kicked", fromDir);
      }
      return;
    }

    damage();
  };

  k.onCollide("player", "enemy", (_p, enemy) => {
    handleEnemyContact(enemy, true);
  });
  k.onCollideUpdate("player", "enemy", (_p, enemy) => {
    handleEnemyContact(enemy, false);
  });

  return { obj, reset, damage, setPaused };
}
