import { setTouchButtonsVisible } from "../systems/touch-buttons";
import type { KCtx } from "../types";

export function registerTitleScene(k: KCtx): void {
  k.scene("title", () => {
    setTouchButtonsVisible(false);
    k.add([k.rect(k.width(), k.height()), k.color(30, 60, 110)]);

    k.add([
      k.text("ピヨのぼうけん", { size: 72 }),
      k.pos(k.width() / 2, 220),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    const startGame = () => k.go("play", { stage: "1-1" });
    const openHelp = () => k.go("help");

    // タップ可能な START ボタン（キーボード操作と並行）
    const startBtn = k.add([
      k.rect(560, 64, { radius: 14 }),
      k.pos(k.width() / 2, 380),
      k.anchor("center"),
      k.color(60, 100, 160),
      k.outline(2, k.rgb(140, 180, 220)),
      k.opacity(0.7),
      k.area(),
    ]);
    startBtn.add([
      k.text("▶ TAP / Enter / Space to Start", { size: 24 }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);
    startBtn.onClick(startGame);

    // タップ可能なヘルプボタン
    const helpBtn = k.add([
      k.rect(360, 48, { radius: 12 }),
      k.pos(k.width() / 2, 460),
      k.anchor("center"),
      k.color(60, 80, 110),
      k.outline(2, k.rgb(140, 180, 220)),
      k.opacity(0.55),
      k.area(),
    ]);
    helpBtn.add([
      k.text("H : そうさせつめい", { size: 22 }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);
    helpBtn.onClick(openHelp);

    k.add([
      k.text("v0.0.2 — M2", { size: 18 }),
      k.pos(k.width() / 2, k.height() - 30),
      k.anchor("center"),
      k.color(140, 140, 140),
    ]);

    k.onKeyPress("enter", startGame);
    k.onKeyPress("space", startGame);
    k.onKeyPress("h", openHelp);
  });
}
