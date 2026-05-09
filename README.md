# 🐤 ピヨのぼうけん

Web ブラウザで動くマリオ風 2D 横スクロールアクションゲーム。
ヒヨコの「ピヨ」を操作して、草原 → 森 → 洞窟 → 空 → ボス城を駆け抜けます。

## 🎮 遊ぶ

▶ **[https://nayutaroo.github.io/mario-like-game/](https://nayutaroo.github.io/mario-like-game/)**

PC キーボード操作。タッチデバイス（スマホ／タブレット）ではオンスクリーンボタンが自動表示されます。Chrome / Firefox / Safari / Edge の最新版で動作。

## 🕹️ 操作

| 操作 | キー |
| --- | --- |
| 移動 | ← / → / A / D |
| ダッシュ | Shift（押し続けで走り） |
| ジャンプ | Space / K（長押しで高く） |
| タネ発射 | Z（リンゴ状態のみ） |
| ヘルプ | H |
| ポーズ | P（ポーズ中は Q でタイトルへ） |
| タイトルへ | Esc |

## 📖 ステージ構成

1. **1-1 草原** — 基本操作とドングリの取得を学ぶ
2. **1-2 森** — リンゴと種攻撃、複数の敵
3. **1-3 洞窟** — 暗く狭い足場、天井のあるエリア
4. **1-4 空** — 縦スクロール採用面、葉っぱのふわふわ落下で雲を渡る
5. **1-5 城（ボス）** — ボス「ヌシイモ」🪲 と決戦
6. **ボーナス面** — 隠しエリアの ? ブロック経由で到達、ベリーと金のヒナ大量

## 🐛 敵キャラクター

| 絵文字 | 名前 | 行動 |
| --- | --- | --- |
| 🐛 | イモムシ | 直進歩行、踏みで撃破 |
| 🐞 | ダンゴムシ | 踏むと丸まる、再蹴りで弾丸転がり |
| 🐝 | コバチ | 飛行する敵 |
| 🪲 | ヌシイモ（ボス） | HP 3、踏み 3 回 or 種 15 発で撃破 |

## 🍎 アイテム

| 絵文字 | 名前 | 効果 |
| --- | --- | --- |
| 🌰 | ドングリ | どんぐり状態。被弾を 1 回耐える |
| 🍎 | リンゴ | リンゴ状態。Z で種が撃てる |
| 🍃 | 葉っぱ | 4 秒間ふわふわ落下 |
| 🫐 | ベリー | スコア +10 / 100 個で 1UP |
| ✨ | きらきら花 | 8 秒間無敵（接触で敵を撃破） |
| 🐥 | 金のヒナ | 1UP（残機 +1） |
| ⛩️ | 光の鳥居 | 中間ポイント。通過後はそこからリスポーン |
| 🌀 | 光の輪 | ステージのゴール |
| 💫 | ワープ | 隠し ? ブロックから出現、ボーナス面へ |
| ❓ | ? ブロック | 下から叩くとアイテムや💫が出現 |

## 🛠️ 技術スタック

- **言語**: TypeScript（strict）
- **ゲームライブラリ**: [KAPLAY](https://kaplayjs.com/)（Kaboom.js のコミュニティ後継）
- **ビルドツール**: Vite（`>=8.0.5`、CVE-2026-39363/-39364/-39365 パッチ済み版固定）
- **リンタ・フォーマッタ**: Biome
- **デプロイ**: GitHub Pages（`main` への push で自動デプロイ）

詳細: [`docs/tech/`](docs/tech/)

## 💻 ローカル開発

Node.js 22 以降推奨。

```bash
git clone git@github.com:nayutaroo/mario-like-game.git
cd mario-like-game
npm ci

npm run dev          # 開発サーバ起動 → http://localhost:5173
npm run typecheck    # TypeScript 型チェック
npm run lint         # Biome で lint + format チェック
npm run format       # Biome フォーマット適用
npm run build        # 本番ビルド (dist/ に出力)
npm run preview      # build 結果のローカル確認
```

セキュリティポリシーとして新規パッケージ追加前に `npm audit` を必ず通します。詳細は [`docs/tech/security.md`](docs/tech/security.md)。

## 📂 ドキュメント

| ディレクトリ | 内容 |
| --- | --- |
| [`docs/specification/`](docs/specification/) | ゲーム仕様（vision / gameplay / mechanics / level-design / controls / assets） |
| [`docs/tech/`](docs/tech/) | 技術要件（stack / architecture / project-structure / deploy / security / implementation-plan） |

進捗状況: [`docs/tech/implementation-plan.md`](docs/tech/implementation-plan.md) の進捗サマリ表を参照。

## 📜 ライセンス

個人プロジェクト。ライセンスは未確定（`docs/tech/security.md` の未決事項参照）。
