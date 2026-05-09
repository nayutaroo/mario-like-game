import { PHYSICS } from "../config";
import type { KCtx } from "../types";

const PLAYER_WIDTH = 36;
const PLAYER_HEIGHT = 44;

export function addPlayer(k: KCtx, x: number, y: number) {
  const obj = k.add([
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT),
    k.pos(x, y),
    k.color(240, 200, 60),
    k.outline(2, k.rgb(80, 50, 0)),
    k.area(),
    k.body({ jumpForce: PHYSICS.jumpVel }),
    k.anchor("bot"),
    "player",
  ]);

  let coyoteTimer = 0;
  let jumpBufferTimer = 0;
  let isJumpHeld = false;

  k.onUpdate(() => {
    const dt = k.dt();
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
      obj.jump(PHYSICS.jumpVel);
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
    const decel = onGround ? PHYSICS.groundDecel : PHYSICS.airDecel;

    if (dir !== 0) {
      const diff = targetSpeed - obj.vel.x;
      const change = Math.sign(diff) * Math.min(Math.abs(diff), accel * dt);
      obj.vel.x += change;
    } else if (obj.vel.x !== 0) {
      const change = Math.sign(obj.vel.x) * Math.min(Math.abs(obj.vel.x), decel * dt);
      obj.vel.x -= change;
    }
  });

  k.onKeyPress("space", () => {
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });
  k.onKeyPress("k", () => {
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });

  const releaseJump = () => {
    if (isJumpHeld && obj.vel.y < 0) {
      obj.vel.y *= PHYSICS.jumpReleaseCut;
    }
    isJumpHeld = false;
  };
  k.onKeyRelease("space", releaseJump);
  k.onKeyRelease("k", releaseJump);

  return {
    obj,
    reset: (rx: number, ry: number) => {
      obj.pos = k.vec2(rx, ry);
      obj.vel = k.vec2(0, 0);
      coyoteTimer = 0;
      jumpBufferTimer = 0;
      isJumpHeld = false;
    },
  };
}
