const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, Header, Footer, PageNumber, ExternalHyperlink
} = require("docx");
const fs = require("fs");

// ── 共通スタイル設定 ────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ── ヘルパー関数 ────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 240 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 36 })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 28 })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 24 })],
  });
}

function p(runs) {
  if (typeof runs === "string") {
    runs = [new TextRun({ text: runs, font: "Arial", size: 22 })];
  }
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: runs,
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, font: "Arial", size: 22 });
}

function normal(text) {
  return new TextRun({ text, font: "Arial", size: 22 });
}

function bullet(text, boldPart) {
  const children = boldPart
    ? [bold(boldPart), normal(text.replace(boldPart, ""))]
    : [normal(text)];
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children,
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}

function checkItem(text) {
  return new Paragraph({
    numbering: { reference: "checks", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text: "", font: "Arial", size: 22 })],
  });
}

// ── テーブル：習慣置き換え表 ────────────────────────────────────
function habitTable() {
  const headerCell = (text) =>
    new TableCell({
      borders,
      margins: cellMargins,
      width: { size: 4680, type: WidthType.DXA },
      shading: { fill: "2F4F7F", type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: "FFFFFF" })],
        }),
      ],
    });

  const dataCell = (text) =>
    new TableCell({
      borders,
      margins: cellMargins,
      width: { size: 4680, type: WidthType.DXA },
      children: [
        new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 20 })],
        }),
      ],
    });

  const rows = [
    ["スマホを触りたくなるとき", "代わりの行動"],
    ["起床直後", "5分間ストレッチ・水を飲む"],
    ["通勤・移動中", "Podcastを聴く・本を読む"],
    ["手持ち無沙汰なとき", "3回深呼吸・手帳を開く"],
    ["就寝前", "紙の本・ストレッチ・日記"],
  ];

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: rows.map((row, i) =>
      new TableRow({
        children: i === 0
          ? [headerCell(row[0]), headerCell(row[1])]
          : [dataCell(row[0]), dataCell(row[1])],
      })
    ),
  });
}

// ── ドキュメント本体 ────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "checks",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25A1",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2F4F7F" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "4A4A4A" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "- ", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" }),
                new TextRun({ text: " -", font: "Arial", size: 18, color: "888888" }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── タイトル ──
        h1("スマホ依存から脱却する方法"),
        p([normal("——あなたの注意力は、意図的に奪われている")]),
        separator(),

        // ── リード ──
        p("あなたは今日、スマホを何回触りましたか？"),
        separator(),
        p([
          normal("1日平均"),
          bold("300回"),
          normal("。これが、現代人がスマホの画面をスクロールする回数です。起きてから寝るまで、私たちは平均して4〜5時間をスマホに費やしています。Z世代に至っては7時間を超えます。"),
        ]),
        separator(),
        p([
          normal("「やめなきゃと思っているのに、気づいたらまた触っている」——MMD研究所の2024年調査によれば、日本人の"),
          bold("62.5%がスマホへの依存を自覚"),
          normal("しています。社会人に限ると、その割合は7割に上ります。"),
        ]),
        separator(),
        p([
          normal("しかし、これはあなたの意志が弱いせいではありません。"),
          bold("あなたのスマホは、やめられないように設計されている"),
          normal("のです。"),
        ]),
        separator(),

        // ── Section 1 ──
        h2("なぜスマホがやめられないのか——脳と依存のメカニズム"),
        h3("ドーパミンループという罠"),
        p("スマホを触るたびに、脳の報酬系が反応します。新しい通知、「いいね」、面白い動画——これらはどれも、神経伝達物質「ドーパミン」の小さな放出を引き起こします。"),
        separator(),
        p([
          normal("問題は、SNSがこの仕組みを"),
          bold("意図的に利用して設計されている"),
          normal("ことです。"),
        ]),
        separator(),
        p("スロットマシンを想像してください。毎回当たりが出るわけではないのに、人はやめられない。これは心理学で「可変比率強化」と呼ばれる、最も依存性の高い報酬パターンです。タイムラインを引っ張って更新する「プルトゥリフレッシュ」、永遠に続くフィード、自動再生——これらはすべて、同じ原理で設計されています。"),
        separator(),
        p([
          normal("無限スクロールを広めたデザイナーのAza Raskinは後に「後悔している」と公言し、こう語っています。"),
          bold("「止まるタイミングをなくすことで、人は無意識に消費し続ける」"),
          normal("。"),
        ]),
        separator(),

        h3("あなたは「依存しているかも」——チェックリスト"),
        p("以下のうち、3つ以上当てはまる場合は注意が必要です。"),
        checkItem("用事がないのに、反射的にスマホを開いてしまう"),
        checkItem("スマホを触らずに耐えられる時間が2時間未満"),
        checkItem("「少し見るだけ」のつもりが、気づいたら1時間経っている"),
        checkItem("食事中、会話中もスマホが気になる"),
        checkItem("スマホを忘れると強い不安を感じる"),
        checkItem("睡眠前にスマホを触り、なかなか眠れない"),
        separator(),

        // ── Section 2 ──
        h2("脱却のための具体的な方法"),
        p([
          normal("重要なのは「意志で我慢する」ことではありません。"),
          bold("やめやすい環境を設計すること"),
          normal("です。"),
        ]),
        separator(),

        h3("ステップ1：環境を変える（今すぐできる）"),
        p([bold("通知をオフにする")]),
        p("SNS・ニュース・ゲームアプリの通知をすべてオフにします。「見なきゃいけない気がする」衝動の大半は、通知によって生まれます。"),
        separator(),
        p([bold("ホーム画面からSNSアプリを消す")]),
        p("削除しなくていい。アプリフォルダの奥深くに移動するだけで、無意識に開く頻度が劇的に減ります。"),
        separator(),
        p([bold("グレースケール設定にする")]),
        p("スマホの画面を白黒にすると、脳への刺激が下がり、使いたいという衝動が弱まります。iPhoneもAndroidも設定から変更できます。"),
        separator(),
        p([bold("寝室にスマホを持ち込まない")]),
        p("最もシンプルで、最も効果的な習慣です。充電は別の部屋で。代わりに、安価な置き時計をベッドサイドに置きましょう。"),
        separator(),

        h3("ステップ2：習慣を置き換える"),
        p("スマホを触る代わりに何をするか、あらかじめ決めておきます。"),
        separator(),
        habitTable(),
        separator(),
        p("空白を埋めるものを用意しておかないと、脳はすぐに「スマホ」という慣れ親しんだ選択肢に戻ります。"),
        separator(),

        h3("ステップ3：デジタルデトックスを段階的に進める"),
        p("いきなり「スマホを1週間断つ」は現実的ではありません。段階的に始めましょう。"),
        separator(),
        p([bold("Week 1：「スマホフリー時間」を1日1時間作る")]),
        p("食事中、入浴中、寝る前の1時間——スマホを手の届かない場所に置く時間を決めます。"),
        separator(),
        p([bold("Week 2：朝の最初の1時間はスマホを見ない")]),
        p("1日の最初にスマホを見ると、脳が「反応モード」に入り、集中力が奪われます。朝の1時間だけでも、スマホなしで過ごしてみてください。"),
        separator(),
        p([bold("Week 3〜4：SNSを週1回のチェックに絞る")]),
        p("「いつでも見られる」から「決めた時間だけ見る」へ。能動的な使い方に変えるだけで、消費時間は大幅に減ります。"),
        separator(),

        // ── Section 3 ──
        h2("脱却後に得られるもの"),
        p("「そんなに変わるの？」と思うかもしれません。研究が示す数字は、予想以上に明確です。"),
        separator(),
        p("Coyne & Woodruff の研究では、14日間SNSの使用を1日30分に制限した若者たちに、以下の改善が確認されました。"),
        bullet("睡眠の質が向上（寝つきが速くなり、睡眠時間が増加）"),
        bullet("生活への満足度が上昇"),
        bullet("ストレス・不安が低下"),
        bullet("人間関係の充実感が増した"),
        separator(),
        p([
          normal("また、スクリーンタイムを減らすRCT（ランダム化比較試験）研究では、たった24時間スクリーンから離れるだけでも"),
          bold("集中力と創造性が向上する"),
          normal("ことが示されています。"),
        ]),
        separator(),
        p("脳は変わります。ただし、習慣が変われば、の話ですが。"),
        separator(),

        // ── まとめ ──
        h2("まとめ——今日からできる1つのこと"),
        p("スマホ依存から脱却するために、今すぐすべてを変える必要はありません。"),
        separator(),
        p([bold("今日、1つだけやってみてください。")]),
        separator(),
        p([bold("「寝る前の1時間、スマホを別の部屋に置く」")]),
        separator(),
        p("それだけです。劇的な変化は求めなくていい。ただ、脳に「スマホがなくても大丈夫な時間」を少しずつ取り戻させてあげてください。"),
        separator(),
        p([bold("あなたの注意力は、あなたのものです。取り戻す価値が、十分あります。")]),
        separator(),
        separator(),

        // ── 参考文献 ──
        h2("参考文献"),
        p([
          normal("[1] MMD研究所「2024年スマホ依存に関する定点調査」"),
          normal(" https://mmdlabo.jp/investigation/detail_2358.html"),
        ]),
        p("[2] Sharpe, B.T. & Spooner, R.A. (2025). Dopamine-scrolling: a modern public health challenge. Health Promotion International."),
        p("[3] PMC (2025). Smartphone screen time reduction improves mental health: a randomized controlled trial. https://pmc.ncbi.nlm.nih.gov/articles/PMC11846175/"),
      ],
    },
  ],
});

// ── 出力 ────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("smartphone-addiction-blog.docx", buffer);
  console.log("Done: smartphone-addiction-blog.docx");
});
