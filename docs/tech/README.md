# tech — 技術要件ドキュメント

`docs/specification/` のゲーム仕様を実装するための技術要件をまとめる。コード着手前のドラフトで、**確定事項**を中心に書き、未確定はファイル末尾の「未決事項」に集約する。

## 構成

| ファイル | 内容 |
| --- | --- |
| [stack.md](stack.md) | 技術スタック（言語・ライブラリ・ツールチェーン）の確定事項 |
| [architecture.md](architecture.md) | ゲーム実装アーキテクチャ（シーン・エンティティ・状態・アセットパイプライン） |
| [project-structure.md](project-structure.md) | ディレクトリ構成・命名規約・ビルド成果物の置き場所 |
| [deploy.md](deploy.md) | GitHub Pages デプロイ手順と CI 概要 |
| [security.md](security.md) | 採用パッケージの脆弱性レビュー記録と継続監視方針 |
| [implementation-plan.md](implementation-plan.md) | M0〜M7 のマイルストーン・チューニング初期値・モジュールAPI・状態機械 |

## 表記ルール

- **【確定】** … 方針として決まっているもの
- **【仮】** … たたき台。後で見直す
- **【未決】** … 要相談

## 関連ドキュメント

- ゲーム仕様: [`docs/specification/`](../specification/)
