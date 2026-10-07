import { marked } from 'marked'
declare const DOMPurify: typeof import('dompurify')

/** Generated Markdown is untrusted; never load images or insert active HTML. */
export function renderGeneratedText(target: Element, markdown: string): void {
    target.replaceChildren(DOMPurify.sanitize(marked.parse(markdown || '', { async: false }), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'blockquote',
            'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'hr'],
        ALLOWED_ATTR: ['href', 'title'], ALLOW_DATA_ATTR: false, RETURN_DOM_FRAGMENT: true
    }))
}
