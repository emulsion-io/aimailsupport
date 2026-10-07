import { OpenAiApiCompatibleProvider } from '../abstractOpenAiApiCompatibleProvider'
import { StreamCallback } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'

/** LM Studio: shared OpenAI API, with optional native reasoning control. */
export class LmsProvider extends OpenAiApiCompatibleProvider {
    private readonly disableThinking: boolean

    public constructor(config: ConfigType) {
        super(config, { serviceLabel: 'LM Studio', baseUrl: config.lms.serviceUrl,
            model: config.lms.model, apiKey: config.lms.authToken?.trim() })
        this.disableThinking = config.lms.disableThinking === true
    }

    public static async getModels(serviceUrl: string, authToken: string = ''): Promise<string[]> {
        return OpenAiApiCompatibleProvider.fetchModels(serviceUrl, 'LM Studio', authToken?.trim() || '')
    }

    protected async manageMessageContent(systemInput: string, userInput: string, onChunk?: StreamCallback): Promise<string> {
        if (!this.disableThinking) return super.manageMessageContent(systemInput, userInput, onChunk)
        // Native chat is kept non-streaming: its event protocol differs from SSE chat completions.
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
                method: 'POST', headers: this.getHeaders(), signal,
                body: JSON.stringify({ model: this.model, system_prompt: systemInput, input: userInput,
                    ...(this.temperature !== null && { temperature: this.temperature }), reasoning: 'off', store: false })
            })
            if (!response.ok) throw new Error(`LM Studio error: ${await LmsProvider.extractErrorMessage(response)}`)
            const data = await response.json()
            const text = data.choices?.[0]?.message?.content || (data.output || [])
                .filter((entry: any) => entry.type === 'message' && typeof entry.content === 'string')
                .map((entry: any) => entry.content).join('')
            if (typeof text !== 'string' || !text.trim()) throw new Error('LM Studio error: invalid response format')
            return text
        } finally {
            clearAbortSignalWithTimeout()
        }
    }
}
