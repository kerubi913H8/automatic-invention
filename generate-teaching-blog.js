const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, Footer, PageNumber
} = require("docx");
const fs = require("fs");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

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
  if (typeof runs === "string") runs = [new TextRun({ text: runs, font: "Arial", size: 22 })];
  return new Paragraph({ spacing: { before: 120, after: 120 }, children: runs });
}
function bold(text) { return new TextRun({ text, bold: true, font: "Arial", size: 22 }); }
function normal(text) { return new TextRun({ text, font: "Arial", size: 22 }); }
function bullet(text, boldPart) {
  const children = boldPart
    ? [bold(boldPart), normal(text.slice(boldPart.length))]
    : [normal(text)];
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children,
  });
}
function sep() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [normal("")] });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2F4F7F" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "4A4A4A" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "- ", font: "Arial", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" }),
            new TextRun({ text: " -", font: "Arial", size: 18, color: "888888" }),
          ],
        })],
      }),
    },
    children: [
      // タイトル
      h1("授業スキルを上げる方法"),
      p([normal("——「伝わる授業」は、練習でつくられる")]),
      sep(),

      // リード
      p([bold("「知識がある人が、うまく教えられるわけではない」")]),
      sep(),
      p("これはすべての先生が、教壇に立ってから気づく現実です。どれだけ深く知っていても、生徒の顔が曇っていく瞬間がある。逆に、シンプルな一言で生徒の目が輝く瞬間もある。その差は才能ではなく、スキルと習慣にあります。"),
      sep(),
      p([
        normal("文部科学省のTALIS 2024調査によれば、日本の教師は「ICTを授業に取り入れる教育スキルについて専門的な学習が必要」と感じている割合が国際平均より約"),
        bold("20ポイント"),
        normal("高い。教師自身が「もっと上手くなりたい」と感じているのです。授業スキルは伸ばせます。そのための具体的な方法を整理しました。"),
      ]),
      sep(),

      // Section 1
      h2("授業スキルの核心3要素"),
      p("うまい授業には共通する3つの軸があります。"),
      sep(),

      h3("1. 構成力——「話の流れ」を設計する"),
      p([normal("授業は即興ではなく、"), bold("設計"), normal("です。")]),
      p("優れた授業には「なぜこの順番で教えるのか」という意図があります。生徒がゼロから理解を構築できるように、既知から未知へ、具体から抽象へ、問いから答えへと流れを組み立てる力が構成力です。"),
      p([bold("「1文サマリー」"), normal("——「この授業で生徒は何を理解するか」を1文で書いてみてください。書けないときは、まだ授業の核心が定まっていないサインです。")]),
      sep(),

      h3("2. 説明力——「わかった」を引き出す言葉の選び方"),
      p("説明の失敗の多くは、「知っている人の言葉」で話してしまうことです。"),
      p([
        normal("効果的な説明の鉄則は"),
        bold("類比（アナロジー）"),
        normal("を使うこと。「電流は水流に似ている」「細胞は工場のようなもの」——見えないものを見えるものに変換する一言が、理解の扉を開きます。"),
      ]),
      p([
        normal("もう一つは"),
        bold("沈黙を使う"),
        normal("こと。説明したあと、すぐ次に進まず3〜5秒待つ。この「待ち時間（ウェイトタイム）」を意識するだけで、授業の質が変わります。"),
      ]),
      sep(),

      h3("3. 問いかけ力——一方通行をやめ、考えさせる"),
      p([normal("授業を変える最短ルートは、"), bold("問いの質を変えること"), normal("です。")]),
      p("「わかった人？」という問いは情報を集めません。「どこで迷った人？」「2つの違いを言葉にすると？」という問いは生徒の思考を動かします。"),
      p([
        normal("2024年のAI授業支援の研究では、教師が「焦点を絞った問い（focusing questions）」を使う頻度を意識的に高めた結果、授業の質指標が"),
        bold("20%向上"),
        normal("したことが示されました。"),
      ]),
      sep(),

      // Section 2
      h2("今日からできる上達法"),

      h3("授業を録画して自分で見る"),
      p([normal("これが最も効果的で、最も実行されていない方法です。")]),
      p("2024年の研究（広島大学）では、自分の授業を録画・振り返りした教師が「他者に見せるために整えた授業では気づかなかった問題」を発見したことが報告されています。話が脱線している、説明が長すぎる、特定の生徒にしか目を向けていない——録画は鏡です。"),
      p([bold("最初の一歩："), normal("スマートフォンを教卓の端に置いて録画するだけ。最初の10分だけ見返すところから始めましょう。")]),
      sep(),

      h3("1つだけ「実験」を仕込む"),
      p("毎回の授業に「今日試すこと」を1つ決めます。"),
      bullet("「冒頭に問いを立ててから始める」"),
      bullet("「説明のあとに隣の人と確認させる」"),
      bullet("「板書の量を半分にする」"),
      sep(),
      p("大きな改善より小さな実験の積み重ねが、スキルを確実に伸ばします。"),
      sep(),

      h3("生徒の反応を「データ」として観察する"),
      p("生徒のペンが止まるタイミング、ざわめく瞬間、目が合わなくなる場所——これらはすべて授業のフィードバックです。感情的に受け取らず、「この説明でつまずくのか」「このテンポでは早すぎるのか」と分析的に見る習慣をつけると、次の授業がすぐ改善できます。"),
      sep(),

      // Section 3
      h2("長期的に伸び続ける習慣"),

      h3("他の授業を見学・分析する"),
      p("自分と違う教科・学年の授業を見ることで、盲点が見えます。見学のポイントは「自分だったらどう教えるか」と比較しながら観ること。ただ座っているだけでは気づきは生まれません。"),
      sep(),

      h3("振り返りジャーナルを書く"),
      p("毎回でなくていい。週に1回、3分だけ「今週うまくいったこと・うまくいかなかったこと」をメモする習慣を持つ教師と持たない教師では、1年後に大きな差が生まれます。"),
      p("省察的実践（Reflective Practice）は、教師の専門的成長の研究で繰り返し効果が確認されている手法です。"),
      sep(),

      h3("フィードバックをもらう仕組みを作る"),
      p("生徒に「今日の授業で一番難しかったところは？」を紙1枚で聞く。同僚に「1コマだけ見てもらえる？」とお願いする。外からの視点は、自分では絶対に気づけないものを教えてくれます。"),
      sep(),

      // まとめ
      h2("まとめ——今日から1つだけ変えてみる"),
      p("授業スキルは、生まれ持った才能ではありません。観察し、実験し、振り返る習慣の積み重ねです。"),
      sep(),
      p([bold("今日からやってみてほしいこと、1つだけ。")]),
      sep(),
      p([bold("「次の授業を、スマートフォンで録画してみてください。」")]),
      sep(),
      p("見返すのが怖いかもしれません。でも、その10分があなたの授業を変える最初の一歩になります。教師が成長すれば、その恩恵を受けるのはすべての生徒です。"),
      sep(),
      sep(),

      // 参考文献
      h2("参考文献"),
      p("[1] 文部科学省「OECD国際教員指導環境調査（TALIS）2024報告書」https://www.mext.go.jp/b_menu/toukei/data/Others/20251006-ope_dev02-2.pdf"),
      p("[2] SN Social Sciences (2024). Self-reflection using video recording by Japanese primary school teachers."),
      p("[3] Frontiers in Education (2024). Advancing teacher reflective competence: integrating lesson study and didactic suitability criteria."),
      p("[4] ScienceDirect (2024). Automated feedback improves teachers' questioning quality in brick-and-mortar classrooms. https://www.sciencedirect.com/science/article/abs/pii/S0360131524001970"),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("teaching-skills-blog.docx", buffer);
  console.log("Done: teaching-skills-blog.docx");
});
