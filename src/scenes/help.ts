import { EMOJI_FONT } from "../config";
import { setTouchButtonsVisible } from "../systems/touch-buttons";
import type { KCtx } from "../types";

const CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ["移動", "← / → / A / D"],
  ["ダッシュ", "Shift  (押し続けで走り)"],
  ["ジャンプ", "Space / K  (長押しで高く)"],
  ["タネ発射", "Z  (リンゴ状態のみ)"],
  ["ヘルプ", "H  (このがめん)"],
  ["タイトルへ", "Esc"],
];

const ITEMS: ReadonlyArray<readonly [string, string]> = [
  ["🌰 ドングリ", "どんぐり状態。被弾を 1 回耐える"],
  ["🍎 リンゴ", "リンゴ状態。Z でタネを撃てる"],
  ["🍃 葉っぱ", "ふわふわ落下（4 秒間）"],
  ["🫐 ベリー", "スコア +1。100 個で 1UP"],
  ["✨ きらきら花", "一定時間無敵（8 秒間）"],
  ["🐣 金のヒナ", "1UP（残機 +1）"],
];

export function registerHelpScene(k: KCtx): void {
  k.scene("help", () => {
    setTouchButtonsVisible(false);
    k.add([k.rect(k.width(), k.height()), k.color(20, 24, 40)]);

    k.add([
      k.text("そうさせつめい", { size: 44 }),
      k.pos(k.width() / 2, 50),
      k.anchor("center"),
      k.color(255, 240, 120),
    ]);

    const labelX = k.width() / 2 - 240;
    const keyX = k.width() / 2 + 20;

    k.add([k.text("[ そうさ ]", { size: 24 }), k.pos(labelX, 110), k.color(180, 220, 255)]);
    CONTROLS.forEach(([label, keys], i) => {
      const y = 150 + i * 32;
      k.add([k.text(label, { size: 22 }), k.pos(labelX, y), k.color(200, 220, 255)]);
      k.add([k.text(keys, { size: 22 }), k.pos(keyX, y), k.color(255, 255, 255)]);
    });

    k.add([k.text("[ アイテム ]", { size: 24 }), k.pos(labelX, 360), k.color(180, 220, 255)]);
    ITEMS.forEach(([label, desc], i) => {
      const y = 400 + i * 36;
      k.add([
        k.text(label, { size: 22, font: EMOJI_FONT }),
        k.pos(labelX, y),
        k.color(255, 240, 200),
      ]);
      k.add([k.text(desc, { size: 22 }), k.pos(keyX, y), k.color(220, 220, 220)]);
    });

    k.add([
      k.text("Press any key to return", { size: 20 }),
      k.pos(k.width() / 2, k.height() - 35),
      k.anchor("center"),
      k.color(160, 160, 160),
    ]);

    let initialFrameSkipped = false;
    const goBack = () => {
      if (!initialFrameSkipped) {
        initialFrameSkipped = true;
        return;
      }
      k.go("title");
    };
    k.onKeyPress(goBack);
    k.onMousePress(goBack);
    k.onUpdate(() => {
      initialFrameSkipped = true;
    });
  });
}

export function buildHelpOverlay(k: KCtx) {
  const objs: ReturnType<KCtx["add"]>[] = [];

  objs.push(
    k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.78),
      k.fixed(),
      k.z(100),
    ]),
  );

  objs.push(
    k.add([
      k.text("そうさせつめい", { size: 32 }),
      k.pos(k.width() / 2, 36),
      k.anchor("center"),
      k.color(255, 240, 120),
      k.fixed(),
      k.z(101),
    ]),
  );

  const labelX = k.width() / 2 - 220;
  const keyX = k.width() / 2 + 20;

  objs.push(
    k.add([
      k.text("[ そうさ ]", { size: 20 }),
      k.pos(labelX, 80),
      k.color(180, 220, 255),
      k.fixed(),
      k.z(101),
    ]),
  );
  CONTROLS.forEach(([label, keys], i) => {
    const y = 112 + i * 26;
    objs.push(
      k.add([
        k.text(label, { size: 18 }),
        k.pos(labelX, y),
        k.color(200, 220, 255),
        k.fixed(),
        k.z(101),
      ]),
      k.add([
        k.text(keys, { size: 18 }),
        k.pos(keyX, y),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(101),
      ]),
    );
  });

  objs.push(
    k.add([
      k.text("[ アイテム ]", { size: 20 }),
      k.pos(labelX, 290),
      k.color(180, 220, 255),
      k.fixed(),
      k.z(101),
    ]),
  );
  ITEMS.forEach(([label, desc], i) => {
    const y = 322 + i * 30;
    objs.push(
      k.add([
        k.text(label, { size: 18, font: EMOJI_FONT }),
        k.pos(labelX, y),
        k.color(255, 240, 200),
        k.fixed(),
        k.z(101),
      ]),
      k.add([
        k.text(desc, { size: 18 }),
        k.pos(keyX, y),
        k.color(220, 220, 220),
        k.fixed(),
        k.z(101),
      ]),
    );
  });

  objs.push(
    k.add([
      k.text("H をもう一度押すと閉じる", { size: 18 }),
      k.pos(k.width() / 2, k.height() - 30),
      k.anchor("center"),
      k.color(180, 180, 180),
      k.fixed(),
      k.z(101),
    ]),
  );

  return objs;
}
