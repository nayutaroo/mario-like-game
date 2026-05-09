# implementation-plan — 実装の進め方

`docs/specification/` の確定仕様と `architecture.md` のアーキテクチャを、**どの順で実装に落とすか**をまとめる軽量ロードマップ。

## 基本戦略

- **【確定】** Walking Skeleton 方式。最初に「タイトル → 1 ステージ → ゲームオーバー」の縦串を最小コストで通し、以降はマイルストーンごとに機能を積む
- **【確定】** マイルストーンごとに動く成果物を残す。各 M の **DoD（動作確認できる状態）** を明文化する
- **【確定】** プロトタイプ段階のグラフィックは色付き矩形で進める。スプライト差し替えは M1 後半以降

## 進捗サマリ

凡例:
- ✅ 完了（DoD 達成済み）
- 〜 進行中（着手済み・DoD 未達）
- ⬜ 未着手

| マイルストーン | 状態 | 完了日 |
| --- | --- | --- |
| M0 Walking Skeleton | ✅ 完了 | 2026-05-09 |
| M1 プレイヤー基本アクション | ✅ 完了 | 2026-05-09 |
| M2 敵と戦闘 | ✅ 完了 | 2026-05-09 |
| M3 アイテムと状態機械 | 〜 進行中 | — |
| M4 レベル拡充と中間ポイント | ⬜ 未着手 | — |
| M5 ボス面 | ⬜ 未着手 | — |
| M6 隠しエリア・ボーナス面 | ⬜ 未着手 | — |
| M7 仕上げ | ⬜ 未着手 | — |

各マイルストーンの詳細チェックリストは下記。完了項目は `[x]` でマーク。実装中に出たバグや改善要望は各 M の末尾「補足」に追記する。

## マイルストーン

### M0 — Walking Skeleton ✅

**目標**: ローカルとデプロイ環境の両方で、ゲームの最小ループが回ることを確認する。

- [x] `package.json` / `tsconfig.json` / `vite.config.ts` / `biome.json` / `index.html` の生成
- [x] `src/main.ts` で Kaboom（KAPLAY）を初期化、`title` シーン → `play` シーン → `gameover` シーンの遷移を実装
- [x] `play` シーンに矩形プレイヤー、矩形地面、画面右端の「ゴール矩形」だけ配置。ゴール接触で `gameover` へ
- [x] GitHub Actions ワークフロー作成、`main` push で GitHub Pages にデプロイ
- [x] `npm audit` がクリーン、`npm run typecheck` が通る

**DoD**: GitHub Pages の URL を開くとタイトルが出て、Enter で1秒で終わる play シーンに入り、gameover を経てタイトルに戻る。

**補足**:
- canvas が小さく表示される問題 → `index.html` の `#game` に `100vw × 100vh` を指定して解決
- ヘルプシーンを M0 段階で先取り実装

### M1 — プレイヤー基本アクション ✅

**目標**: ピヨを動かせる。

- [x] 左右移動（歩き / ダッシュ）
- [x] 可変高度ジャンプ
- [x] 地形ブロック（壊せない）との AABB コリジョン
- [x] 落下死（Y > 画面外）でリスポーン
- [x] カメラの横スクロール追従、左方向巻き戻しなし
- [ ] 壊せるブロック（M3 以降に持ち越し）
- [ ] プロトタイプ用ドット絵（待機 / 歩行 / ジャンプ）に差し替え（M7 仕上げに持ち越し）

**DoD**: 矩形敵なしの 1-1 風レベルで、走り・ジャンプ・落下死がすべて期待通り動く。

**補足**:
- ジャンプ時の横慣性消失 → 空中の deceleration を撤廃して解決
- ジャンプ中に vel.x が 0 になる → `obj.jump()` を使わず `obj.vel.y = -...` を直接代入で解決
- 落下死後にカメラが追従しない → reset 時にカメラもスナップ（onReset コールバック）

### M2 — 敵と戦闘 ✅

**目標**: 踏みつけ・蹴り・接触ダメージのコアが揃う。

- [x] イモムシ（直進 + 壁反転、踏みで死亡、横接触でダメージ）
- [x] ダンゴムシ（踏みで丸まり、再蹴りで弾丸転がり）
- [x] コバチ（飛行直進、踏みで死亡）
- [x] プレイヤー被ダメージ → 短時間無敵点滅
- [x] ノーマル状態で被ダメージ → 死亡 → リスポーン
- [ ] パワーアップ状態の段階下げ（M3 で実装）

**DoD**: 3 種類の敵が混在する 1-1 風レベルでクリアまで通せる。

**補足**:
- 敵を踏んでも倒せない → 位置ベース判定（player.pos.y < enemy.pos.y）に変更して解決
- 無敵明け後に重なり続けるとダメージが入らない → `onCollideUpdate` で常時判定に変更して解決
- ヘルプ中の操作禁止: `setPaused(true)` で player と全 enemy を pause
- 矩形プロトのキャラ識別性 → 各エンティティに絵文字ラベル子オブジェクト（🐤/🐛/🐞/🐝）を追加。`config.ts` の `EMOJI_FONT` で OS 横断のフォールバック指定
- 丸まりダンゴ蹴り出し時に同フレームでダメージが入る → `kicked` 直後に 0.12s のキック猶予タイマー（`kickGrace`）をダンゴに持たせ、その間プレイヤー側はダメージ判定をスキップ

### M3 — アイテムと状態機械

**目標**: パワーアップ、無敵、1UP、種攻撃が揃う。

- [ ] ドングリ取得 → どんぐり状態
- [ ] リンゴ取得 → リンゴ状態 + 種発射（Z キー）
- [ ] 葉っぱ取得 → 一定時間ふわふわ落下
- [ ] ベリー取得 → スコア+1、100 でライフ+1
- [ ] きらきら花取得 → 一定時間無敵（点滅 + 接触で敵を倒せる）
- [ ] 金のヒナ取得 → ライフ+1
- [ ] HUD（スコア・ベリー数・残機・制限時間）

**DoD**: 各アイテムが意図通り動き、HUD が正しく更新される。リンゴ状態で種を撃ってイモムシを倒せる。

### M4 — レベル拡充と中間ポイント

**目標**: 1-1〜1-4 の通常面が遊べる。

- [ ] レベルデータ（JSON または ASCII）形式の確定
- [ ] 1-1 草原 / 1-2 森 / 1-3 洞窟 / 1-4 空（縦スクロール採用面）
- [ ] 各面に光の鳥居（中間ポイント）配置とリスポーン処理
- [ ] 各面のゴール（光の輪）配置とクリア処理 → 次面へ遷移
- [ ] 制限時間カウントダウン → 0 でミス

**DoD**: 1-1 → 1-4 を順に通せ、ミス時は中間ポイント以降からリスポーンする。

### M5 — ボス面（1-5）

**目標**: ボス戦が成立する。

- [ ] ボス「ヌシイモ」エンティティ実装（HP 3、移動 → ジャンプ叩きつけ → 隙の有限状態機械）
- [ ] 踏みで HP -1、種 5 発で HP -1
- [ ] HP 0 で撃破演出 → クリア画面
- [ ] ボス HP HUD 追加

**DoD**: 1-5 城ステージでボスを撃破するとクリア画面が表示される。

### M6 — 隠しエリア・ボーナス面

**目標**: 探索要素が動く。

- [ ] 隠しブロック / 隠し通路の配置（最低 2 ステージ）
- [ ] 隠しエリアからボーナス面へのワープ
- [ ] ボーナス面「木の実の部屋」の実装（敵なし、短時間でベリー＋金のヒナ収集）
- [ ] ボーナス面終了 → 元ステージの次の通常面へ復帰

**DoD**: 1-1 や 1-3 から隠しエリア経由でボーナス面に行き、戻って続行できる。

### M7 — 仕上げ

**目標**: 公開可能な状態にする。

- [ ] ハイスコアの localStorage 保存・タイトルでの表示
- [ ] ポーズ画面（Esc / P で表示・解除）
- [ ] ゲームオーバー画面・クリア画面の体裁
- [ ] アセットの本番版差し替え（プロトタイプ → 実ドット絵）
- [ ] バランス調整（速度・重力・敵配置・制限時間）
- [ ] README.md（プレイ手順・操作説明・URL）作成

**DoD**: 知り合いに URL を渡してプレイしてもらえる品質。

## チューニング初期値（M1 で利用）

すべて `src/config.ts` の定数として置く。M7 の最終調整で更新する。

| 項目 | 値 | 単位 | 備考 |
| --- | --- | --- | --- |
| 重力 | 1800 | px/s² | Kaboom の `setGravity` |
| 歩き最高速度 | 180 | px/s |  |
| ダッシュ最高速度 | 320 | px/s | Shift 押下時 |
| 移動加速度 | 1200 | px/s² |  |
| 移動減速度（地上） | 1500 | px/s² | 摩擦 |
| 移動減速度（空中） | 600 | px/s² | 慣性強め |
| ジャンプ初速 | 620 | px/s | 押し続けで滞空時間延長 |
| 可変ジャンプ最大保持 | 0.18 | s | キーリリース後は重力フル適用 |
| ジャンプ先行入力バッファ | 0.10 | s |  |
| コヨーテタイム | 0.08 | s | 落下開始後もこの間はジャンプ可 |
| プレイヤー被弾無敵 | 1.5 | s | 点滅表示 |
| きらきら花無敵時間 | 8.0 | s |  |
| 葉っぱ滞空時間 | 4.0 | s | ふわふわ落下 |
| 種の発射速度 | 480 | px/s |  |
| 制限時間（通常面） | 300 | カウント | 1 カウント ≒ 0.4s |
| 残機初期値 | 3 |  |  |
| ボス HP | 3 |  | 踏み 3 回 |
| 種ヒットでボス HP -1 換算 | 5 発 |  |  |

## モジュール公開 API（要約）

`src/` 配下の主要ファイルの export 想定。最終的な命名・分割は実装段階で微調整可。

### `src/main.ts`
- 副作用のみ（Kaboom 初期化、シーン登録、最初のシーン起動）

### `src/config.ts`
- `export const CANVAS = { width: 1280, height: 720, tile: 32 } as const`
- `export const PHYSICS = { ... }` … 上記チューニング値
- `export const KEYS = { left, right, jump, dash, shoot, pause }` … キーバインド
- `export const STORAGE_KEYS = { highscore: "piyo-game:highscore" } as const`

### `src/types.ts`
- `export type StageId = "1-1" | "1-2" | "1-3" | "1-4" | "1-5" | "bonus-1"`
- `export type PlayerForm = "normal" | "acorn" | "apple"`
- `export type ItemKind = "acorn" | "apple" | "leaf" | "berry" | "sparkle" | "gold-chick"`
- `export type EnemyKind = "imomushi" | "dangomushi" | "kobachi" | "boss"`

### `src/scenes/*.ts`
- 各ファイルが `registerXxxScene(k: KaboomCtx): void` を default export
- `play.ts` の opt 型: `{ stage: StageId; resumeFromCheckpoint?: boolean }`

### `src/entities/*.ts`
- `addPlayer(k, pos: Vec2): GameObj`
- `addImomushi(k, pos): GameObj` / `addDangomushi(k, pos): GameObj` / `addKobachi(k, pos): GameObj` / `addBoss(k, pos): GameObj`
- `addItem(k, kind: ItemKind, pos): GameObj`
- `addCheckpoint(k, pos): GameObj` / `addGoal(k, pos): GameObj`

### `src/systems/`
- `pyo-state.ts` … プレイヤー状態機械（onDamage / onItem イベントを受けて遷移）
- `score.ts` … スコア・ベリー数・残機の保持と HUD 更新通知
- `input-buffer.ts` … ジャンプ先行入力 / コヨーテタイムの管理
- `highscore.ts` … localStorage 読み書き

### `src/levels/index.ts`
- `export const LEVEL_PATHS: Record<StageId, string>` … 各 ID の JSON パス

### `src/assets.ts`
- `export function loadAllAssets(k: KaboomCtx): Promise<void>` … ゲーム開始前の一括読み込み

## 状態機械の最小定義

### プレイヤー状態（`pyo-state.ts`）

```
states:  normal | acorn | apple
events:  TAKE_ACORN | TAKE_APPLE | DAMAGE | DIE
transitions:
  normal + TAKE_ACORN → acorn
  normal + TAKE_APPLE → apple
  normal + DAMAGE → DIE（即死）
  acorn  + TAKE_APPLE → apple
  acorn  + TAKE_ACORN → acorn（変化なし、スコア加算のみ）
  acorn  + DAMAGE → normal（短時間無敵）
  apple  + TAKE_APPLE → apple（変化なし）
  apple  + TAKE_ACORN → apple（変化なし、スコア加算のみ）
  apple  + DAMAGE → acorn（短時間無敵）
無敵中:  DAMAGE は無視
```

### ボス AI（`addBoss` 内で持つ）

```
states:  walking | jumping | landing-stun | hurt | dead
events:  TIMER_TICK | LANDED | STOMPED | SHOT_HIT(5回目)
transitions:
  walking + TIMER_TICK(2.0s 経過) → jumping
  jumping + LANDED → landing-stun
  landing-stun + TIMER_TICK(0.8s 経過) → walking
  any-active + STOMPED → hurt(短時間) → walking もしくは dead(HP 0)
  any-active + SHOT_HIT(5発目) → hurt(短時間) → walking もしくは dead
```

## デバッグ・動作確認手段

実装中に役立つ仕掛けを `src/main.ts` または `src/dev.ts` に集約。

- **【確定】** URL クエリで開始シーン指定: `?stage=1-3` で直接そのステージから起動
- **【確定】** `?god=1` で被弾無効モード
- **【確定】** F1 キーでコリジョン枠の可視化トグル（Kaboom の `debug.inspect = true` 相当）
- **【確定】** F2 キーでフレームレート / 主要状態の HUD オーバーレイ表示
- **【確定】** これらの dev 機能は `import.meta.env.DEV` ガードで本番ビルドから除外する

## 想定エッジケース

- **【確定】** ブラウザタブが非アクティブ → Kaboom は自動でゲームを一時停止する想定。明示的な対応は不要
- **【確定】** キーバインドの同時押し（左右同時押し）→ 後勝ち（最後に押された方向を採用）
- **【確定】** 制限時間 0 と落下死が同フレーム → 落下死扱い（DAMAGE→DIE 経路）
- **【確定】** ゴール接触と被ダメージが同フレーム → ゴール優先
- **【確定】** localStorage が無効（プライベートブラウジング等）→ ハイスコア保存は黙って無視（`try/catch` で握りつぶす）

## 未決事項

- `src/levels/*.json` の最終データ構造（タイル ID 配列 / オブジェクト座標リスト）→ M4 着手時に決める
- 中間ポイントを通過後にゲームオーバーになった場合、中間ポイント情報を残機を超えて保持するか → 仕様としては保持しない、要確認
