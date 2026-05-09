import { EMOJI_FONT } from "../config";
import type { SemiSolidVariant } from "../levels/types";
import type { KCtx } from "../types";

// バリアントごとの色 / アウトライン / 装飾絵文字
// 通常の固体ブロックと違い「下からすり抜けられる」ことが見た目で分かるよう、
// 透明度高め＋柔らかい色を採用する（プロト段階）。
const VARIANT_STYLE: Record<
  SemiSolidVariant,
  { color: [number, number, number]; outline: [number, number, number]; emoji: string }
> = {
  cloud: { color: [240, 250, 255], outline: [180, 200, 230], emoji: "☁️" },
  branch: { color: [160, 110, 60], outline: [90, 60, 30], emoji: "🪵" },
  grass: { color: [140, 220, 120], outline: [70, 140, 70], emoji: "🌿" },
  rock: { color: [170, 160, 150], outline: [90, 80, 70], emoji: "🪨" },
};

export function addSemiSolid(
  k: KCtx,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: SemiSolidVariant = "cloud",
) {
  const style = VARIANT_STYLE[variant];
  const obj = k.add([
    k.rect(w, h),
    k.pos(x, y),
    k.color(style.color[0], style.color[1], style.color[2]),
    k.outline(2, k.rgb(style.outline[0], style.outline[1], style.outline[2])),
    k.opacity(0.85),
    k.area(),
    k.anchor("topleft"),
    "semi-solid",
  ]);

  // 高さに余裕がある場合のみ、装飾絵文字を中央に重ねる
  if (h >= 16) {
    obj.add([
      k.text(style.emoji, { size: Math.min(20, h - 2), font: EMOJI_FONT }),
      k.anchor("center"),
      k.pos(w / 2, h / 2),
    ]);
  }

  return obj;
}
