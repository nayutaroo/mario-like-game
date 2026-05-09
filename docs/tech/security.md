# security — パッケージ脆弱性レビューと運用

## 方針

- **【確定】** 新規パッケージを `package.json` に追加する前に、必ず**既知の脆弱性を確認**してから採用する
- **【確定】** 採用後も継続的に脆弱性情報を監視し、修正版が出たら速やかにアップデートする

## 採用前チェックリスト

新しい依存を追加する際は以下を実施する。

1. **GitHub Advisory Database**（[github.com/advisories](https://github.com/advisories)）で対象パッケージ名を検索
   - `ecosystem:npm` で絞る
   - 直接そのパッケージを affected にしている advisory を確認
2. **`npm view <pkg>`** でメンテナンス状況（最終更新日、メンテナ数、deprecation 警告の有無）を確認
3. **`npm audit`**（パッケージ追加後）で transitively な脆弱性が発生していないか確認
4. 脆弱性が見つかった場合：
   - パッチ済みバージョンが存在 → そのバージョン以上を使う
   - パッチ未提供 → 採用見送りまたは代替パッケージ検討
5. 確認結果を本ファイルの「採用パッケージの脆弱性レビュー記録」に追記する

## 継続的な監視

- **【確定】** GitHub の **Dependabot alerts** を有効化する（リポジトリ Settings → Code security and analysis）
- **【確定】** Dependabot version updates も併せて有効化し、毎週パッチリリースの PR が自動で立つようにする
- **【確定】** CI（GitHub Actions）に **`npm audit --audit-level=high`** を組み込み、High 以上の脆弱性が混入したらビルドを失敗させる

## 採用パッケージの脆弱性レビュー記録

レビュー実施日: **2026-05-09**

| パッケージ | レビュー結果 | 採用バージョン制約 | 備考 |
| --- | --- | --- | --- |
| typescript | 直接の脆弱性なし | 最新安定版 | TypeScript 本体への CVE は確認できず |
| kaplay | 直接の脆弱性なし | 最新安定版 | GitHub Advisory に該当なし |
| kaboom（参考） | 直接の脆弱性なし | （採用しない） | 互換ライブラリとして併記、本作は kaplay を採用 |
| @biomejs/biome | 直接の脆弱性なし | 最新安定版 | GitHub Advisory に該当なし |
| **vite** | **要バージョン固定** | **`>=8.0.5`**（`8.x` 系を採用） | 下記参照 |

### Vite の脆弱性詳細

2026-04 に公表された 3 件の脆弱性および 2025-10 公表の 1 件があるため、**Vite ≥ 8.0.5**（あるいは 7.3.2 / 6.4.2 以降）で採用する。

| GHSA | CVE | 重大度 | 概要 | 影響バージョン | 修正版 |
| --- | --- | --- | --- | --- | --- |
| GHSA-4w7w-66w2-5vf9 | CVE-2026-39365 | Moderate (Critical 表記の advisory もあり) | Vite Optimized Deps `.map` の path traversal | <=6.4.1 / 7.0.0–7.3.1 / 8.0.0–8.0.4 | 6.4.2 / 7.3.2 / **8.0.5** |
| GHSA-v2wj-q39q-566r | CVE-2026-39364 | High | `server.fs.deny` がクエリ付きで bypass | （上記と同期） | 同上 |
| GHSA-p9ff-h696-f583 | CVE-2026-39363 | High | dev server WebSocket 経由の任意ファイル読み出し | （上記と同期） | 同上 |
| GHSA-93m4-6634-74q7 | CVE-2025-62522 | Moderate | Windows でバックスラッシュによる `server.fs.deny` bypass | 過去版 | 過去のパッチで修正済み |

#### 緩和策（本作のリスク評価）

- **【確定】** 上記脆弱性はいずれも **dev server を外部に晒した場合のみ** 悪用可能。本作はローカル開発専用で `vite preview` も localhost のみ。本番は静的ビルド成果物のみ配信するため、**本作のユーザーへの直接影響は低い**
- **【確定】** とはいえ、開発機を共有 Wi-Fi 等で接続している場合の保険として、最新パッチ済みバージョンに固定する
- **【確定】** `package.json` では `"vite": "^8.0.5"` のように caret 範囲で固定し、Dependabot で随時最新化する

## 検証コマンド（実コード追加後に実行）

```bash
npm audit --audit-level=high   # high 以上の脆弱性で非ゼロ終了
npm outdated                   # 古いパッケージの確認
```

## 未決事項

- npm 以外の依存（GitHub Actions の使うアクションなど）の脆弱性監視 → Dependabot で同時カバー予定だが、運用してから状況確認
