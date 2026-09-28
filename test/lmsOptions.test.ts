import { LmsProvider } from '../src/ts/llmProviders/impl/lmsProvider'
import { ConfigType } from '../src/ts/helpers/configType'

jest.mock('../src/ts/helpers/utils', () => ({
    getLanguageNameFromCode: () => 'English',
    logMessage: jest.fn()
}))

describe('LM Studio optional settings', () => {
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn()
    const config = (lms: ConfigType['lms']) => ({
        mainUserLanguageCode: 'en', servicesTimeout: 30, temperature: 0.5, lms
    } as ConfigType)
    const base = { serviceUrl: 'http://localhost:1234', model: 'test-model' }

    beforeEach(() => { globalThis.fetch = fetchMock; fetchMock.mockReset() })
    afterEach(() => { globalThis.fetch = originalFetch })

    test.each([undefined, '', '   ', ' token '])('model listing with token %p', async token => {
        fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [{ id: 'test-model' }] }) })
        expect(await LmsProvider.getModels(base.serviceUrl, token)).toEqual(['test-model'])
        const [url, request] = fetchMock.mock.calls[0]
        expect(url).toBe(`${base.serviceUrl}/v1/models`)
        expect(request.headers.get('Authorization')).toBe(token?.trim() ? 'Bearer token' : null)
    })

    test.each([undefined, false, true])('generation with disableThinking=%p', async disableThinking => {
        fetchMock.mockResolvedValue({ ok: true, json: async () => disableThinking
            ? { output: [{ type: 'reasoning', content: 'Hidden' }, { type: 'message', content: 'Answer' }] }
            : { choices: [{ message: { content: 'Answer' } }] } })
        const provider = new LmsProvider(config({ ...base, authToken: ' token ', disableThinking }))
        expect(await provider.applyCustomPrompt('Instructions', 'Email')).toBe('Answer')
        const [url, request] = fetchMock.mock.calls[0]
        expect(request.headers.get('Authorization')).toBe('Bearer token')
        expect(request.headers.get('Content-Type')).toBe('application/json')
        expect(url).toBe(base.serviceUrl + (disableThinking ? '/api/v1/chat' : '/v1/chat/completions'))
        expect(JSON.parse(request.body)).toEqual(disableThinking ? {
            model: base.model, system_prompt: 'Instructions', input: 'Email',
            temperature: 0.5, reasoning: 'off', store: false
        } : {
            model: base.model, messages: [{ role: 'system', content: 'Instructions' }, { role: 'user', content: 'Email' }],
            temperature: 0.5
        })
    })

    test('legacy config omits authentication and preserves server errors', async () => {
        fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: { message: 'Unsupported reasoning setting' } }) })
        const provider = new LmsProvider(config({ ...base, disableThinking: true }))
        await expect(provider.applyCustomPrompt('Instructions', 'Email')).rejects.toThrow('Unsupported reasoning setting')
        expect(fetchMock.mock.calls[0][1].headers.has('Authorization')).toBe(false)
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})
