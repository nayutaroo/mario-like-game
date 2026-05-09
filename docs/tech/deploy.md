# deploy — ビルド・デプロイ手順

## デプロイ先

- **【確定】** **GitHub Pages**
- **【確定】** リポジトリ名 `mario-like-game` を想定。公開 URL は `https://<user>.github.io/mario-like-game/` になる前提で `base` パスを設定する

## ビルド

- **【確定】** ローカル開発: `npm run dev`（Vite の HMR で `http://localhost:5173` 等）
- **【確定】** 本番ビルド: `npm run build` → `dist/` に静的アセット出力
- **【確定】** プレビュー: `npm run preview` で `dist/` をローカル静的サーバで確認

### Vite の base パス設定

GitHub Pages の URL がサブパス配信のため、Vite の `base` を設定する必要がある。

- **【確定】** `vite.config.ts` で `base: process.env.VITE_BASE ?? "/"` のように環境変数経由で切替可能にする
- **【確定】** GitHub Pages 用ビルドは `VITE_BASE=/mario-like-game/ npm run build` で実行する

## GitHub Pages の有効化

- **【確定】** GitHub の Settings → Pages → Source を **GitHub Actions** に設定する
- **【確定】** `gh-pages` ブランチを使う方式は採らない（公式の Actions 経由のほうが現在の推奨）

## CI ワークフロー（GitHub Actions）

- **【確定】** ファイル: `.github/workflows/deploy.yml`（**本ランでは作成しない**、次フェーズの実コード追加時に作る）
- **【確定】** トリガー: `main` ブランチへの push
- **【確定】** ステップ概要:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4`（Node.js LTS）
  3. `npm ci`
  4. `npm audit --audit-level=high`（高脆弱性が混入したら失敗。詳細は [`security.md`](security.md)）
  5. `npm run lint`（Biome）
  6. `npm run typecheck`（`tsc --noEmit`）
  7. `VITE_BASE=/mario-like-game/ npm run build`
  7. `actions/upload-pages-artifact@v3` で `dist/` をアップロード
  8. `actions/deploy-pages@v4` で GitHub Pages にデプロイ

- **【確定】** 並行ジョブ制限: `concurrency` で同時デプロイを 1 本に制限
- **【確定】** 必要 Permissions: `contents: read` / `pages: write` / `id-token: write`

## ローカル動作確認の手順

```bash
npm install
npm run dev          # 開発サーバ起動（HMR あり）
npm run typecheck    # 型チェック
npm run lint         # Biome lint + format チェック
npm run format       # Biome format 適用
npm run build        # 本番ビルド
npm run preview      # build 結果のローカル確認
```

`package.json` の scripts は次のように整える想定:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "format": "biome format --write ."
  }
}
```

## デプロイ後の動作確認チェックリスト

- **【確定】** タイトル画面が表示され、操作説明に遷移できる
- **【確定】** 1-1 が起動し、左右移動・ジャンプ・敵踏みつけが動く
- **【確定】** ハイスコアが localStorage に保存され、リロードで残る
- **【確定】** ピクセルアートのにじみが出ていない（`crisp` 設定が効いている）
- **【確定】** ブラウザの戻るボタン・スペースキーでの誤スクロールが起きない

## 未決事項

- GitHub Pages 以外（Vercel / Netlify）への切替シナリオ → 当面想定なし、必要時に再検討
- ドメインのカスタム設定（CNAME） → 当面なし
