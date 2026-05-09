import type { KCtx } from "../types";

export function registerTitleScene(k: KCtx): void {
  k.scene("title", () => {
    k.add([k.rect(k.width(), k.height()), k.color(30, 60, 110)]);

    k.add([
      k.text("ピヨのぼうけん", { size: 72 }),
      k.pos(k.width() / 2, 220),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    k.add([
      k.text("Press Enter / Space to Start", { size: 28 }),
      k.pos(k.width() / 2, 380),
      k.anchor("center"),
      k.color(220, 220, 220),
    ]);

    k.add([
      k.text("H : そうさせつめい", { size: 22 }),
      k.pos(k.width() / 2, 440),
      k.anchor("center"),
      k.color(180, 200, 230),
    ]);

    k.add([
      k.text("v0.0.2 — M2", { size: 18 }),
      k.pos(k.width() / 2, k.height() - 30),
      k.anchor("center"),
      k.color(140, 140, 140),
    ]);

    const startGame = () => k.go("play", { stage: "1-1" });
    k.onKeyPress("enter", startGame);
    k.onKeyPress("space", startGame);
    k.onKeyPress("h", () => k.go("help"));
  });
}
