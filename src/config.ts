export const CANVAS = {
  width: 1280,
  height: 720,
  tile: 32,
} as const;

export const PHYSICS = {
  gravity: 1800,

  walkSpeed: 180,
  dashSpeed: 320,
  groundAccel: 1200,
  airAccel: 900,
  groundDecel: 1500,
  airDecel: 600,

  jumpVel: 620,
  jumpReleaseCut: 0.4,
  jumpBufferTime: 0.1,
  coyoteTime: 0.08,

  invincibleTime: 1.5,
} as const;

export const STORAGE_KEYS = {
  highscore: "piyo-game:highscore",
} as const;

export const EMOJI_FONT = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
