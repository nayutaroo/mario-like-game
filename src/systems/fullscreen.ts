// フルスクリーン API のラッパ。iOS Safari は対応外（Home に追加経由でフルスクリーン）。

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FullscreenElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function enterFullscreen(
  target: HTMLElement = document.documentElement,
): Promise<void> {
  const el = target as FullscreenElement;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    }
  } catch (_e) {
    // ユーザージェスチャ外で呼ばれた場合などは黙って失敗
  }
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch (_e) {
    // noop
  }
}

export async function toggleFullscreen(target?: HTMLElement): Promise<void> {
  if (isFullscreen()) {
    await exitFullscreen();
  } else {
    await enterFullscreen(target);
  }
}

/** index.html の #fs-btn ボタンに toggle を配線する。SSR 等でサポートが無ければ何もしない */
export function setupFullscreenButton(): void {
  if (typeof document === "undefined") return;
  const btn = document.getElementById("fs-btn") as HTMLButtonElement | null;
  if (!btn) return;
  if (!isFullscreenSupported()) {
    // 対応していない環境（典型: iOS Safari）ではボタンを隠す
    btn.style.display = "none";
    return;
  }
  btn.addEventListener("click", () => {
    void toggleFullscreen();
  });
}
