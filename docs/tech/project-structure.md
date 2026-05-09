# project-structure — ディレクトリ構成と命名規約

## トップレベル

```
mario-like-game/
├── CLAUDE.md
├── README.md             … プロジェクトの導入文・遊び方（後で作成）
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── biome.json            … Biome 設定
├── index.html            … Vite エントリ HTML（ゲーム DOM ホスト）
├── public/               … Vite が静的配信するアセット（PNG / JSON / fontなど）
│   ├── sprites/
│   ├── levels/
│   └── ui/
├── src/                  … TypeScript ソース
│   ├── main.ts           … エントリ。Kaboom 初期化、シーン登録、最初のシーン起動
│   ├── config.ts         … 解像度・タイルサイズ・物理パラメータ等の定数
│   ├── scenes/           … タイトル / プレイ / ポーズ等のシーン
│   ├── entities/         … プレイヤー / 敵 / アイテムのファクトリ
│   ├── levels/           … レベル ID とレベルデータ参照
│   ├── systems/          … 状態遷移・スコア管理・入力ハンドラ
│   ├── assets.ts         … `loadSprite` / `loadSound` をまとめる
│   └── types.ts          … 共通型（StageId, PlayerState 等）
├── docs/
│   ├── specification/    … ゲーム仕様
│   └── tech/             … 本ディレクトリ
├── outputs/              … harness ラン成果物（gitignore 済み）
└── dist/                 … `vite build` 出力（gitignore 推奨）
```

## `src/` の詳細方針

### `scenes/`

- **【確定】** 1 シーン = 1 ファイル（`title.ts` / `play.ts` / `pause.ts` / `bonus.ts` / `gameover.ts` / `clear.ts`）
- **【確定】** 各ファイルは `register*Scene(k: KaboomCtx)` のような関数を default export し、`main.ts` から登録する

### `entities/`

- **【確定】** ファクトリ関数で生成（`addPlayer(k, pos)` / `addImomushi(k, pos)` / `addBoss(k, pos)` 等）
- **【確定】** 1 ファクトリ = 1 ファイル。タグ名（`"player"` / `"enemy"` / `"item"` 等）はファイル冒頭で定数として定義

### `levels/`

- **【確定】** ステージ ID（`"1-1"` / `"1-2"` / ... / `"1-5"` / `"bonus-1"`）と対応するレベルデータの紐付けを管理
- **【確定】** レベルデータ自体は `public/levels/*.json` に置き、`src/levels/index.ts` がパスを返す
- **【仮】** レベルデータの構造（タイルマップ / オブジェクト配置）は `architecture.md` の方針に従い、初期は ASCII マップで簡易実装

### `systems/`

- **【確定】** プレイヤー状態機械、スコア・残機管理、無敵タイマー、入力先行バッファなどのゲーム横断ロジックを置く
- **【確定】** Kaboom.js のコンポーネントに依存しない純粋ロジックは可能な限りこちらに切り出す（将来テスト導入時に楽になる）

## 命名規約

- **【確定】** ファイル名は **kebab-case**（例: `pyo-state.ts`）
- **【確定】** 関数・変数は **camelCase**、型・クラスは **PascalCase**、定数は `UPPER_SNAKE_CASE` を許容
- **【確定】** Kaboom.js のタグ文字列は **kebab-case**（例: `"piyo"` / `"acorn-item"` / `"boss"`）
- **【確定】** ステージ ID 文字列は **`"<world>-<stage>"`** 形式（例: `"1-1"` / `"1-5"` / `"bonus-1"`）

## 設定ファイル方針

- **【確定】** `tsconfig.json` は `"strict": true` / `"target": "ESNext"` / `"module": "ESNext"` / `"moduleResolution": "Bundler"` / `"jsx"` 設定なし
- **【確定】** `vite.config.ts` は最小設定。GitHub Pages 用の `base` パスを環境変数で切替可能にする（`deploy.md` 参照）
- **【確定】** `biome.json` は推奨ルールベース、フォーマットは 2 スペース・シングルクォート・末尾セミコロンあり

## アセット配置のルール

- **【確定】** 画像 → `public/sprites/`
- **【確定】** UI 画像 → `public/ui/`
- **【確定】** レベル JSON → `public/levels/`
- **【確定】** すべて Vite が `/sprites/...` 等の URL でそのまま配信できる構造にする

## .gitignore に入れるもの

```
node_modules/
dist/
outputs/   ← 既存
.vite/
```

## 未決事項

- ステージ別ロジック（ボス専用処理など）を `scenes/play.ts` 内で分岐するか、`scenes/boss.ts` を別出しするか → 初期は `play.ts` に集約、肥大化したら分割
