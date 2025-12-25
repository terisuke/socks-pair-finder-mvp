# 靴下ペア提案アプリ (Socks Pair Finder)

AIを活用して、散らばった靴下の中から最適なペアを提案するモバイルファーストWebアプリケーションです。

## 概要

Google Gemini AIの視覚認識機能を利用し、靴下の画像から色・柄・丈・素材感などの視覚的特徴を分析。最大2組のペアを提案し、画像上にバウンディングボックスで視覚的に表示します。

### 主な機能

- **カメラ撮影**: デバイスのカメラで靴下を直接撮影
- **画像アップロード**: ギャラリーから画像を選択
- **AIペア分析**: Gemini AIが視覚的特徴を分析してペアを提案
- **視覚的オーバーレイ**: 提案されたペアを画像上にハイライト表示
- **信頼度表示**: 各ペアの信頼度（高/中/低）を表示

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 6
- **AI**: Google Gemini API (@google/genai)
- **スタイリング**: Tailwind CSS
- **ホスティング**: Vercel

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn
- Google Gemini API キー

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yourusername/socks-pair-finder-mvp.git
   cd socks-pair-finder-mvp
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   ```bash
   cp .env.example .env.local
   ```

   `.env.local` を編集し、Gemini API キーを設定:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   API キーは [Google AI Studio](https://aistudio.google.com/app/apikey) から取得できます。

4. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

   ブラウザで http://localhost:3000 を開きます。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# リント実行
npm run lint

# リント自動修正
npm run lint:fix

# コードフォーマット
npm run format

# プロダクションビルド
npm run build

# ビルドプレビュー
npm run preview
```

## プロジェクト構造

```
├── api/                    # Vercel Functions (APIプロキシ)
│   └── analyze-socks.ts    # Gemini API呼び出しを安全に処理
├── src/
│   ├── App.tsx             # メインアプリケーションコンポーネント
│   ├── main.tsx            # エントリーポイント
│   ├── components/         # UIコンポーネント
│   │   ├── analysis/       # 分析結果表示コンポーネント
│   │   ├── camera/         # カメラ関連コンポーネント
│   │   ├── image/          # 画像表示・オーバーレイ
│   │   └── layout/         # レイアウトコンポーネント
│   ├── hooks/              # カスタムフック
│   │   ├── useImageAnalysis.ts
│   │   ├── useCamera.ts
│   │   └── useOverlayDimensions.ts
│   ├── services/           # 外部API通信
│   │   └── geminiService.ts
│   ├── types/              # TypeScript型定義
│   └── utils/              # ユーティリティ関数
├── .github/workflows/      # GitHub Actions CI/CD
└── vercel.json             # Vercelデプロイ設定
```

## アーキテクチャ

### データフロー

```
ユーザー操作（カメラ/アップロード）
    ↓
画像をBase64に変換
    ↓
/api/analyze-socks (Vercel Function)
    ↓
Gemini AI 画像解析
    ↓
構造化JSONレスポンス
    ↓
SVGオーバーレイで結果を表示
```

### セキュリティ

- **APIキー保護**: Gemini APIキーはサーバーサイド（Vercel Functions）でのみ使用
- **クライアント側露出なし**: ビルド後のバンドルにAPIキーは含まれません
- **環境変数分離**: 開発/プレビュー/本番で異なる環境変数を使用可能

### バウンディングボックス座標系

Gemini AIは正規化座標（0-1000）を返します。表示時にピクセル座標に変換:

```typescript
const scaleBox = (box: BoundingBox, dims: { width: number; height: number }) => ({
  x1: (box.xmin / 1000) * dims.width,
  y1: (box.ymin / 1000) * dims.height,
  x2: (box.xmax / 1000) * dims.width,
  y2: (box.ymax / 1000) * dims.height,
});
```

## デプロイ

### Vercelへのデプロイ

1. **Vercelアカウントでプロジェクトをインポート**
   - GitHubリポジトリを接続
   - フレームワークは自動検出（Vite）

2. **環境変数を設定**
   - Vercelダッシュボード → Settings → Environment Variables
   - `GEMINI_API_KEY` を追加（Production/Preview両方）

3. **自動デプロイ**
   - mainブランチへのpush: 本番デプロイ
   - PRの作成: プレビューデプロイ（自動でURLがコメントに投稿）

### CI/CD

GitHub Actionsにより以下が自動実行されます:

- **型チェック**: TypeScriptコンパイラによる型検証
- **リント**: ESLintによるコード品質チェック
- **フォーマット**: Prettierによるコード整形チェック
- **ビルド検証**: プロダクションビルドの成功確認
- **Vercelデプロイ**: 品質チェック通過後に自動デプロイ

## ライセンス

MIT License

## 貢献

バグ報告や機能リクエストは [Issues](https://github.com/yourusername/socks-pair-finder-mvp/issues) へお願いします。
