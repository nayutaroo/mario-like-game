import { resetVirtualInput, setVKeyDown, type VKey } from "../systems/virtual-input";
import type { KCtx } from "../types";

const SIZE = 96;
const SMALL = 80;
const PAD = 16;
const Z = 120;

type ButtonSpec = {
  key: VKey;
  label: string;
  x: number;
  y: number;
  size: number;
  color: [number, number, number];
};

const PRESSED_OPACITY = 0.85;
const IDLE_OPACITY = 0.35;

function makeButton(k: KCtx, spec: ButtonSpec) {
  const obj = k.add([
    k.rect(spec.size, spec.size, { radius: 14 }),
    k.pos(spec.x, spec.y),
    k.color(spec.color[0], spec.color[1], spec.color[2]),
    k.outline(2, k.rgb(20, 20, 30)),
    k.opacity(IDLE_OPACITY),
    k.area(),
    k.fixed(),
    k.z(Z),
    "touch-btn",
  ]);

  obj.add([
    k.text(spec.label, { size: 28 }),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.pos(spec.size / 2, spec.size / 2),
  ]);

  const press = () => {
    setVKeyDown(spec.key, true);
    obj.opacity = PRESSED_OPACITY;
  };
  const release = () => {
    setVKeyDown(spec.key, false);
    obj.opacity = IDLE_OPACITY;
  };

  obj.onMousePress(press);
  obj.onMouseRelease(release);
  // 指がボタン外に出た時に解放されないと押しっぱなしになるので、グローバル release も拾う
  // （シングルタッチ前提のフォールバック）

  return { obj, release };
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined") return false;
  if ("ontouchstart" in window) return true;
  if (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0) return true;
  // デバッグ用クエリ ?touch=1
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("touch") === "1") return true;
  } catch {
    // noop
  }
  return false;
}

export function addTouchButtons(k: KCtx) {
  const W = k.width();
  const H = k.height();

  const buttons: ButtonSpec[] = [
    // 左下: 方向ボタン
    {
      key: "left",
      label: "←",
      x: PAD,
      y: H - SIZE - PAD,
      size: SIZE,
      color: [80, 90, 110],
    },
    {
      key: "right",
      label: "→",
      x: PAD + SIZE + PAD,
      y: H - SIZE - PAD,
      size: SIZE,
      color: [80, 90, 110],
    },
    // 右下: アクションボタン
    {
      key: "jump",
      label: "↑",
      x: W - PAD - SIZE,
      y: H - SIZE - PAD,
      size: SIZE,
      color: [90, 140, 200],
    },
    {
      key: "dash",
      label: "DASH",
      x: W - PAD - SIZE - PAD - SMALL,
      y: H - SIZE - PAD,
      size: SMALL,
      color: [200, 130, 80],
    },
    {
      key: "shoot",
      label: "Z",
      x: W - PAD - SIZE - PAD - SMALL,
      y: H - SIZE - PAD - SMALL - PAD,
      size: SMALL,
      color: [200, 90, 130],
    },
  ];

  const handles = buttons.map((b) => makeButton(k, b));

  // シーン外（タイトル等）に戻った時に押下フラグが残らないよう、ボタン obj が破棄されたら仮想入力もクリア
  handles[0]?.obj.onDestroy(() => {
    resetVirtualInput();
  });

  return handles;
}
