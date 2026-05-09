import { EMOJI_FONT } from "../config";
import { setTouchButtonsVisible } from "../systems/touch-buttons";
import type { GameoverReason, KCtx } from "../types";

const REASON_INFO: Record<
  GameoverReason,
  {
    label: string;
    sub: string;
    bg: [number, number, number];
    text: [number, number, number];
    icon: string;
  }
> = {
  cleared: {
    label: "STAGE CLEARED!",
    sub: "🎉 おめでとう！",
    bg: [40, 70, 30],
    text: [255, 240, 120],
    icon: "🏆",
  },
  died: {
    label: "GAME OVER",
    sub: "また挑戦してね",
    bg: [50, 20, 30],
    text: [255, 140, 140],
    icon: "💀",
  },
  timeup: {
    label: "TIME UP",
    sub: "時間切れ",
    bg: [60, 40, 20],
    text: [255, 200, 100],
    icon: "⏱",
  },
};

export function registerGameoverScene(k: KCtx): void {
  k.scene("gameover", (opt: { reason: GameoverReason }) => {
    setTouchButtonsVisible(false);
    const info = REASON_INFO[opt.reason];

    // 背景: 雰囲気に合わせた濃色 + 上下グラデーション
    k.add([k.rect(k.width(), k.height()), k.color(info.bg[0], info.bg[1], info.bg[2])]);
    for (let i = 0; i < 6; i++) {
      const alpha = 0.15 - i * 0.02;
      k.add([
        k.rect(k.width(), k.height() / 6),
        k.pos(0, (k.height() / 6) * i),
        k.color(0, 0, 0),
        k.opacity(alpha),
      ]);
    }

    // クリア時のキラキラ装飾
    if (opt.reason === "cleared") {
      const sparks = ["✨", "🌟", "💫", "⭐"];
      for (let i = 0; i < 14; i++) {
        const sx = Math.random() * k.width();
        const sy = Math.random() * k.height();
        const emoji = sparks[i % sparks.length] ?? "✨";
        const sparkle = k.add([
          k.text(emoji, { size: 24 + Math.random() * 16, font: EMOJI_FONT }),
          k.pos(sx, sy),
          k.opacity(0.7),
        ]);
        const phase = Math.random() * Math.PI * 2;
        const baseY = sy;
        sparkle.onUpdate(() => {
          sparkle.pos.y = baseY + Math.sin(k.time() * 2 + phase) * 12;
        });
      }
    }

    // 中央パネル
    const panel = k.add([
      k.rect(640, 380, { radius: 24 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(20, 28, 48),
      k.outline(3, k.rgb(info.text[0], info.text[1], info.text[2])),
      k.opacity(0.9),
    ]);

    // 大アイコン
    const icon = k.add([
      k.text(info.icon, { size: 80, font: EMOJI_FONT }),
      k.pos(k.width() / 2, k.height() / 2 - 110),
      k.anchor("center"),
      k.scale(1),
    ]);
    if (opt.reason === "cleared") {
      icon.onUpdate(() => {
        const t = 1 + Math.sin(k.time() * 4) * 0.1;
        icon.scale = k.vec2(t, t);
      });
    }

    // メインタイトル
    k.add([
      k.text(info.label, { size: 56 }),
      k.pos(k.width() / 2, k.height() / 2 - 10),
      k.anchor("center"),
      k.color(info.text[0], info.text[1], info.text[2]),
    ]);

    // サブテキスト
    k.add([
      k.text(info.sub, { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 50),
      k.anchor("center"),
      k.color(220, 220, 220),
    ]);

    // 操作ヒント
    k.add([
      k.text("Enter / Space / Tap to return to title", { size: 18 }),
      k.pos(k.width() / 2, k.height() / 2 + 110),
      k.anchor("center"),
      k.color(180, 180, 180),
    ]);

    // パネル フェードイン
    panel.opacity = 0;
    panel.onUpdate(() => {
      if (panel.opacity < 0.9) {
        panel.opacity = Math.min(0.9, panel.opacity + k.dt() * 1.6);
      }
    });

    let initialFrameSkipped = false;
    const goTitle = () => {
      if (!initialFrameSkipped) {
        initialFrameSkipped = true;
        return;
      }
      k.go("title");
    };
    k.onUpdate(() => {
      initialFrameSkipped = true;
    });
    k.onKeyPress("enter", goTitle);
    k.onKeyPress("space", goTitle);
    k.onMousePress(goTitle);
  });
}
