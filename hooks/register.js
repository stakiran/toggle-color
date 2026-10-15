// 色の候補。先頭は「色なし」。押すたびにこの順で巡回する
// ライト/ダークどちらのテーマでも目に刺さらないよう、彩度を少し落とした色
const COLORS = [
  { name: 'none', color: null },
  { name: 'blue', color: '#4A7BD0' },
  { name: 'green', color: '#3E9E5B' },
  { name: 'yellow', color: '#C9A227' },
  { name: 'magenta', color: '#B569C8' },
  { name: 'cyan', color: '#3AA6B9' },
  { name: 'red', color: '#D05A5A' },
]

// 現在の色。セッション内だけで持ち、終了すれば消える(あえて記憶しない)
let index = 0

function setIndex($, next) {
  index = next
  // 帯も会話の各行も描き直す
  $.ui.invalidate('ui.render')
}

function cycle($) {
  setIndex($, (index + 1) % COLORS.length)
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'toggle-color',
      description: '帯の色を切り替える。/toggle-color <色名> で直接指定、none で消す',
    })
    return next(e)
  })

  // /toggle-color        → 次の色へ
  // /toggle-color blue   → その色に
  // /toggle-color none   → 色なしに
  on('command.run', { command: 'toggle-color' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === '') {
      cycle($)
    } else {
      const found = COLORS.findIndex(c => c.name === arg)
      if (found < 0) {
        return { text: `不明な色: ${arg}。使える色: ${COLORS.map(c => c.name).join(', ')}` }
      }
      setIndex($, found)
    }
    return { text: `色: ${COLORS[index].name}` }
  })

  // プロンプト上の帯に、トグルボタンと色付きのストライプを描く
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // 他の mod が帯に描いたもの(open-latest のボタンなど)は同じ行の左側に残す
    const others = await next(e)
    // アンケートが帯を使っている間は譲る
    if (e.props.hasSurvey) return others

    const { Box, Text, Button } = $.ui.resolve(e)
    const { color } = COLORS[index]

    // ラベルは固定の "color" だけにする(色名を入れると幅が変わって並びがずれる)
    const button = Button({
      key: 'toggle-color',
      label: 'color',
      plain: true,
      dimColor: true,
      onPress: () => cycle($),
    })

    // 他 mod の描画とボタンは縮ませない(ストライプが余白を食ってずれていた)
    // 他 mod の描画との間は 2 桁あける(columnGap は入れ子の Box との間で効かなかった)
    const children = [Box({ flexShrink: 0, marginLeft: others ? 2 : 0, children: [button] })]
    if (others) children.unshift(Box({ flexShrink: 0, children: [others] }))
    if (color) {
      // ボタンの右側を帯の端まで塗りつぶす。残り幅いっぱいに伸び、はみ出す分は隠す
      children.push(
        Box({
          flexGrow: 1,
          flexShrink: 1,
          overflow: 'hidden',
          marginLeft: 1,
          backgroundColor: color,
          children: [Text({ backgroundColor: color, wrap: 'truncate-end', children: ' ' })],
        }),
      )
    }

    return Box({ flexDirection: 'row', children })
  })

  // 会話の中の Claude の回答ブロックの左に、色付きの縦線を付ける
  // (ペインを切り替えるとき、画面は回答で終わっていることが多いので、回答側に色を付ける)
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const row = await next(e)
    const { color } = COLORS[index]
    if (!color || !row) return row

    const { Box } = $.ui.resolve(e)
    // 幅 1 桁の Box に背景色を付ける。行方向の Box の子は高さが揃うので、回答の全行にわたる
    return Box({
      flexDirection: 'row',
      children: [
        Box({ width: 1, flexShrink: 0, backgroundColor: color }),
        Box({ flexGrow: 1, children: [row] }),
      ],
    })
  })
}
