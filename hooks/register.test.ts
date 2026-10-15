import { expect, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 60,
    scroll: { offset: 0, bodyRows: 9 },
    view: {},
  },
} as const

const REPLY = {
  component: 'AssistantMessage',
  props: {
    text: 'hello',
    isFirstOfReply: true,
  },
} as const

const NAMES = ['none', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'red']

type Drawn = { findAll: (q: { type: string }) => Promise<{ props: Record<string, unknown> }[]> }

// 帯のストライプ(Text には key が残らないので背景色で探す)
const stripeOf = async (ui: Drawn) =>
  (await ui.findAll({ type: 'Text' })).find(t => t.props.backgroundColor !== undefined)

// 回答ブロックの左の縦線(幅 1 桁の、背景色付きの Box)
const barOf = async (ui: Drawn) =>
  (await ui.findAll({ type: 'Box' })).find(b => b.props.width === 1 && b.props.backgroundColor !== undefined)

// エンジン本体や他の mod の代わり: 帯には open-latest 風のボタン行を、回答には 1 行描く
const bottom = ($: any, e: any) => {
  const { Box, Button, Text } = $.ui.resolve(e)
  if (e.component === 'AbovePrompt') {
    return Box({
      flexDirection: 'column',
      children: [Box({ flexDirection: 'row', children: [Button({ key: 'open', label: 'open', plain: true, onPress: () => {} })] })],
    })
  }
  return Text({ children: e.props.text })
}

test('/toggle-color <name> sets the color and the band shows it beside the others', async ($, on) => {
  on('ui.render', bottom)

  const set = await $.command.run({ command: 'toggle-color', args: 'blue' })
  expect(set.text).toBe('色: blue')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'toggle-color', surface, ...BAND })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color')
    expect((await stripeOf(ui))?.props.backgroundColor).toBe('#4A7BD0')
    // 他の mod のボタンは残り、帯の一番外側は横並びの 1 行
    expect(await ui.find({ type: 'Button', text: 'open' })).toBeDefined()
    expect(await ui.drawn()).toMatchObject({ type: 'Box', props: { flexDirection: 'row' } })
    await ui.unmount()
  }
})

test('pressing the button cycles through every color and wraps to none', async ($, on) => {
  on('ui.render', bottom)
  await $.command.run({ command: 'toggle-color', args: 'none' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'toggle-color', surface, ...BAND })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color')
    expect(await stripeOf(ui)).toBeUndefined()

    for (const name of NAMES.slice(1)) {
      await ui.press({ key: 'toggle-color' })
      expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color')
      expect(await stripeOf(ui)).toBeDefined()
    }

    // 最後の色の次は「色なし」に戻る
    await ui.press({ key: 'toggle-color' })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color')
    expect(await stripeOf(ui)).toBeUndefined()
    await ui.unmount()
  }
})

test('an assistant reply gets a colored bar, and none when the color is off', async ($, on) => {
  on('ui.render', bottom)

  await $.command.run({ command: 'toggle-color', args: 'green' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'toggle-color', surface, ...REPLY })
    expect((await barOf(ui))?.props.backgroundColor).toBe('#3E9E5B')
    // エンジンが描いた回答は残る
    expect(await ui.find({ type: 'Text', text: 'hello' })).toBeDefined()
    await ui.unmount()
  }

  await $.command.run({ command: 'toggle-color', args: 'none' })
  const ui = await $.ui.mount({ plugin: 'toggle-color', surface: 'terminal', ...REPLY })
  expect(await barOf(ui)).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'hello' })).toBeDefined()
  await ui.unmount()
})

test('an unknown color name is refused with the list of names', async $ => {
  const r = await $.command.run({ command: 'toggle-color', args: 'purple' })
  expect(r.text).toContain('不明な色: purple')
  expect(r.text).toContain('blue')
})

test('the band yields while a survey holds it', async ($, on) => {
  on('ui.render', bottom)
  await $.command.run({ command: 'toggle-color', args: 'blue' })
  const ui = await $.ui.mount({
    plugin: 'toggle-color',
    surface: 'terminal',
    ...BAND,
    props: { ...BAND.props, hasSurvey: true },
  })
  expect(await ui.find({ key: 'toggle-color' })).toBeUndefined()
  expect(await stripeOf(ui)).toBeUndefined()
  await ui.unmount()
})
