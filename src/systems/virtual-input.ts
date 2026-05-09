// オンスクリーンボタン用の仮想入力ハブ。キーボードと並行して動作する。

export type VKey = "left" | "right" | "jump" | "dash" | "shoot";

const held: Record<VKey, boolean> = {
  left: false,
  right: false,
  jump: false,
  dash: false,
  shoot: false,
};

let jumpJustPressed = false;
let jumpJustReleased = false;
let shootJustPressed = false;

export function setVKeyDown(key: VKey, down: boolean): void {
  if (held[key] === down) return;
  if (key === "jump") {
    if (down) jumpJustPressed = true;
    else jumpJustReleased = true;
  }
  if (key === "shoot" && down) shootJustPressed = true;
  held[key] = down;
}

export function isVKeyDown(key: VKey): boolean {
  return held[key];
}

export function consumeVJumpPress(): boolean {
  if (jumpJustPressed) {
    jumpJustPressed = false;
    return true;
  }
  return false;
}

export function consumeVJumpRelease(): boolean {
  if (jumpJustReleased) {
    jumpJustReleased = false;
    return true;
  }
  return false;
}

export function consumeVShootPress(): boolean {
  if (shootJustPressed) {
    shootJustPressed = false;
    return true;
  }
  return false;
}

export function resetVirtualInput(): void {
  for (const key of Object.keys(held) as VKey[]) held[key] = false;
  jumpJustPressed = jumpJustReleased = shootJustPressed = false;
}
