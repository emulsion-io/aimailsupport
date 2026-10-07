/** @jest-environment jsdom */
/// <reference types="node" />
import DOMPurify from 'dompurify'
import { renderGeneratedText } from '../src/ts/helpers/renderGeneratedText'
// Exercise the actual Marked browser build in Jest's CommonJS environment.
jest.mock('marked', () => {
    const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path')
    const module = { exports: {} }
    vm.runInNewContext(fs.readFileSync(path.join(path.dirname(require.resolve('marked')), 'marked.umd.js'), 'utf8'), { module, exports: module.exports })
    return module.exports
})
beforeEach(() => { Object.defineProperty(globalThis, 'DOMPurify', { configurable: true, value: DOMPurify }) })
test('generated markdown retains formatting while stripping active HTML and remote images', () => {
    const target = document.createElement('div')
    renderGeneratedText(target, '**Hello**\n\n- one\n- two\n\n<script>alert(1)</script><img src="https://example.test/tracker" onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(1)">bad</a>')
    expect(target.querySelector('strong')?.textContent).toBe('Hello')
    expect(target.querySelectorAll('li')).toHaveLength(2)
    expect(target.querySelector('script, img, [onclick], [onerror]')).toBeNull()
    expect(target.querySelector('a')?.hasAttribute('href')).toBe(false)
})
