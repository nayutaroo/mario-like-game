import { EMOJI_FONT } from "../config";
import { setTouchButtonsVisible } from "../systems/touch-buttons";
import type { KCtx } from "../types";

export function registerTitleScene(k: KCtx): void {
  k.scene("title", () => {
    setTouchButtonsVisible(false);

    // 背景: 縦グラデーション風（重ねた半透明矩形でフェイク）
    k.add([k.rect(k.width(), k.height()), k.color(20, 35, 80)]);
    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      k.add([
        k.rect(k.width(), k.height() / 8),
        k.pos(0, (k.height() / 8) * i),
        k.color(40 + t * 80, 70 + t * 100, 130 + t * 80),
        k.opacity(0.35),
      ]);
    }

    // 浮遊する雲の装飾
    const cloudPositions = [
      { x: 120, y: 90 },
      { x: 1050, y: 120 },
      { x: 280, y: 540 },
      { x: 980, y: 600 },
      { x: 720, y: 80 },
    ];
    for (const cp of cloudPositions) {
      const cloud = k.add([
        k.text("☁️", { size: 56, font: EMOJI_FONT }),
        k.pos(cp.x, cp.y),
        k.opacity(0.6),
      ]);
      const baseX = cp.x;
      const baseY = cp.y;
      const phase = Math.random() * Math.PI * 2;
      cloud.onUpdate(() => {
        cloud.pos.x = baseX + Math.sin(k.time() * 0.3 + phase) * 30;
        cloud.pos.y = baseY + Math.cos(k.time() * 0.4 + phase) * 8;
      });
    }

    // タイトル影
    k.add([
      k.text("ピヨのぼうけん", { size: 76 }),
      k.pos(k.width() / 2 + 4, 200 + 4),
      k.anchor("center"),
      k.color(20, 30, 60),
      k.opacity(0.8),
    ]);
    const title = k.add([
      k.text("ピヨのぼうけん", { size: 76 }),
      k.pos(k.width() / 2, 200),
      k.anchor("center"),
      k.color(255, 240, 120),
      k.scale(1),
    ]);
    title.onUpdate(() => {
      const wave = 1 + Math.sin(k.time() * 2) * 0.02;
      title.scale = k.vec2(wave, wave);
    });

    // 主役のヒヨコ (タイトル横、ぴょこぴょこ)
    const piyo = k.add([
      k.text("🐤", { size: 96, font: EMOJI_FONT }),
      k.pos(k.width() / 2 - 230, 200),
      k.anchor("center"),
    ]);
    piyo.onUpdate(() => {
      piyo.pos.y = 200 + Math.sin(k.time() * 3) * 6;
    });

    const startGame = () => k.go("play", { stage: "1-1" });
    const openHelp = () => k.go("help");

    // START ボタン: 大きく目立つ
    const startBtn = k.add([
      k.rect(520, 76, { radius: 18 }),
      k.pos(k.width() / 2, 380),
      k.anchor("center"),
      k.color(80, 160, 220),
      k.outline(3, k.rgb(255, 255, 255)),
      k.opacity(0.9),
      k.area(),
      k.scale(1),
    ]);
    startBtn.add([
      k.text("▶ START", { size: 36 }),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.pos(0, -10),
    ]);
    startBtn.add([
      k.text("Enter / Space / Tap", { size: 16 }),
      k.anchor("center"),
      k.pos(0, 22),
      k.color(220, 240, 255),
    ]);
    startBtn.onClick(startGame);
    startBtn.onUpdate(() => {
      const pulse = 1 + Math.sin(k.time() * 3) * 0.02;
      startBtn.scale = k.vec2(pulse, pulse);
    });

    // ヘルプボタン
    const helpBtn = k.add([
      k.rect(360, 52, { radius: 14 }),
      k.pos(k.width() / 2, 480),
      k.anchor("center"),
      k.color(60, 80, 120),
      k.outline(2, k.rgb(180, 200, 230)),
      k.opacity(0.75),
      k.area(),
    ]);
    helpBtn.add([
      k.text("📖 そうさせつめい  (H)", { size: 22, font: EMOJI_FONT }),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);
    helpBtn.onClick(openHelp);

    // バージョン情報
    k.add([
      k.text("v0.1.0", { size: 14 }),
      k.pos(k.width() - 24, k.height() - 24),
      k.anchor("right"),
      k.color(180, 200, 230),
      k.opacity(0.7),
    ]);

    k.onKeyPress("enter", startGame);
    k.onKeyPress("space", startGame);
    k.onKeyPress("h", openHelp);
  });
}
