// ボス専用 HP バー UI。
// - 上部中央にゲージバーとタイトル「ヌシイモ」
// - HP 段階で色変化 (緑 → 黄 → 赤)
// - 残り HP 1 のとき "ピンチ!!" タグを表示
// - ダメージ受けたタイミングで短くシェイク + フラッシュ

import { EMOJI_FONT } from "../config";
import type { KCtx } from "../types";

export type BossHpBarHandle = {
  setHp(hp: number): void;
  setSeedProgress(hits: number, max: number): void;
  flashDamage(): void;
  setDefeated(): void;
  destroy(): void;
};

const BAR_WIDTH = 360;
const BAR_HEIGHT = 22;
const BAR_PAD = 4;

export function createBossHpBar(k: KCtx, maxHp: number): BossHpBarHandle {
  const objs: ReturnType<KCtx["add"]>[] = [];
  const cx = k.width() / 2;
  const topY = 14;

  // タイトル「BOSS ヌシイモ」
  const title = k.add([
    k.text("BOSS  ヌシイモ", { size: 18, font: EMOJI_FONT }),
    k.pos(cx, topY),
    k.anchor("center"),
    k.color(255, 230, 200),
    k.fixed(),
    k.z(62),
  ]);
  objs.push(title);

  // 状態タグ (ピンチ / 撃破)
  const tag = k.add([
    k.text("", { size: 14, font: EMOJI_FONT }),
    k.pos(cx + BAR_WIDTH / 2 + 14, topY + 24),
    k.anchor("left"),
    k.color(255, 120, 120),
    k.fixed(),
    k.z(63),
    k.opacity(0),
  ]);
  objs.push(tag);

  // 外枠 (薄いグレー枠)
  const frameX = cx - BAR_WIDTH / 2 - BAR_PAD;
  const frameY = topY + 10;
  const frame = k.add([
    k.rect(BAR_WIDTH + BAR_PAD * 2, BAR_HEIGHT + BAR_PAD * 2, { radius: 6 }),
    k.pos(frameX, frameY),
    k.color(20, 20, 28),
    k.opacity(0.7),
    k.outline(2, k.rgb(255, 230, 200)),
    k.fixed(),
    k.z(61),
  ]);
  objs.push(frame);

  // 背景 (空ゲージ)
  const trackX = cx - BAR_WIDTH / 2;
  const trackY = topY + 10 + BAR_PAD;
  const track = k.add([
    k.rect(BAR_WIDTH, BAR_HEIGHT, { radius: 4 }),
    k.pos(trackX, trackY),
    k.color(40, 30, 30),
    k.opacity(0.85),
    k.fixed(),
    k.z(62),
  ]);
  objs.push(track);

  // 実 HP ゲージ
  const fill = k.add([
    k.rect(BAR_WIDTH, BAR_HEIGHT, { radius: 4 }),
    k.pos(trackX, trackY),
    k.color(120, 220, 110),
    k.fixed(),
    k.z(63),
  ]);
  objs.push(fill);

  // 種 (seed) チャージインジケータ: HP バー下に薄く表示
  const seedTrack = k.add([
    k.rect(BAR_WIDTH, 4, { radius: 2 }),
    k.pos(trackX, trackY + BAR_HEIGHT + 4),
    k.color(40, 40, 60),
    k.opacity(0.7),
    k.fixed(),
    k.z(62),
  ]);
  objs.push(seedTrack);
  const seedFill = k.add([
    k.rect(0, 4, { radius: 2 }),
    k.pos(trackX, trackY + BAR_HEIGHT + 4),
    k.color(220, 200, 255),
    k.opacity(0.9),
    k.fixed(),
    k.z(63),
  ]);
  objs.push(seedFill);

  // ダメージフラッシュ用の白いオーバーレイ
  const flashLayer = k.add([
    k.rect(BAR_WIDTH, BAR_HEIGHT, { radius: 4 }),
    k.pos(trackX, trackY),
    k.color(255, 255, 255),
    k.opacity(0),
    k.fixed(),
    k.z(64),
  ]);
  objs.push(flashLayer);

  let flashTimer = 0;
  let shakeTimer = 0;
  let pinchActive = false;

  const updateColor = (hp: number) => {
    const ratio = hp / maxHp;
    if (ratio > 0.66)
      fill.color = k.rgb(120, 220, 110); // 緑
    else if (ratio > 0.33)
      fill.color = k.rgb(240, 210, 90); // 黄
    else fill.color = k.rgb(230, 80, 90); // 赤
  };

  const setPinch = (on: boolean) => {
    if (pinchActive === on) return;
    pinchActive = on;
    tag.text = on ? "⚠ ピンチ!!" : "";
    tag.opacity = on ? 1 : 0;
    tag.color = k.rgb(255, 120, 120);
  };

  // 全体の onUpdate (フラッシュ・シェイク・ピンチ点滅)
  k.onUpdate(() => {
    if (track.paused) return;
    const dt = k.dt();

    if (flashTimer > 0) {
      flashTimer = Math.max(0, flashTimer - dt);
      flashLayer.opacity = (flashTimer / 0.25) * 0.65;
    }

    let offsetX = 0;
    if (shakeTimer > 0) {
      shakeTimer = Math.max(0, shakeTimer - dt);
      offsetX = Math.sin(shakeTimer * 50) * 4;
    }
    frame.pos.x = frameX + offsetX;
    track.pos.x = trackX + offsetX;
    fill.pos.x = trackX + offsetX;
    flashLayer.pos.x = trackX + offsetX;

    if (pinchActive) {
      const blink = Math.floor(k.time() * 4) % 2 === 0;
      tag.opacity = blink ? 1 : 0.4;
    }
  });

  return {
    setHp(hp) {
      const ratio = Math.max(0, Math.min(1, hp / maxHp));
      fill.width = BAR_WIDTH * ratio;
      updateColor(Math.max(0, hp));
      setPinch(hp === 1);
    },
    setSeedProgress(hits, max) {
      const ratio = Math.max(0, Math.min(1, hits / max));
      seedFill.width = BAR_WIDTH * ratio;
    },
    flashDamage() {
      flashTimer = 0.25;
      shakeTimer = 0.2;
    },
    setDefeated() {
      setPinch(false);
      tag.text = "撃破!";
      tag.opacity = 1;
      tag.color = k.rgb(255, 240, 120);
      title.color = k.rgb(255, 240, 120);
    },
    destroy() {
      for (const o of objs) o.destroy();
    },
  };
}
