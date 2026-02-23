# Claude Skills ガイド

このファイルは Claude Skills の仕組みと使い方をまとめたリファレンスです。

## Claude Skills とは

Claude Skills は、Claude の機能を拡張するモジュール型の能力パッケージです。
ドメイン固有の専門知識・ワークフロー・ベストプラクティスをパッケージ化し、Claude が会話中に自動的に発見・ロードします。

**主なメリット:**
- 同じプロンプトを毎回打ち込む手間がなくなる
- チームで同じワークフローを共有できる
- 一度作ったら複数プロジェクトで再利用できる
- 段階的ロードにより、コンテキストウィンドウを節約できる

## ディレクトリ構成

```
my-skill/
├── SKILL.md           # メインの指示ファイル（必須）
├── template.md        # Claude が埋めるテンプレート（任意）
├── examples/
│   └── sample.md      # 期待する出力の例（任意）
└── scripts/
    └── validate.sh    # Claude が実行するスクリプト（任意）
```

### スキルの配置場所

| スコープ | パス | 有効範囲 |
|------|------|------|
| Enterprise | managed settings 参照 | 組織内全ユーザー |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | 自分の全プロジェクト |
| Project | `.claude/skills/<skill-name>/SKILL.md` | このプロジェクトのみ |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | プラグイン有効時 |

同名スキルが複数の場所にある場合、優先度は **enterprise > personal > project** となります。

## SKILL.md の書き方

### 基本フォーマット

```yaml
---
name: skill-name
description: このスキルが何をするか、いつ使うべきかを説明する。
---

# スキル名

## 手順
[Claude が従うべき明確な指示]

## 例
[具体的な使用例]
```

### YAML フロントマター フィールド一覧

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 任意 | スキル名。省略時はディレクトリ名を使用。小文字英数字・ハイフンのみ（最大64文字） |
| `description` | 推奨 | スキルの説明と使用タイミング。Claudeが自動発動の判断に使う（最大1024文字） |
| `argument-hint` | 任意 | 補完時に表示されるヒント。例: `[issue-number]` |
| `disable-model-invocation` | 任意 | `true` にするとユーザーのみ手動で呼び出し可能。デフォルト: `false` |
| `user-invocable` | 任意 | `false` にすると `/` メニューに表示されなくなる。デフォルト: `true` |
| `allowed-tools` | 任意 | このスキル実行中に Claude が確認なしで使えるツール |
| `model` | 任意 | このスキル実行時に使用するモデル |
| `context` | 任意 | `fork` を設定するとサブエージェントとして分離実行 |
| `agent` | 任意 | `context: fork` 時に使用するサブエージェントの種類 |
| `hooks` | 任意 | スキルのライフサイクルにスコープされたフック |

### `name` と `description` のバリデーション

**`name`:**
- 最大64文字
- 小文字英字・数字・ハイフンのみ
- XMLタグ不可
- 予約語（`anthropic`, `claude`）不可

**`description`:**
- 空でないこと
- 最大1024文字
- XMLタグ不可

## description の書き方（重要）

`description` はスキルが**自動発動するトリガー**として機能します。

- 「何をするか」と「いつ使うか」を両方書く
- 常に **三人称** で書く（"Use when..." "Provides..." など）
- トリガーキーワードも明示的に列挙するとよい
- **本文（SKILL.md body）に "いつ使うか" を書いても意味がない** — descriptionが読まれた後に本文がロードされるため

```yaml
---
name: competitive-analysis
description: Competitive intelligence analysis framework and report template.
  Used for structured comparison of competitor features, positioning, and
  technology roadmap, outputting actionable recommendations.
  Trigger words: competitor, competition, comparison, differentiation,
  market positioning, tech stack, opportunity.
---
```

## 呼び出し制御

| フロントマター設定 | ユーザーが呼べる | Claudeが呼べる | コンテキストへのロード |
|---------------|--------------|--------------|-----------------|
| （デフォルト） | Yes | Yes | description は常時、本文は呼び出し時 |
| `disable-model-invocation: true` | Yes | No | descriptionはロードされない |
| `user-invocable: false` | No | Yes | description は常時、本文は呼び出し時 |

**使い分けの指針:**
- `/commit`, `/deploy` などは副作用があるため `disable-model-invocation: true` を推奨
- バックグラウンド知識として使いたい場合は `user-invocable: false`

## 引数の渡し方

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.
```

`/fix-issue 123` と実行すると `$ARGUMENTS` が `123` に展開されます。

### 文字列置換変数

| 変数 | 説明 |
|-----|------|
| `$ARGUMENTS` | 呼び出し時に渡したすべての引数 |
| `$ARGUMENTS[N]` | N番目の引数（0始まり） |
| `$N` | `$ARGUMENTS[N]` の短縮形 |
| `${CLAUDE_SESSION_ID}` | 現在のセッションID |

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue` → `$0=SearchBar`, `$1=React`, `$2=Vue`

## 段階的ロード（Progressive Disclosure）

| レベル | ロードタイミング | トークン消費 | 内容 |
|------|--------------|------------|-----|
| Level 1: メタデータ | 常時（起動時） | スキルあたり〜100トークン | YAMLの `name` と `description` |
| Level 2: 指示 | スキル発動時 | 5k トークン未満 | SKILL.md 本文 |
| Level 3: リソース | 必要時のみ | 実質無制限 | バンドルされたファイル・スクリプト |

## サポートファイルの追加

`SKILL.md` を 500行以内に抑え、詳細な資料は別ファイルに分割します。

```
my-skill/
├── SKILL.md           # 概要とナビゲーション
├── reference.md       # 詳細な API ドキュメント（必要時にロード）
├── examples.md        # 使用例（必要時にロード）
└── scripts/
    └── helper.py      # ユーティリティスクリプト（出力のみコンテキストに入る）
```

`SKILL.md` 内でファイルを参照しておくと Claude が認識します：

```markdown
## 追加リソース
- 完全な API 詳細は [reference.md](reference.md) を参照
- 使用例は [examples.md](examples.md) を参照
```

## 高度な機能

### 動的コンテキスト注入（`!`command`` 構文）

スキル本文内で `!`コマンド`` を使うと、Claude がコンテンツを受け取る前にシェルコマンドが実行され、その出力が埋め込まれます。

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

### サブエージェントとして実行（`context: fork`）

`context: fork` を設定すると、スキルが独立したサブエージェントで実行されます。

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

**使用可能な `agent` の種類:** `Explore`, `Plan`, `general-purpose`、またはカスタムサブエージェント

### ツールアクセスの制限

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

### 拡張思考の有効化

スキルの本文に `ultrathink` という単語を含めると extended thinking が有効になります。

## スキルのシェア方法

- **プロジェクトスキル**: `.claude/skills/` をバージョン管理にコミット
- **プラグイン**: プラグインに `skills/` ディレクトリを作成
- **管理**: managed settings で組織全体にデプロイ

## Skills vs MCP の使い分け

| 用途 | 使うもの |
|-----|--------|
| GitHub, Slack, DB などからリアルタイムデータを取得 | MCP |
| ワークフロー・ブランドガイドライン・フォーマット標準の一貫した実行 | Skills |
| データ取得してフォーマットも適用 | MCP + Skills |

## セキュリティ

スキルは任意のコードを実行できます。**信頼できるソースのスキルのみ使用**してください。

- すべてのバンドルファイル（SKILL.md、スクリプト、リソース）を監査する
- 外部URLからデータを取得するスキルは特に注意
- 本番環境の機密データへアクセスするシステムでは慎重に

## トラブルシューティング

**スキルが自動発動しない場合:**
1. `description` にユーザーが自然に使う言葉・キーワードが含まれているか確認
2. `What skills are available?` でスキルが一覧に表示されるか確認
3. `/skill-name` で直接呼び出してみる

**スキルが頻繁に発動しすぎる場合:**
1. `description` をより具体的にする
2. 手動のみで呼び出したい場合は `disable-model-invocation: true` を設定

**スキルが多すぎてすべて見えない場合:**
- スキルの description はコンテキストウィンドウの 2%（フォールバック 16,000 文字）が上限
- `/context` で除外されているスキルがないか確認
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` 環境変数でオーバーライド可能

## プリビルトスキル（公式提供）

| スキル | 機能 |
|------|------|
| `pptx` | PowerPoint の作成・編集・分析 |
| `xlsx` | Excel スプレッドシートの作成・データ分析 |
| `docx` | Word ドキュメントの作成・編集 |
| `pdf` | PDF の生成・テキスト抽出・フォーム記入 |

## 参考リンク

- [Extend Claude with skills (Claude Code Docs)](https://code.claude.com/docs/en/skills)
- [Agent Skills Overview (platform.claude.com)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills open standard](https://agentskills.io)
- [Awesome Claude Skills (GitHub)](https://github.com/travisvn/awesome-claude-skills)
- [How to create custom Skills (Help Center)](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
