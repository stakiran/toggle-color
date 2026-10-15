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

  // プロンプト上の帯に、色付きのストライプとトグルボタンを描く
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // 他の mod が帯に描いたものは残す
    const others = await next(e)
    // アンケートが帯を使っている間は譲る
    if (e.props.hasSurvey) return others

    const { Box, Text, Button } = $.ui.resolve(e)
    const { name, color } = COLORS[index]

    const label = `color: ${name}`
    const button = Button({
      key: 'toggle-color',
      label,
      plain: true,
      dimColor: true,
      onPress: () => cycle($),
    })

    const children = [button]
    if (color) {
      // ボタンの右側を帯の端まで塗りつぶす
      const width = Math.max(1, (e.props.bodyColumns ?? 40) - label.length - 1)
      children.push(
        Text({
          backgroundColor: color,
          wrap: 'truncate-end',
          children: ' '.repeat(width),
        }),
      )
    }

    const row = Box({ flexDirection: 'row', columnGap: 1, children })

    return Box({
      flexDirection: 'column',
      children: others ? [row, others] : [row],
    })
  })
}
