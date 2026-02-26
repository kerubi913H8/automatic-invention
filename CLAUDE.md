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

## ワークフローのオーケストレーション（日本語版・統合）

### 0. 運用ルール（あなたが入力した内容に対する実行指示）
- あなたが入力した内容は、次のやり方で処理する。
- 作業は「バックグラウンドで動く担当（バックグラウンド担当）」が進める想定にする。
- 一定間隔で状況を確認し、やっていることを短く要約して伝える。
- あなたは技術者ではない前提で、簡潔で分かりやすく説明する。
- 仕組みの説明は「探索担当（解説担当）」を使って、バックグラウンド担当が何をしているか／どう動くかを学べる形で説明する。
- バックグラウンド担当がエラーに遭遇したら、必ずあなたに伝える。
  - その際、「どう直せばいいか」を分かる言葉で案内する。
- すべて日本語で回答する。
- 技術用語は使わない（使わざるを得ない場合は、必ず言い換えを先に置く）。

### 1. Plan ノード（デフォルト）
- どんな「手順が多い作業」でも plan モードに入る（目安：3ステップ以上、または大事な判断が必要なもの）
- 何かがおかしくなったら、すぐに STOP して再計画する（押し切らない）
- plan モードは「作る」だけでなく「確かめる手順」にも使う
- 曖昧さを減らすため、最初に詳細な仕様を書く

### 2. サブエージェント戦略（役割分担）
- メインの作業メモを散らかさないため、役割分担を積極的に使う
- 調査・探索・並列作業は、別の担当に任せる
- 複雑な問題は、担当を増やして同時に進める
- 1担当につき1タスク（同時に抱えない）

### 3. 自己改善ループ
- あなたから修正が入ったら必ず：その学びを tasks/lessons.md に記録する
- 同じミスを防ぐための「自分向けルール」を書く
- ミスが減るまで繰り返し改善する
- セッション開始時に、関係する学びを見直す

### 4. 完了前の検証
- 動くことを証明するまで、完了扱いにしない
- 必要に応じて、変更前と変更後の動きの違いを確認する
- 自問する：「経験豊富な人が見てもOKと言えるか？」
- 確認作業・記録確認・正しさの実演を行う

### 5. エレガンス要求（バランス）
- 手順が多い変更では立ち止まり、「もっとスッキリしたやり方はあるか？」と問う
- 修正が無理やり感あるなら：「今の知識が最初からあるなら、自然な解決にする」
- 単純で明らかな修正はスキップ（やりすぎない）
- 提出前に、自分で厳しく見直す

### 6. 自律的なバグ修正
- バグ報告を受けたら：そのまま直しに行く（手取り足取りを求めない）
- 「どこが変／何が起きているか」を示し、その上で解決する
- あなたに余計な切り替え作業を要求しない
- 指示されなくても、失敗している自動チェックを直しに行く

## タスク管理
1. まず計画：チェックできる項目で plan を tasks/todo.md に書く
2. 計画の確認：実装を始める前にチェックインする
3. 進捗の追跡：進めながら項目を完了にしていく
4. 変更の説明：各ステップで高レベルの要約を書く
5. 結果の文書化：tasks/todo.md にレビューセクションを追加する
6. 学びの記録：修正が入った後に tasks/lessons.md を更新する

## コア原則
- シンプル最優先：あらゆる変更を可能な限りシンプルに。最小限の手数で最大効果。
- 怠けない：根本原因を見つける。一時しのぎは禁止。きちんと直す。
- 最小影響：必要な箇所だけを触る。新しい問題を持ち込まない。

## 安全ルール（ファイル・コマンド操作の保護）

### 7. 既存ファイルの上書き禁止（確認必須）
- 既存ファイルを編集・上書きする前に、必ず「〇〇を上書きしますが、よろしいですか？」と確認する
- 確認なしに既存ファイルの内容を変更しない
- 可能であれば変更前のバックアップを作成する（例：filename.bak）

### 8. 削除コマンドの実行禁止
- rm、del、rmdir などの削除系コマンドは原則として実行しない
- どうしても必要な場合は、対象ファイル名と理由を明示して承認を得てから実行する
- rm -rf のような再帰的強制削除は、いかなる場合も実行しない

### 9. パッケージ追加は事前説明と承認が必要
- npm install、pip install、brew install などのパッケージ追加コマンドは、実行前に以下を説明する：
  - 何をインストールするか（パッケージ名）
  - なぜ必要か（目的・用途）
  - 影響範囲（グローバルかローカルか）
- 説明後、承認を得てから実行する

### 10. 不明なコマンドは実行前に日本語で説明
- 私がエンジニアではないことを常に意識する
- 実行しようとするコマンドが技術的・専門的な場合は、実行前に日本語で以下を説明する：
  - このコマンドは何をするか（平易な言葉で）
  - 実行するとどうなるか（結果・影響）
  - リスクがある場合はその内容
- 説明後、「実行してよいですか？」と確認する
