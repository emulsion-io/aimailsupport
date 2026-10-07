import { getCurrentMessageContent } from '../src/ts/helpers/utils'
import { mask } from '@yellowsakura/js-pii-mask'
jest.mock('@yellowsakura/js-pii-mask', () => ({ mask: jest.fn((text: string) => 'masked') }))
beforeEach(() => {
    const api = { messageDisplay: { getDisplayedMessage: jest.fn().mockResolvedValue(null) },
        compose: { getComposeDetails: jest.fn().mockResolvedValue({ plainTextBody: '', subject: '' }) },
        storage: { sync: { get: jest.fn().mockResolvedValue({ maskPii: true }) } } }
    Object.defineProperty(globalThis, 'browser', { configurable: true, value: api })
    Object.defineProperty(globalThis, 'messenger', { configurable: true, value: api })
    ;(mask as jest.Mock).mockClear()
})
test('empty drafts still produce no processable content', async () => {
    expect(await getCurrentMessageContent(42)).toBeNull()
})
test('the explicit tab is used and PII masking also covers the subject', async () => {
    ;(messenger.compose.getComposeDetails as jest.Mock).mockResolvedValue({ plainTextBody: 'body secret', subject: 'subject secret' })
    expect(await getCurrentMessageContent(42)).toBe('Subject: masked\nBody: masked')
    expect(messenger.compose.getComposeDetails).toHaveBeenCalledWith(42)
    expect(mask).toHaveBeenCalledWith('body secret'); expect(mask).toHaveBeenCalledWith('subject secret')
})
