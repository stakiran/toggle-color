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

const NAMES = ['none', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'red']

// 色付きのストライプ(Text には key が残らないので背景色で探す)
const stripeOf = async (ui: { findAll: (q: { type: string }) => Promise<{ props: Record<string, unknown> }[]> }) =>
  (await ui.findAll({ type: 'Text' })).find(t => t.props.backgroundColor !== undefined)

test('/toggle-color <name> sets the color and the band shows it', async ($, on) => {
  // エンジン本体や他の mod の代わり: 帯の下側に 1 行描く
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Text({ key: 'below', children: 'below' }))

  const set = await $.command.run({ command: 'toggle-color', args: 'blue' })
  expect(set.text).toBe('色: blue')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'toggle-color', surface, ...BAND })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color: blue')
    const stripe = await stripeOf(ui)
    expect(stripe?.props.backgroundColor).toBe('#4A7BD0')
    // 他の mod が描いたものは残る
    expect((await ui.find({ type: 'Text', text: 'below' }))?.text).toBe('below')
    await ui.unmount()
  }
})

test('pressing the button cycles through every color and wraps to none', async ($, on) => {
  // エンジン本体や他の mod の代わり: 帯の下側に 1 行描く
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Text({ key: 'below', children: 'below' }))
  await $.command.run({ command: 'toggle-color', args: 'none' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'toggle-color', surface, ...BAND })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color: none')
    expect(await stripeOf(ui)).toBeUndefined()

    for (const name of NAMES.slice(1)) {
      await ui.press({ key: 'toggle-color' })
      expect((await ui.find({ key: 'toggle-color' }))?.text).toBe(`color: ${name}`)
      expect(await stripeOf(ui)).toBeDefined()
    }

    // 最後の色の次は「色なし」に戻る
    await ui.press({ key: 'toggle-color' })
    expect((await ui.find({ key: 'toggle-color' }))?.text).toBe('color: none')
    expect(await stripeOf(ui)).toBeUndefined()
    await ui.unmount()
  }
})

test('an unknown color name is refused with the list of names', async ($, on) => {
  // エンジン本体や他の mod の代わり: 帯の下側に 1 行描く
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Text({ key: 'below', children: 'below' }))
  const r = await $.command.run({ command: 'toggle-color', args: 'purple' })
  expect(r.text).toContain('不明な色: purple')
  expect(r.text).toContain('blue')
})

test('the band yields while a survey holds it', async ($, on) => {
  // エンジン本体や他の mod の代わり: 帯の下側に 1 行描く
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Text({ key: 'below', children: 'below' }))
  const ui = await $.ui.mount({
    plugin: 'toggle-color',
    surface: 'terminal',
    ...BAND,
    props: { ...BAND.props, hasSurvey: true },
  })
  expect(await ui.find({ key: 'toggle-color' })).toBeUndefined()
  await ui.unmount()
})
