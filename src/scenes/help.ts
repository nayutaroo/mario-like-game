import type { KCtx } from "../types";

const CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ["移動", "← / → / A / D"],
  ["ダッシュ", "Shift  (押し続けで走り)"],
  ["ジャンプ", "Space / K  (長押しで高く)"],
  ["ヘルプ", "H  (このがめん)"],
  ["タイトルへ", "Esc"],
];

export function registerHelpScene(k: KCtx): void {
  k.scene("help", () => {
    k.add([k.rect(k.width(), k.height()), k.color(20, 24, 40)]);

    k.add([
      k.text("そうさせつめい", { size: 56 }),
      k.pos(k.width() / 2, 90),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    const startY = 220;
    const lineH = 56;
    const labelX = k.width() / 2 - 220;
    const keyX = k.width() / 2 + 20;

    CONTROLS.forEach(([label, keys], i) => {
      const y = startY + i * lineH;
      k.add([k.text(label, { size: 28 }), k.pos(labelX, y), k.color(200, 220, 255)]);
      k.add([k.text(keys, { size: 28 }), k.pos(keyX, y), k.color(255, 255, 255)]);
    });

    k.add([
      k.text("Press any key to return", { size: 22 }),
      k.pos(k.width() / 2, k.height() - 60),
      k.anchor("center"),
      k.color(160, 160, 160),
    ]);

    let initialFrameSkipped = false;
    k.onKeyPress(() => {
      if (!initialFrameSkipped) {
        initialFrameSkipped = true;
        return;
      }
      k.go("title");
    });
    k.onUpdate(() => {
      initialFrameSkipped = true;
    });
  });
}

export function buildHelpOverlay(k: KCtx) {
  const overlay = k.add([
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.75),
    k.fixed(),
    k.z(100),
  ]);

  const title = k.add([
    k.text("そうさせつめい", { size: 40 }),
    k.pos(k.width() / 2, 70),
    k.anchor("center"),
    k.color(255, 240, 120),
    k.fixed(),
    k.z(101),
  ]);

  const startY = 150;
  const lineH = 44;
  const labelX = k.width() / 2 - 200;
  const keyX = k.width() / 2 + 20;

  const lines = CONTROLS.flatMap(([label, keys], i) => {
    const y = startY + i * lineH;
    return [
      k.add([
        k.text(label, { size: 22 }),
        k.pos(labelX, y),
        k.color(200, 220, 255),
        k.fixed(),
        k.z(101),
      ]),
      k.add([
        k.text(keys, { size: 22 }),
        k.pos(keyX, y),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(101),
      ]),
    ];
  });

  const hint = k.add([
    k.text("H をもう一度押すと閉じる", { size: 18 }),
    k.pos(k.width() / 2, k.height() - 40),
    k.anchor("center"),
    k.color(180, 180, 180),
    k.fixed(),
    k.z(101),
  ]);

  return [overlay, title, hint, ...lines];
}
