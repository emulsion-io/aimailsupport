import { GenericProvider } from '../genericProvider'
import { ConfigType } from '../../helpers/configType'
import { getLanguageNameFromCode, logMessage } from '../../helpers/utils'

/**
 * Class with the implementation of methods useful for interfacing with the
 * LM Studio APIs.
 * Official documentation: https://lmstudio.ai/docs/api
 */
export class LmsProvider extends GenericProvider {
    private readonly serviceUrl: string
    private readonly model: string
    private readonly authToken: string

    public constructor(config: ConfigType) {
        super(config)

        this.serviceUrl = config.lms.serviceUrl
        this.model = config.lms.model
        this.authToken = config.lms.authToken || ''
    }

    public async analyzeTextIntent(input: string): Promise<string> {
        logMessage(`Request to analyze text intent of ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.ANALYZE_INTENT.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async applyCustomPrompt(userPrompt: string, input: string): Promise<string> {
        logMessage(`Applying custom user prompt "${userPrompt}" to input text: "${input}"`, 'debug')

        return this.manageMessageContent(userPrompt, input)
    }

    public async explainText(input: string): Promise<string> {
        logMessage(`Request to explain in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.EXPLAIN.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    /**
     * Returns an array of model IDs for all available LM Studio models in
     * the local installation.
     */
    public static async getModels(serviceUrl: string, authToken: string = ''): Promise<string[]> {
        const headers: Headers = new Headers()

        if(authToken?.trim()) {
            headers.append('Authorization', `Bearer ${authToken.trim()}`)
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        }

        const response = await fetch(`${serviceUrl}/v1/models`, requestOptions)

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`AI Studio error: ${errorResponse.error.message}`)
        }

        const responseData = await response.json()

        // Return an array of model IDs from the response data
        return responseData.data.map((model: { id: string }) => model.id)
    }

    public async rephraseText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to rephrase in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.REPHRASE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input)
    }

    public async suggestImprovementsForText(input: string): Promise<string> {
        logMessage(`Request suggest improvements in ${getLanguageNameFromCode(this.mainUserLanguageCode)} for the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_IMPROVEMENTS.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async suggestReplyFromText(input: string, toneOfVoice: string): Promise<string> {
        logMessage(`Request to use the tone of voice "${toneOfVoice}" to suggest a reply in ${getLanguageNameFromCode(this.mainUserLanguageCode)} to the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUGGEST_REPLY.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode))
            .replace('%toneOfVoice%', toneOfVoice), input)
    }

    public async summarizeText(input: string): Promise<string> {
        logMessage(`Request to summarize in ${getLanguageNameFromCode(this.mainUserLanguageCode)} the text: ${input} in ${getLanguageNameFromCode(this.mainUserLanguageCode)}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.SUMMARIZE.replace('%language%', getLanguageNameFromCode(this.mainUserLanguageCode)), input)
    }

    public async testIntegration(): Promise<void> {
        await this.translateText('Hi!')
    }

    public async translateText(input: string, languageCode: string | null = null): Promise<string> {
        languageCode = languageCode ?? this.mainUserLanguageCode
        logMessage(`Request to translate in ${getLanguageNameFromCode(languageCode)} the text: ${input}`, 'debug')

        return this.manageMessageContent(this.PROMPTS.TRANSLATE.replace('%language%', getLanguageNameFromCode(languageCode)), input)
    }

    /**
     * This asynchronous method manages message content by sending a request
     * to the AI Studio API using the provided system and user input.
     * It constructs a POST request with the relevant model and message data,
     * manages the request with a timeout signal, and processes the response.
     *
     * If the request is successful, it returns the content of the response
     * message.
     * In case of failure, it throws an error with the specific message from
     * the AI Studio API.
     *
     * @param systemInput - The input for the 'system' role in the conversation.
     * @param userInput - The input for the 'user' role in the conversation.
     *
     * @returns A promise that resolves to the content of the response message
     *          from the API.
     *
     * @throws An error if the API response is not successful.
     */
    private async manageMessageContent(systemInput: string, userInput: string): Promise<string> {
        const { signal, clearAbortSignalWithTimeout } = this.createAbortSignalWithTimeout(this.servicesTimeout)

        // The AI Studio APIs explicitly require the declaration of the header
        // field with a content type set to application/json.
        const headers: Headers = new Headers()
        headers.append('Content-Type', 'application/json')

        if(this.authToken.trim()) {
            headers.append('Authorization', `Bearer ${this.authToken.trim()}`)
        }

        const requestData = JSON.stringify({
            'model': this.model,
            'messages': [
                { 'role': 'system', 'content': systemInput },
                { 'role': 'user', 'content': userInput }
            ],
            'temperature': this.temperature
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: headers,
            body: requestData,
            redirect: 'follow',
            signal: signal
        }

        let response: Response
        try {
            response = await fetch(`${this.serviceUrl}/v1/chat/completions`, requestOptions)
        } catch (error) {
            const errorName = (error as { name?: string })?.name

            if(errorName === 'AbortError') {
                throw new Error(`LM Studio timeout: request exceeded ${this.servicesTimeout}s`)
            }

            throw error
        } finally {
            clearAbortSignalWithTimeout()
        }

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`LM Studio error: ${errorResponse.error}`)
        }

        const responseData = await response.json()
        return this.extractAssistantMessage(responseData)
    }

    private extractAssistantMessage(responseData: any): string {
        const openAiCompatibleContent = responseData?.choices?.[0]?.message?.content
        if(typeof openAiCompatibleContent === 'string' && openAiCompatibleContent.trim().length > 0) {
            return openAiCompatibleContent
        }

        if(Array.isArray(responseData?.output)) {
            const outputMessage = responseData.output
                .filter((entry: { type?: unknown; content?: unknown }) => entry?.type === 'message' && typeof entry?.content === 'string')
                .map((entry: { content: string }) => entry.content)
                .join('')
                .trim()

            if(outputMessage.length > 0) {
                return outputMessage
            }
        }

        throw new Error('LM Studio error: invalid response format')
    }
}