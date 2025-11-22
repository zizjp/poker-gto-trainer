# 🃏 Poker GTO Trainer

GTO混合戦略に基づくポーカー学習アプリケーション

## 🎯 プロジェクト概要

GTO Wizardのデータを活用した、プリフロップ・3Bet・4Betシナリオの学習アプリです。

### 主な機能

- **カスタムレンジエディター**: 169個のハンド全てに対してアクション頻度を設定
- **頻度検証**: 合計100%になるまで保存できない厳密な検証
- **パフォーマンス最適化**: React.memoとuseMemoによる高速レンダリング
- **データ永続化**: LocalStorageによる自動保存
- **学習モード**: 50問のスワイプ学習（Phase 2実装予定）

## 🚀 開発

### 必要環境

- Node.js 20+
- npm または pnpm

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### プロジェクト構造

```
src/
├── components/       # Reactコンポーネント
│   ├── HandGrid.tsx        # 13x13ハンドグリッド
│   ├── FrequencyEditor.tsx # 頻度編集UI
│   └── RangeEditor.tsx     # メインエディター
├── types/            # TypeScript型定義
├── utils/            # ユーティリティ関数
│   ├── hands.ts      # ハンド生成・変換
│   ├── validation.ts # 頻度検証
│   └── storage.ts    # データ永続化
├── data/             # GTOデータ
└── scenarios/        # シナリオ定義
    ├── preflop/
    ├── three-bet/
    └── four-bet/
```

## 📋 開発計画

### Phase 1: 基盤構築 ✅ (完了)
- [x] プロジェクト初期化
- [x] 型定義
- [x] ハンドユーティリティ
- [x] 頻度検証機能
- [x] データ永続化
- [x] HandGrid コンポーネント
- [x] FrequencyEditor コンポーネント
- [x] RangeEditor コンポーネント
- [x] GitHub Pages デプロイ設定

### Phase 2: GTOデータ統合 (進行中)
- [ ] 5枚のGTOチャート画像の解析
- [ ] 3Bet/4Betデータの実装
- [ ] プリフロップデータの実装

### Phase 3: 学習モード
- [ ] 50問スワイプUI
- [ ] スコア計算
- [ ] 進捗トラッキング

### Phase 4: AI連携エラーハンドリング
- [ ] エラー検出システム
- [ ] Genspark.ai プロンプト生成

## 🎨 デザイン原則

- **モバイルファースト**: iPhone 15 Pro基準
- **ストレスフリー**: 手入力作業を快適に
- **パフォーマンス**: 169ハンドの高速レンダリング
- **視覚的フィードバック**: 色分けとアニメーション

## 📊 データソース

- GTO Wizard (https://www.gtowizard.com/)
- Nash均衡に基づく混合戦略頻度

## 📝 ライセンス

MIT License

## 🙏 クレジット

Powered by GTO Wizard Data
