# 教職員 出退勤打刻 Webアプリ（GAS）

## 概要
Google Apps Script + HTMLService + Googleスプレッドシートで、教職員の出退勤・休憩打刻を記録するMVPです。

## スプレッドシート作成方法
1. Googleスプレッドシートを新規作成します。
2. 以下のシートを作成し、1行目にヘッダを設定します（完全一致）。

### Staff
| StaffId | Name | Email | Dept | Role | Active |

- Active が TRUE の行のみ利用可能です。

### Events
| Timestamp | Date | StaffId | Name | Email | Action | Note | UserAgent |

- Timestamp は Date 型です。
- Events は追記専用です。

### Daily
| Key | Date | StaffId | Name | Email | InTime | OutTime | BreakStart | BreakMinutes | LastAction | LastTimestamp | WorkMinutes |

- Key: `yyyy-MM-dd|email`
- BreakStart は休憩中のみ Date が入ります。

## CONFIG.SPREADSHEET_ID の設定
`Code.gs` の以下を編集してください。

```
const CONFIG = {
  SPREADSHEET_ID: 'PASTE_SPREADSHEET_ID_HERE',
  ...
};
```

## Webアプリのデプロイ手順
1. Apps Script エディタでプロジェクトを開く
2. [デプロイ] > [新しいデプロイ]
3. 種類: 「ウェブアプリ」
4. 実行ユーザー: 「自分」
5. アクセス権: 「ドメイン内の全員」
6. デプロイ後の URL を教職員に共有

## よくあるエラー
- **NO_EMAIL**: `Session.getActiveUser().getEmail()` でメール取得できない。
  - ドメイン外ユーザーや権限設定を確認してください。
- **NOT_REGISTERED**: Staff シートに登録がない、または Active が TRUE でない。

## 受入テスト例
- Staff に登録済みユーザーでアクセスして表示できる
- IN → BREAK_START → BREAK_END → OUT が正常に保存される
- OUT（INなし）/ BREAK_END（BREAK_STARTなし）/ 休憩中のOUT が拒否される
- OutTime 設定後の追加打刻が拒否される
- Note が200文字超でも切り詰めて保存される
- 複数人同時打刻でもロックで破損しない
