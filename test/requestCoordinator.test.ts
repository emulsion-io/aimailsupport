import { RequestCoordinator } from '../src/ts/helpers/requestCoordinator'

const deferred = <T>() => { let resolve: (value: T) => void; let reject: (error: Error) => void
    const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

describe('request ownership and cancellation', () => {
    test('replaced response cannot overwrite the new response', async () => {
        const deliver = jest.fn().mockResolvedValue(undefined)
        const owner = new RequestCoordinator(deliver)
        const a = owner.begin(1), abort = jest.fn()
        a.attach({ abort } as any)
        const old = deferred<string>(), newAnswer = deferred<string>()
        const oldRun = a.runText(() => old.promise)
        const b = owner.begin(1)
        const newRun = b.runText(() => newAnswer.promise)
        newAnswer.resolve('new'); await newRun; b.finish()
        old.resolve('old'); await oldRun; a.finish()
        expect(abort).toHaveBeenCalledTimes(1)
        expect(deliver.mock.calls.map(call => call[1].content)).toEqual(['new'])
    })
    test('different tabs remain independent and closing discards buffered text', async () => {
        const deliver = jest.fn().mockResolvedValue(undefined)
        const owner = new RequestCoordinator(deliver)
        const a = owner.begin(1), b = owner.begin(2), ending = deferred<string>()
        const run = a.runText(chunk => { chunk('unwanted'); return ending.promise })
        owner.stop(1, true)
        await b.send({ type: 'addText', content: 'other tab' })
        ending.resolve('unwanted'); await run
        expect(deliver).toHaveBeenCalledTimes(1)
        expect(deliver.mock.calls[0][0]).toBe(2)
    })
    test('stop preserves the partial answer and old stop IDs cannot stop a new request', async () => {
        const deliver = jest.fn().mockResolvedValue(undefined)
        const owner = new RequestCoordinator(deliver), a = owner.begin(1), ending = deferred<string>()
        const run = a.runText(chunk => { chunk('partial'); return ending.promise })
        owner.stop(1, false, a.id)
        ending.reject(new Error('aborted')); await run
        expect(deliver.mock.calls.map(call => call[1].type)).toEqual(['streamStart', 'addTextChunk', 'endText'])
        const b = owner.begin(1)
        owner.stop(1, true, a.id)
        expect(b.stopped).toBe(false)
    })
    test('stop while settings are loading aborts the provider attached later', () => {
        const owner = new RequestCoordinator(jest.fn()), session = owner.begin(1), abort = jest.fn()
        owner.stop(1, true); session.attach({ abort } as any)
        expect(abort).toHaveBeenCalledTimes(1)
    })
})
