// HTML/Pointer Events ベースのオンスクリーンボタン。
// 旧実装 (kaplay onMousePress) はマウス互換でシングルポインタしか追跡できず、
// 「移動しながらジャンプ」等のマルチタッチが効かなかったため DOM ベースに変更。

import { resetVirtualInput, setVKeyDown, type VKey } from "./virtual-input";

type ButtonDef = {
  key: VKey;
  label: string;
  group: "left" | "right";
  size?: "normal" | "large";
};

const BUTTONS: ButtonDef[] = [
  // 左下: 方向ボタン
  { key: "left", label: "←", group: "left" },
  { key: "right", label: "→", group: "left" },
  // 右下: アクション
  { key: "shoot", label: "Z", group: "right" },
  { key: "dash", label: "DASH", group: "right" },
  { key: "jump", label: "↑", group: "right", size: "large" },
];

let containerEl: HTMLDivElement | null = null;

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined") return false;
  if ("ontouchstart" in window) return true;
  if (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("touch") === "1") return true;
  } catch {
    // noop
  }
  return false;
}

function createButton(def: ButtonDef): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `touch-btn touch-btn-${def.size ?? "normal"}`;
  btn.dataset.key = def.key;
  btn.textContent = def.label;
  btn.setAttribute("aria-label", def.key);

  // pointerdown: そのボタンの押下を仮想入力に反映 + ポインタを capture して
  // 指がボタン外にスライドしても release が必ず届くようにする
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.classList.add("is-pressed");
    try {
      btn.setPointerCapture(e.pointerId);
    } catch {
      // 一部環境で setPointerCapture が失敗してもキー入力自体は通す
    }
    setVKeyDown(def.key, true);
  });

  const release = (e: PointerEvent) => {
    btn.classList.remove("is-pressed");
    try {
      btn.releasePointerCapture(e.pointerId);
    } catch {
      // noop
    }
    setVKeyDown(def.key, false);
  };
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  // 念のため: ブラウザによっては capture 後でも leave が来ることがあるので保険
  btn.addEventListener("lostpointercapture", release);

  return btn;
}

export function setupTouchButtons(): void {
  if (typeof document === "undefined") return;
  if (containerEl) return;

  const container = document.createElement("div");
  container.id = "touch-buttons";
  container.style.display = "none";

  const leftPad = document.createElement("div");
  leftPad.className = "touch-pad touch-pad-left";
  const rightPad = document.createElement("div");
  rightPad.className = "touch-pad touch-pad-right";

  for (const def of BUTTONS) {
    const btn = createButton(def);
    if (def.group === "left") leftPad.appendChild(btn);
    else rightPad.appendChild(btn);
  }

  container.appendChild(leftPad);
  container.appendChild(rightPad);
  document.body.appendChild(container);

  containerEl = container;
}

export function setTouchButtonsVisible(visible: boolean): void {
  if (!containerEl) return;
  containerEl.style.display = visible ? "" : "none";
  if (!visible) {
    // 非表示にするタイミングで押下中のフラグもクリア（誤って押しっぱなしにならない保険）
    resetVirtualInput();
    for (const el of containerEl.querySelectorAll(".is-pressed")) {
      el.classList.remove("is-pressed");
    }
  }
}
