import kaplay from "kaplay";
import { CANVAS } from "./config";
import { registerGameoverScene } from "./scenes/gameover";
import { registerHelpScene } from "./scenes/help";
import { registerPlayScene } from "./scenes/play";
import { registerTitleScene } from "./scenes/title";

// 高 DPR (Retina / モバイル) で滲まないよう、デバイスのピクセル比を採用。
// crisp: true はピクセルアート向けの最近傍補間で、絵文字 + 矩形ベースの本作では
// かえってジャギってボヤけて見えるので false にして滑らかにスケールさせる。
const k = kaplay({
  width: CANVAS.width,
  height: CANVAS.height,
  letterbox: true,
  pixelDensity: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 1,
  crisp: false,
  background: [10, 10, 20],
  root: document.getElementById("game") ?? document.body,
});

registerTitleScene(k);
registerPlayScene(k);
registerGameoverScene(k);
registerHelpScene(k);

k.go("title");
