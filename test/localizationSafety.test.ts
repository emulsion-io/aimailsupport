/** @jest-environment jsdom */
import { localizeNodes } from '../src/ts/helpers/utils'
import DOMPurify from 'dompurify'

jest.mock('@yellowsakura/js-pii-mask', () => ({ mask: jest.fn() }))

describe('localized HTML safety', () => {
    const getMessage = jest.fn()

    beforeEach(() => {
        Object.defineProperty(globalThis, 'DOMPurify', { configurable: true, value: DOMPurify })
        Object.defineProperty(globalThis, 'messenger', {
            configurable: true,
            value: { i18n: { getMessage } }
        })
        document.body.replaceChildren()
        const label = document.createElement('label')
        label.setAttribute('data-l10n-ref', 'test')
        document.body.append(label)
    })

    test('preserves links, formatting, numeric placeholders and escaped tokens', () => {
        getMessage.mockReturnValue('Temperature (<span class="monospace"></span>x)<p><b>Warning</b><br><strong>Info</strong> <a href="https://lmstudio.ai">Link</a> <code>&lt;token&gt;</code></p>')
        localizeNodes()
        expect(document.querySelector('label span.monospace')).not.toBeNull()
        expect(document.querySelector('a').href).toBe('https://lmstudio.ai/')
        expect(document.querySelector('code').textContent).toBe('<token>')
        expect(document.querySelector('b').textContent).toBe('Warning')
        expect(document.querySelector('br')).not.toBeNull()
    })

    test('removes executable markup, event handlers and unsafe links', () => {
        getMessage.mockReturnValue('<script>alert(1)</script><img src=x onerror="alert(1)"><svg onload="alert(1)"></svg><a href="javascript:alert(1)" onclick="alert(1)">Bad</a><span class="monospace" style="color:red" id="optionsForm">Text</span>')
        localizeNodes()
        expect(document.querySelector('script, img, svg, [onclick], [onerror], [onload], [style], [id]')).toBeNull()
        expect(document.querySelector('a').hasAttribute('href')).toBe(false)
        expect(document.querySelector('span').textContent).toBe('Text')
    })
})
