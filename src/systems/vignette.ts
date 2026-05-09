// 画面隅を暗くする簡易ビネット。
// kaplay は CSS の radial-gradient と直接連動できないため、半透明の矩形を上下左右
// + 四隅に重ねて疑似的に作る。重ねるレイヤー数を減らしつつ、コントラスト感が出るよう
// グラデっぽく見える 4 段重ね構成にする。

import type { KCtx } from "../types";

export function addVignette(k: KCtx) {
  // 上下左右の枠 (それぞれ画面の 12% を覆う柔らかい影)
  const w = k.width();
  const h = k.height();
  const objs: ReturnType<KCtx["add"]>[] = [];

  // 4 隅: 角ごとに小さな黒矩形を 3 段に重ねて柔らかい角影に
  const cornerLayers: Array<{ size: number; opacity: number }> = [
    { size: 220, opacity: 0.18 },
    { size: 140, opacity: 0.18 },
    { size: 80, opacity: 0.18 },
  ];
  const corners: Array<[number, number, "tl" | "tr" | "bl" | "br"]> = [
    [0, 0, "tl"],
    [w, 0, "tr"],
    [0, h, "bl"],
    [w, h, "br"],
  ];
  for (const layer of cornerLayers) {
    for (const [cx, cy, _kind] of corners) {
      const px = cx === 0 ? 0 : cx - layer.size;
      const py = cy === 0 ? 0 : cy - layer.size;
      objs.push(
        k.add([
          k.rect(layer.size, layer.size),
          k.pos(px, py),
          k.color(0, 0, 0),
          k.opacity(layer.opacity),
          k.fixed(),
          k.z(80),
          "vignette",
        ]),
      );
    }
  }

  // 上下のうっすらバンド（HUD/タッチボタン周辺の視認性確保のため上下に少しだけ）
  objs.push(
    k.add([
      k.rect(w, 80),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.15),
      k.fixed(),
      k.z(79),
      "vignette",
    ]),
  );
  objs.push(
    k.add([
      k.rect(w, 100),
      k.pos(0, h - 100),
      k.color(0, 0, 0),
      k.opacity(0.18),
      k.fixed(),
      k.z(79),
      "vignette",
    ]),
  );

  return objs;
}
