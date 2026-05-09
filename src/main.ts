import kaplay from "kaplay";
import { CANVAS } from "./config";
import { registerGameoverScene } from "./scenes/gameover";
import { registerPlayScene } from "./scenes/play";
import { registerTitleScene } from "./scenes/title";

const k = kaplay({
  width: CANVAS.width,
  height: CANVAS.height,
  letterbox: true,
  pixelDensity: 1,
  crisp: true,
  background: [10, 10, 20],
  root: document.getElementById("game") ?? document.body,
});

registerTitleScene(k);
registerPlayScene(k);
registerGameoverScene(k);

k.go("title");
