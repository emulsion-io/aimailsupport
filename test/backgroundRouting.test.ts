/// <reference types="node" />
import { ProviderFactory } from '../src/ts/llmProviders/providerFactory'
import { getCurrentMessageContent, sendMessageToTab } from '../src/ts/helpers/utils'
jest.mock('../src/ts/llmProviders/providerFactory', () => ({ ProviderFactory: { getInstance: jest.fn() } }))
jest.mock('../src/ts/helpers/utils', () => ({ getConfigs: jest.fn().mockResolvedValue({}),
    getConfig: jest.fn().mockResolvedValue([]), getCurrentMessageContent: jest.fn().mockResolvedValue('email'),
    isComposeDisplayed: jest.fn().mockResolvedValue(true), getLanguageNameFromCode: jest.fn(),
    logMessage: jest.fn(), sendMessageToTab: jest.fn().mockResolvedValue(undefined) }))
let click: (info: any, tab: any) => Promise<void>
let listeners: ((message: any, sender: any) => Promise<void>)[]
let provider: any
beforeEach(() => {
    jest.clearAllMocks(); listeners = []
    provider = new Proxy({ summarizeText: jest.fn().mockResolvedValue('summary'), abort: jest.fn() },
        { get: (target, key) => key in target ? target[key] : () => true })
    ;(ProviderFactory.getInstance as jest.Mock).mockReturnValue(provider)
    const api = { i18n: { getMessage: (key: string) => key }, menus: {
        create: (options: any) => options.id, update: jest.fn(), remove: jest.fn(),
        onClicked: { addListener: (fn: any) => { click = fn } } }, runtime: {
        onMessage: { addListener: (fn: any) => listeners.push(fn) }, openOptionsPage: jest.fn() },
        tabs: { onRemoved: { addListener: jest.fn() } }, compose: {
            getComposeDetails: jest.fn().mockResolvedValue({ isPlainText: false, body: '<p>original</p>' }),
            setComposeDetails: jest.fn().mockResolvedValue(undefined) },
        messageDisplayScripts: { register: jest.fn() }, composeScripts: { register: jest.fn() } }
    Object.defineProperty(globalThis, 'browser', { configurable: true, value: api })
    Object.defineProperty(globalThis, 'messenger', { configurable: true, value: api })
    jest.isolateModules(() => { require('../src/ts/background') })
})
test('menu responses and content retrieval stay on the originating tab', async () => {
    await click({ menuItemId: 'aiSummarize' }, { id: 42 })
    expect(getCurrentMessageContent).toHaveBeenCalledWith(42)
    expect((sendMessageToTab as jest.Mock).mock.calls.every(call => call[0] === 42)).toBe(true)
    expect(sendMessageToTab).toHaveBeenCalledWith(42, expect.objectContaining({ type: 'addText', content: 'summary' }))
})
test.each([false, true])('compose insertion uses Thunderbird API (plainText=%s)', async plainText => {
    ;(messenger.compose.getComposeDetails as jest.Mock).mockResolvedValue({ isPlainText: plainText, body: '<p>original</p>', plainTextBody: 'original' })
    await listeners[0]({ type: 'insertAtComposeTop', htmlContent: '<strong>new</strong>', textContent: 'new' }, { tab: { id: 42 } })
    expect(messenger.compose.setComposeDetails).toHaveBeenCalledWith(42, plainText ? { plainTextBody: 'new\n\noriginal' } : { body: '<div><strong>new</strong></div><br><p>original</p>' })
})
test('the unmodified sanitizer loads before the response panel in both contexts', () => {
    for (const register of [messenger.messageDisplayScripts.register, messenger.composeScripts.register]) {
        const scripts = (register as jest.Mock).mock.calls[0][0].js
        expect(scripts[0].file).toBe('/vendor/purify.min.js')
        expect(scripts[1].file).toBe('/outputDisplay/outputDisplay.js')
    }
})
