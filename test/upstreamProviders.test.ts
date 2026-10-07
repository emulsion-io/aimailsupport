import { ConfigType } from '../src/ts/helpers/configType'
import { LmsProvider } from '../src/ts/llmProviders/impl/lmsProvider'
import { DeepseekProvider } from '../src/ts/llmProviders/impl/deepseekProvider'
import { OpenAiGptProvider } from '../src/ts/llmProviders/impl/openAiGptProvider'
import { OpenRouterProvider } from '../src/ts/llmProviders/impl/openRouterProvider'
import { GoogleGeminiProvider } from '../src/ts/llmProviders/impl/googleGeminiProvider'
import { OllamaProvider } from '../src/ts/llmProviders/impl/ollamaProvider'
import { ProviderFactory } from '../src/ts/llmProviders/providerFactory'

jest.mock('../src/ts/helpers/utils', () => ({ getLanguageNameFromCode: () => 'French', logMessage: jest.fn() }))
const config = { mainUserLanguageCode: 'fr', servicesTimeout: 1, temperature: 0, streamResponses: false,
    lms: { serviceUrl: 'http://localhost:1234/', model: 'local', authToken: ' token ' },
    deepseek: { apiKey: 'key' }, openai: { model: 'test', apiKey: 'key', text2speech: {} },
    openrouter: { model: 'test', apiKey: 'key' }, google: { model: 'test', apiKey: 'key' },
    ollama: { serviceUrl: 'http://localhost:11434', model: 'test' },
    openaicompatible: { serviceUrl: 'http://localhost:9931/v1/', model: 'test' },
    vllm: { serviceUrl: 'http://localhost:8000', model: 'test' }
} as ConfigType
const json = (data: any) => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
const sse = (events: any[]) => new Response(events.map(event => 'data: '+JSON.stringify(event)+'\r\n\r\n').join('')+'data: [DONE]\r\n\r\n', { headers: { 'Content-Type': 'text/event-stream' } })

describe('upstream provider regressions', () => {
    const originalFetch = globalThis.fetch, fetchMock = jest.fn()
    beforeEach(() => { globalThis.fetch = fetchMock; fetchMock.mockReset() })
    afterEach(() => { globalThis.fetch = originalFetch; jest.useRealTimers() })
    test('legacy DeepSeek gets a model and zero temperature is preserved', async () => {
        fetchMock.mockResolvedValue(json({ choices: [{ message: { content: 'answer' } }] }))
        await new DeepseekProvider(config).summarizeText('email')
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ model: 'deepseek-chat', temperature: 0 })
    })
    test('OpenAI collects message text after reasoning blocks and does not store emails', async () => {
        fetchMock.mockResolvedValue(json({ output: [{ type: 'reasoning', status: 'completed' },
            { type: 'message', content: [{ type: 'output_text', text: 'one' }, { type: 'output_text', text: 'two' }] }] }))
        expect(await new OpenAiGptProvider(config).summarizeText('email')).toBe('onetwo')
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).store).toBe(false)
    })
    test('OpenAI rejects incomplete non-streaming answers', async () => {
        fetchMock.mockResolvedValue(json({ status: 'incomplete', output: [] }))
        await expect(new OpenAiGptProvider(config).summarizeText('email')).rejects.toThrow('Incomplete')
    })
    test('LM Studio streaming authenticates and excludes reasoning deltas', async () => {
        fetchMock.mockResolvedValue(sse([{ choices: [{ delta: { reasoning_content: 'hidden' } }] }, { choices: [{ delta: { content: 'visible' } }] }]))
        const chunks: string[] = []
        expect(await new LmsProvider({ ...config, streamResponses: true }).summarizeText('email', text => chunks.push(text))).toBe('visible')
        expect(chunks).toEqual(['visible'])
        expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:1234/v1/chat/completions')
        expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token')
    })
    test('OpenRouter keeps the SSE Accept header', async () => {
        fetchMock.mockResolvedValue(sse([{ choices: [{ delta: { content: 'answer' } }] }]))
        await new OpenRouterProvider({ ...config, streamResponses: true }).summarizeText('email', () => {})
        expect(fetchMock.mock.calls[0][1].headers.get('Accept')).toBe('text/event-stream')
    })
    test.each(['openaicompatible', 'vllm'])('new provider %s retains capability detection', async llmProvider => {
        fetchMock.mockResolvedValue(json({ choices: [{ message: { content: 'answer' } }] }))
        const provider = ProviderFactory.getInstance({ ...config, llmProvider })
        expect(provider.canSummarizeText()).toBe(true); expect(provider.canApplyCustomPrompt()).toBe(true)
        expect(await provider.summarizeText('email')).toBe('answer')
        expect(fetchMock.mock.calls[0][0]).not.toContain('/v1/v1/')
    })
    test('Gemini legacy settings omit thinking and concatenate visible parts', async () => {
        fetchMock.mockResolvedValue(json({ candidates: [{ content: { parts: [{ thought: true, text: 'hidden' }, { text: 'one' }, { text: 'two' }] } }] }))
        expect(await new GoogleGeminiProvider(config).summarizeText('email')).toBe('onetwo')
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).generationConfig.thinkingConfig).toBeUndefined()
    })
    test.each([['gemini-3.8-flash', { thinkingLevel: 'LOW' }], ['gemini-2.5-flash', { thinkingBudget: 1024 }]])('Gemini thinking uses fields compatible with %s', async (model, thinkingConfig) => {
        fetchMock.mockResolvedValue(json({ candidates: [{ content: { parts: [{ text: 'answer' }] } }] }))
        await new GoogleGeminiProvider({ ...config, google: { ...config.google, model: model as string, reasoningEffort: 'low' } }).summarizeText('email')
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).generationConfig.thinkingConfig).toEqual(thinkingConfig)
    })
    test('Ollama default reasoning is omitted and null temperature is not sent', async () => {
        fetchMock.mockResolvedValue(json({ choices: [{ message: { content: 'answer' } }] }))
        await new OllamaProvider({ ...config, temperature: null }).summarizeText('email')
        const body = JSON.parse(fetchMock.mock.calls[0][1].body)
        expect(body).not.toHaveProperty('reasoning_effort'); expect(body).not.toHaveProperty('temperature')
    })
    test('stream inactivity still times out after the first bytes', async () => {
        jest.useFakeTimers()
        fetchMock.mockImplementation(async (_url, options) => {
            return new Response(new ReadableStream({ start(controller) {
                controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'))
                options.signal.addEventListener('abort', () => controller.error(new DOMException('timeout', 'AbortError')))
            } }))
        })
        const operation = new LmsProvider({ ...config, streamResponses: true }).summarizeText('email', () => {})
        const assertion = expect(operation).rejects.toMatchObject({ name: 'AbortError' })
        await jest.advanceTimersByTimeAsync(1100); await assertion
        expect(jest.getTimerCount()).toBe(0)
    })
    test('fetch rejection clears its timeout', async () => {
        jest.useFakeTimers(); fetchMock.mockRejectedValue(new Error('network'))
        await expect(new LmsProvider(config).summarizeText('email')).rejects.toThrow('network')
        expect(jest.getTimerCount()).toBe(0)
    })
    test('truncated streams are reported instead of silently accepting a partial answer', async () => {
        fetchMock.mockResolvedValue(new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'))
        await expect(new LmsProvider({ ...config, streamResponses: true }).summarizeText('email', () => {}))
            .rejects.toThrow('incomplete response stream')
    })
    test('abort before a chained operation is attached stays effective', async () => {
        fetchMock.mockImplementation(async (_url, options) => { if (options.signal.aborted) throw new DOMException('stopped', 'AbortError'); return json({}) })
        const provider = new LmsProvider(config); provider.abort()
        await expect(provider.summarizeText('email')).rejects.toMatchObject({ name: 'AbortError' })
    })
})
