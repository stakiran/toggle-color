# toggle-color

プロンプトの上の帯に色付きのストライプを表示し、ボタンを押すたびに色を切り替える Claude Code MOD。

複数のターミナルやペインで Claude Code を開いているときに、どれがどれか一目で見分けるための道具です。

## 使い方

- 帯の `color: none` ボタンを押すたびに、色が `blue → green → yellow → magenta → cyan → red → none` の順に切り替わります。
- スラッシュコマンドでも操作できます。
  - `/toggle-color` 次の色へ
  - `/toggle-color blue` その色に(blue, green, yellow, magenta, cyan, red)
  - `/toggle-color none` 色を消す
- 色はセッションの中だけで持ちます。Claude Code を終了すると消え、次回は `none` から始まります。
  - 「このペインは青」のような記憶はあえてしていません。MOD の保存領域は全セッション共有なので、記憶すると開いたペイン全部が同じ色で起動してしまい、見分けるという目的に反するためです。

## 仕組み

- MOD だけで完結しており、ターミナルの背景色などは一切触りません。ターミナル非依存です。
- 他の MOD が同じ帯に描いたもの(たとえば [open-latest](https://github.com/stakiran/open-latest) のボタン)はそのまま残り、その上にストライプが載ります。
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
