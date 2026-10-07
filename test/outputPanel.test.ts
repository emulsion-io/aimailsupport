/** @jest-environment jsdom */
/// <reference types="node" />
import DOMPurify from 'dompurify'
jest.mock('../src/ts/helpers/utils', () => ({ logMessage: jest.fn() }))
jest.mock('marked', () => {
    const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), module = { exports: {} }
    vm.runInNewContext(fs.readFileSync(path.join(path.dirname(require.resolve('marked')), 'marked.umd.js'), 'utf8'), { module, exports: module.exports })
    return module.exports
})
let receive: (message: any) => boolean
let send: jest.Mock
const panel = () => document.querySelector('#amsOuterResponse')?.shadowRoot
const message = async (type: string, content?: any, requestId = 1) => {
    receive({ type, content, requestId }); await new Promise(resolve => setTimeout(resolve, 0))
}
beforeEach(() => {
    document.body.replaceChildren()
    send = jest.fn().mockResolvedValue(undefined)
    const api = { storage: { sync: { get: jest.fn().mockResolvedValue({ theme: 'dark' }) } },
        runtime: { onMessage: { addListener: (listener: any) => { receive = listener } },
            sendMessage: send, getURL: (path: string) => path }, i18n: { getMessage: (key: string) => key } }
    Object.defineProperty(globalThis, 'browser', { configurable: true, value: api })
    Object.defineProperty(globalThis, 'messenger', { configurable: true, value: api })
    Object.defineProperty(globalThis, 'DOMPurify', { configurable: true, value: DOMPurify })
    jest.isolateModules(() => { require('../src/ts/outputDisplay') })
})
test('streaming uses the themed shadow panel and preserves a refinable result', async () => {
    await message('thinking', 'waiting')
    expect(panel()?.querySelector('#amsInnerResponse')?.classList.contains('dark')).toBe(true)
    expect(panel()?.querySelector('.stop-icon')).not.toBeNull()
    await message('streamStart'); await message('addTextChunk', '**Hello**'); await message('endText')
    expect(panel()?.querySelector('strong')?.textContent).toBe('Hello')
    ;(panel()?.querySelector('.refine-icon') as HTMLElement).click()
    const input = panel()?.querySelector('#refineTextarea') as HTMLTextAreaElement
    input.value = 'shorter'
    ;(panel()?.querySelector('.refine-send') as HTMLElement).click()
    expect(send).toHaveBeenCalledWith({ type: 'refineLastResponse', refinementPrompt: 'shorter', lastResponse: '**Hello**' })
})
test('closed panels do not reappear from delayed chunks or final responses', async () => {
    await message('thinking', 'waiting')
    ;(panel()?.querySelector('.close-icon') as HTMLElement).click()
    expect(send).toHaveBeenCalledWith({ type: 'stopGeneration', discardOutput: true, requestId: 1 })
    await message('addTextChunk', 'late'); await message('addText', 'late')
    expect(panel()).toBeUndefined()
    await message('thinking', 'new', 2); await message('addText', 'new answer', 2)
    expect(panel()?.querySelector('#amsContent')?.textContent?.trim()).toBe('new answer')
})
test('old responses and unrelated messages cannot replace the current answer', async () => {
    await message('addText', 'latest', 2); await message('addText', 'old', 1)
    receive({ type: 'optionsChanged' }); await new Promise(resolve => setTimeout(resolve, 0))
    expect(panel()?.querySelector('#amsContent')?.textContent?.trim()).toBe('latest')
})
test('compose insertion sends sanitized HTML and a plain-text representation', async () => {
    await message('addText', '**Hello**<img src=x onerror="alert(1)">')
    ;(panel()?.querySelector('.copy-top-icon') as HTMLElement).click()
    const payload = send.mock.calls[0][0]
    expect(payload.type).toBe('insertAtComposeTop')
    expect(payload.htmlContent).toContain('<strong>Hello</strong>')
    expect(payload.htmlContent).not.toMatch(/img|onerror/)
    expect(payload.textContent).toContain('Hello')
})
