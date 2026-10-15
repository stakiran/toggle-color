# toggle-color

プロンプトの上の帯に色付きのストライプを表示し、ボタンを押すたびに色を切り替える Claude Code MOD。色がある間は、会話の中の Claude の回答の左にも同じ色の縦線が付きます。

複数のターミナルやペインで Claude Code を開いているときに、どれがどれか一目で見分けるための道具です。

## 使い方

- 帯の `color` ボタンを押すたびに、色が `blue → green → yellow → magenta → cyan → red → none` の順に切り替わります。
- スラッシュコマンドでも操作できます。
  - `/toggle-color` 次の色へ
  - `/toggle-color blue` その色に(blue, green, yellow, magenta, cyan, red)
  - `/toggle-color none` 色を消す
- 色はセッションの中だけで持ちます。Claude Code を終了すると消え、次回は `none` から始まります。
  - 「このペインは青」のような記憶はあえてしていません。MOD の保存領域は全セッション共有なので、記憶すると開いたペイン全部が同じ色で起動してしまい、見分けるという目的に反するためです。

## 仕組み

- MOD だけで完結しており、ターミナルの背景色などは一切触りません。ターミナル非依存です。
- 他の MOD が同じ帯に描いたもの(たとえば [open-latest](https://github.com/stakiran/open-latest) のボタン)は同じ行の左側に残り、その右にボタンとストライプが並びます。
  - 帯の並び順は MOD の読み込み順で決まります。他の MOD が toggle-color より先に読み込まれた場合は、縦に 2 行並ぶことがあります。
- 縦線は Claude の回答ブロックに付きます。ペインを切り替えるとき画面は回答で終わっていることが多いので、回答側に色を付けています。本文は 1 桁右にずれます。
- アンケート(survey)が帯を使っている間は表示を譲ります。

## 必要なもの

- ターミナル版の Claude Code(帯はターミナルとデスクトップアプリで描かれます)

## インストール

ターミナル版 Claude Code のプロンプトで:

```
/plugin install toggle-color --marketplace stakiran/toggle-color
```

シェルから:

```
claude plugin install toggle-color --marketplace stakiran/toggle-color
```

アンインストールは `/plugin` メニューから。

## インストールせずに試す

このリポジトリを clone して:

```
claude --plugin-dir ./toggle-color
```

そのセッションだけ MOD が読み込まれます。

## 開発

```
claude plugin validate .
claude plugin test .
```

## License

MIT
