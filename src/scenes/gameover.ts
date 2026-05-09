import { setTouchButtonsVisible } from "../systems/touch-buttons";
import type { GameoverReason, KCtx } from "../types";

const REASON_LABEL: Record<GameoverReason, string> = {
  cleared: "Stage Cleared!",
  died: "Game Over",
  timeup: "Time Up",
};

export function registerGameoverScene(k: KCtx): void {
  k.scene("gameover", (opt: { reason: GameoverReason }) => {
    setTouchButtonsVisible(false);
    k.add([k.rect(k.width(), k.height()), k.color(20, 20, 30)]);

    k.add([
      k.text(REASON_LABEL[opt.reason], { size: 80 }),
      k.pos(k.width() / 2, k.height() / 2 - 40),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    k.add([
      k.text("Press Enter / Tap to return to title", { size: 26 }),
      k.pos(k.width() / 2, k.height() / 2 + 40),
      k.anchor("center"),
      k.color(220, 220, 220),
    ]);

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
