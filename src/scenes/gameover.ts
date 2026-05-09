import type { GameoverReason, KCtx } from "../types";

const REASON_LABEL: Record<GameoverReason, string> = {
  cleared: "Stage Cleared!",
  died: "Game Over",
  timeup: "Time Up",
};

export function registerGameoverScene(k: KCtx): void {
  k.scene("gameover", (opt: { reason: GameoverReason }) => {
    k.add([k.rect(k.width(), k.height()), k.color(20, 20, 30)]);

    k.add([
      k.text(REASON_LABEL[opt.reason], { size: 80 }),
      k.pos(k.width() / 2, k.height() / 2 - 40),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    k.add([
      k.text("Press Enter to return to title", { size: 28 }),
      k.pos(k.width() / 2, k.height() / 2 + 40),
      k.anchor("center"),
      k.color(220, 220, 220),
    ]);

    k.onKeyPress("enter", () => {
      k.go("title");
    });
    k.onKeyPress("space", () => {
      k.go("title");
    });
  });
}
