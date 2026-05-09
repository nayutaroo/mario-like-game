import type { KCtx } from "../types";

export function registerTitleScene(k: KCtx): void {
  k.scene("title", () => {
    k.add([k.rect(k.width(), k.height()), k.color(30, 60, 110)]);

    k.add([
      k.text("ピヨのぼうけん", { size: 96 }),
      k.pos(k.width() / 2, k.height() / 2 - 80),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    k.add([
      k.text("Press Enter / Space to Start", { size: 32 }),
      k.pos(k.width() / 2, k.height() / 2 + 40),
      k.anchor("center"),
      k.color(220, 220, 220),
    ]);

    k.add([
      k.text("v0.0.1 — Walking Skeleton (M0)", { size: 18 }),
      k.pos(k.width() / 2, k.height() - 30),
      k.anchor("center"),
      k.color(140, 140, 140),
    ]);

    k.onKeyPress("enter", () => {
      k.go("play", { stage: "1-1" });
    });
    k.onKeyPress("space", () => {
      k.go("play", { stage: "1-1" });
    });
  });
}
