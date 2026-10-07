import { GenericProvider, StreamCallback } from '../llmProviders/genericProvider'

/** One request per tab; replaced and closed requests can no longer publish results. */
export class RequestCoordinator {
    private requests = new Map<number, RequestSession>()
    private sequence = 0
    constructor(private deliver: (tabId: number, message: any) => Promise<void>) {}

    begin(tabId: number): RequestSession {
        this.requests.get(tabId)?.stop(true)
        const session = new RequestSession(tabId, ++this.sequence, this, this.deliver)
        this.requests.set(tabId, session)
        return session
    }
    current(tabId: number): RequestSession { return this.requests.get(tabId) }
    finish(session: RequestSession): void {
        if (this.current(session.tabId) === session) this.requests.delete(session.tabId)
    }
    stop(tabId: number, discard = false, requestId?: number): void {
        const session = this.current(tabId)
        if (session && (requestId === undefined || requestId === session.id)) session.stop(discard)
    }
}

export class RequestSession {
    private provider: GenericProvider
    private discarded = false
    stopped = false
    constructor(readonly tabId: number, readonly id: number, private owner: RequestCoordinator,
        private deliver: (tabId: number, message: any) => Promise<void>) {}

    attach(provider: GenericProvider): void {
        this.provider = provider
        if (this.stopped) provider.abort()
    }
    isCurrent(): boolean { return !this.discarded && this.owner.current(this.tabId) === this }
    stop(discard: boolean): void {
        this.stopped = true
        this.discarded ||= discard
        this.provider?.abort()
    }
    send(message: any): Promise<void> {
        if (this.stopped && message.type === 'showError') return Promise.resolve()
        return this.isCurrent() ? this.deliver(this.tabId, { ...message, requestId: this.id }) : Promise.resolve()
    }
    finish(): void { this.owner.finish(this) }

    async runText(operation: (onChunk: StreamCallback) => Promise<string>): Promise<void> {
        let buffer = ''
        let started = false
        let timer: ReturnType<typeof setTimeout>
        const flush = () => {
            timer = undefined
            if (!buffer || !this.isCurrent()) return
            if (!started) { started = true; void this.send({ type: 'streamStart' }) }
            void this.send({ type: 'addTextChunk', content: buffer })
            buffer = ''
        }
        try {
            const text = await operation(chunk => {
                if (!this.isCurrent()) return
                buffer += chunk
                if (!timer) timer = setTimeout(flush, 100)
            })
            clearTimeout(timer)
            if (!started && !buffer) await this.send({ type: 'addText', content: text })
            else { flush(); await this.send({ type: 'endText' }) }
        } catch (error) {
            clearTimeout(timer)
            if (!this.stopped) throw error
            flush()
            await this.send({ type: 'endText' })
        }
    }
}
