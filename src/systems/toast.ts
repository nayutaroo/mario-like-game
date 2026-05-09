// スコア加算やイベント時に画面に「+100」「COMBO!」などを浮き上がらせるポップアップ。
// ワールド座標系で出すバージョン (敵の位置から飛ばす) と、画面固定 HUD バージョン (HUD 周辺) の両方を使える。

import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

export type ToastOpts = {
  size?: number;
  color?: [number, number, number];
  duration?: number;
  rise?: number;
  fixed?: boolean;
  z?: number;
  outline?: [number, number, number];
};

const DEFAULTS: Required<Omit<ToastOpts, "outline">> & { outline?: [number, number, number] } = {
  size: 22,
  color: [255, 240, 120],
  duration: 0.9,
  rise: 36,
  fixed: false,
  z: 70,
  outline: [40, 30, 0],
};

export function showToast(k: KCtx, x: number, y: number, text: string, opts: ToastOpts = {}) {
  const o = { ...DEFAULTS, ...opts };
  // kaplay の add() の引数型は any[] 相当 (Comp の和) なので unknown[] で組んでから渡す
  const components: unknown[] = [
    k.text(text, { size: o.size, font: EMOJI_FONT }),
    k.pos(x, y),
    k.anchor("center"),
    k.color(o.color[0], o.color[1], o.color[2]),
    k.opacity(1),
    k.z(o.z),
  ];
  if (o.fixed) components.push(k.fixed());
  if (o.outline) components.push(k.outline(2, k.rgb(o.outline[0], o.outline[1], o.outline[2])));

  // biome-ignore lint/suspicious/noExplicitAny: kaplay add() expects any[]-like Comp tuple
  const obj = k.add(components as any) as unknown as {
    pos: { x: number; y: number };
    opacity: number;
    paused: boolean;
    destroy: () => void;
    onUpdate: (cb: () => void) => void;
  };
  let elapsed = 0;
  obj.onUpdate(() => {
    if (obj.paused) return;
    const dt = k.dt();
    elapsed += dt;
    const t = Math.min(1, elapsed / o.duration);
    obj.pos.y = y - o.rise * t;
    // 後半でフェードアウト
    obj.opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    if (t >= 1) obj.destroy();
  });
  return obj;
}
