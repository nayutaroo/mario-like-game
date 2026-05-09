import { EMOJI_FONT, PHYSICS } from "../config";
import { createPyoState } from "../systems/pyo-state";
import type { ItemKind, KCtx, PlayerForm } from "../types";

const PLAYER_WIDTH = 36;
const PLAYER_HEIGHT = 44;
const STOMP_BOUNCE = 360;
// 踏みつけ判定の高さマージン: 横並びで pos.y がほぼ同値の場合に
// stomp 判定が暴発しないよう、敵の上に少なくともこの px 分プレイヤーが居ないと踏みとみなさない
const STOMP_HEIGHT_MARGIN = 12;
// 向きマーカー（くちばし）配置: プレイヤー矩形の外側、上半分
const FACING_MARKER_OFFSET_X = PLAYER_WIDTH / 2 + 3;
const FACING_MARKER_Y = -PLAYER_HEIGHT * 0.55;

const SEED_COOLDOWN = 0.3;
const LEAF_DURATION = 4.0;
const LEAF_MAX_FALL = 120;
const SPARKLE_DURATION = 8.0;
const DYING_DURATION = 0.9;
const DYING_POP_VEL = 650;
const DYING_COLOR: [number, number, number] = [220, 60, 60];

type EnemyLike = {
  pos: { x: number; y: number };
  stillBall?: boolean;
  kickGrace?: number;
  trigger: (event: string, ...args: unknown[]) => void;
};

const FORM_COLORS: Record<PlayerForm, [number, number, number]> = {
  normal: [240, 200, 60],
  acorn: [200, 150, 80],
  apple: [220, 90, 90],
};

export type PlayerCallbacks = {
  onReset?: () => void;
  onLifeLost?: () => void;
  onSeedFire?: (x: number, y: number, dir: -1 | 1) => void;
  onLifeUp?: () => void;
  onBerryCollect?: () => void;
  // play.ts が「現在のリスポーン位置」(チェックポイント or スポーン) を返す
  getRespawnPos?: () => { x: number; y: number };
};

export function addPlayer(
  k: KCtx,
  spawnX: number,
  spawnY: number,
  callbacks: PlayerCallbacks = {},
) {
  const obj = k.add([
    k.rect(PLAYER_WIDTH, PLAYER_HEIGHT),
    k.pos(spawnX, spawnY),
    k.color(FORM_COLORS.normal[0], FORM_COLORS.normal[1], FORM_COLORS.normal[2]),
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

  const facingMarker = obj.add([
    k.rect(5, 8),
    k.color(255, 130, 60),
    k.outline(1, k.rgb(120, 50, 0)),
    k.anchor("center"),
    k.pos(FACING_MARKER_OFFSET_X, FACING_MARKER_Y),
  ]);

  const state = createPyoState();

  let coyoteTimer = 0;
  let jumpBufferTimer = 0;
  let isJumpHeld = false;
  let invincibleTimer = 0;
  let sparkleTimer = 0;
  let leafTimer = 0;
  let seedCooldown = 0;
  let dyingTimer = 0;
  let facing: -1 | 1 = 1;
  let paused = false;

  const isLocked = () => paused || dyingTimer > 0;

  const updateFormVisual = () => {
    const [r, g, b] = FORM_COLORS[state.form()];
    obj.color = k.rgb(r, g, b);
  };

  const reset = (rx: number = spawnX, ry: number = spawnY) => {
    obj.pos = k.vec2(rx, ry);
    obj.vel = k.vec2(0, 0);
    coyoteTimer = 0;
    jumpBufferTimer = 0;
    isJumpHeld = false;
    invincibleTimer = 0;
    sparkleTimer = 0;
    leafTimer = 0;
    seedCooldown = 0;
    dyingTimer = 0;
    obj.opacity = 1;
    state.reset();
    updateFormVisual();
    callbacks.onReset?.();
  };

  const damage = (): boolean => {
    if (invincibleTimer > 0 || sparkleTimer > 0 || dyingTimer > 0) return false;
    const outcome = state.apply("DAMAGE");
    if (outcome === "died") {
      callbacks.onLifeLost?.();
      dyingTimer = DYING_DURATION;
      obj.vel = k.vec2(0, -DYING_POP_VEL);
      obj.color = k.rgb(DYING_COLOR[0], DYING_COLOR[1], DYING_COLOR[2]);
      jumpBufferTimer = 0;
      coyoteTimer = 0;
      isJumpHeld = false;
      return true;
    }
    invincibleTimer = PHYSICS.invincibleTime;
    updateFormVisual();
    return true;
  };

  const takeItem = (kind: ItemKind) => {
    switch (kind) {
      case "acorn":
        state.apply("TAKE_ACORN");
        updateFormVisual();
        return;
      case "apple":
        state.apply("TAKE_APPLE");
        updateFormVisual();
        return;
      case "leaf":
        leafTimer = LEAF_DURATION;
        return;
      case "berry":
        callbacks.onBerryCollect?.();
        return;
      case "sparkle":
        sparkleTimer = SPARKLE_DURATION;
        return;
      case "gold-chick":
        callbacks.onLifeUp?.();
        return;
    }
  };

  const setPaused = (p: boolean) => {
    paused = p;
    obj.paused = p;
    if (p) jumpBufferTimer = 0;
  };

  k.onUpdate(() => {
    const dt = k.dt();

    if (dyingTimer > 0) {
      dyingTimer = Math.max(0, dyingTimer - dt);
      const blink = Math.floor(dyingTimer * 18) % 2 === 0;
      obj.opacity = blink ? 0.3 : 1;
      if (dyingTimer === 0) {
        const pos = callbacks.getRespawnPos?.();
        if (pos) reset(pos.x, pos.y);
        else reset();
      }
      return;
    }

    if (invincibleTimer > 0) {
      invincibleTimer = Math.max(0, invincibleTimer - dt);
      const blink = Math.floor(invincibleTimer * 12) % 2 === 0;
      obj.opacity = invincibleTimer > 0 ? (blink ? 0.35 : 1) : 1;
    }

    if (sparkleTimer > 0) {
      sparkleTimer = Math.max(0, sparkleTimer - dt);
      const palette: Array<[number, number, number]> = [
        [255, 240, 120],
        [255, 200, 200],
        [200, 255, 200],
        [200, 220, 255],
        [255, 200, 255],
        [255, 255, 255],
      ];
      const phase = Math.floor(sparkleTimer * 6) % palette.length;
      const c = palette[phase] ?? palette[0];
      if (c) obj.color = k.rgb(c[0], c[1], c[2]);
      if (sparkleTimer === 0) updateFormVisual();
    }

    if (leafTimer > 0) {
      leafTimer = Math.max(0, leafTimer - dt);
      if (obj.vel.y > 0) {
        obj.vel.y = Math.min(obj.vel.y, LEAF_MAX_FALL);
      }
    }

    if (seedCooldown > 0) seedCooldown = Math.max(0, seedCooldown - dt);

    if (paused) return;

    const onGround = obj.isGrounded();

    if (onGround) coyoteTimer = PHYSICS.coyoteTime;
    else if (coyoteTimer > 0) coyoteTimer = Math.max(0, coyoteTimer - dt);

    if (jumpBufferTimer > 0) jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);

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
    if (dir === 1) facing = 1;
    else if (dir === -1) facing = -1;
    facingMarker.pos.x = facing * FACING_MARKER_OFFSET_X;

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
    if (isLocked()) return;
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });
  k.onKeyPress("k", () => {
    if (isLocked()) return;
    jumpBufferTimer = PHYSICS.jumpBufferTime;
  });

  const releaseJump = () => {
    if (isLocked()) return;
    if (isJumpHeld && obj.vel.y < 0) obj.vel.y *= PHYSICS.jumpReleaseCut;
    isJumpHeld = false;
  };
  k.onKeyRelease("space", releaseJump);
  k.onKeyRelease("k", releaseJump);

  k.onKeyPress("z", () => {
    if (isLocked()) return;
    if (state.form() !== "apple") return;
    if (seedCooldown > 0) return;
    callbacks.onSeedFire?.(obj.pos.x, obj.pos.y - PLAYER_HEIGHT / 2, facing);
    seedCooldown = SEED_COOLDOWN;
  });

  const handleEnemyContact = (enemy: unknown, isInitial: boolean) => {
    if (isLocked()) return;
    const e = enemy as EnemyLike;

    if (sparkleTimer > 0) {
      if (isInitial) e.trigger("stomped");
      return;
    }

    if (obj.pos.y < e.pos.y - STOMP_HEIGHT_MARGIN) {
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

    if ((e.kickGrace ?? 0) > 0) return;

    damage();
  };

  k.onCollide("player", "enemy", (_p, enemy) => {
    handleEnemyContact(enemy, true);
  });
  k.onCollideUpdate("player", "enemy", (_p, enemy) => {
    handleEnemyContact(enemy, false);
  });

  k.onCollide("player", "item", (_p, item) => {
    if (isLocked()) return;
    const kind = (item as { kind?: ItemKind }).kind;
    if (kind) takeItem(kind);
    item.destroy();
  });

  return {
    obj,
    reset,
    damage,
    setPaused,
    takeItem,
    form: state.form,
    facing: () => facing,
  };
}
