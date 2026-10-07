import { ChartUtils } from './helpers/chartUtils'
import { logMessage } from './helpers/utils'
import removeMarkdown from 'remove-markdown'
import { renderGeneratedText } from './helpers/renderGeneratedText'

let lastAiResponseText = ''
let streamedResponseText = ''
let activeRequestId = 0
let dismissedRequestId = 0
let messageQueue = Promise.resolve()

// Manage async messages -->
browser.runtime.onMessage.addListener((message: any) => {
    const accepted = ['addAudio', 'addChart', 'addText', 'addTagsSummary', 'insertTextAtCursor',
        'insertTextBelowSelection', 'setComposeMode', 'showError', 'hideOutput', 'thinking',
        'streamStart', 'addTextChunk', 'endText']
    if (!accepted.includes(message?.type)) return false
    messageQueue = messageQueue.then(() => handleMessage(message)).catch(error => logMessage(error.message, 'error'))
    return false
})

async function handleMessage(message: any): Promise<void> {
    if (message.requestId && (message.requestId < activeRequestId || message.requestId <= dismissedRequestId)) return
    if (message.requestId) activeRequestId = message.requestId
    if (message?.type) {
        await createOutputDisplay()
        if (message.requestId && message.requestId <= dismissedRequestId) {
            clearOutputDisplay(true)
            return
        }

        switch (message.type) {
            case 'addAudio':
                addAudio(message.content)
                break

            case 'addChart':
                addChart(message.content)
                break

            case 'addText':
                addText(message.content)
                break

            case 'streamStart':
                clearOutputDisplay()
                streamedResponseText = ''
                getInnerResponse().classList.add('streaming')
                break
            case 'addTextChunk':
                streamedResponseText += message.content
                renderGeneratedText(getInnerResponse().querySelector('#amsContent'), streamedResponseText)
                break
            case 'endText':
                lastAiResponseText = streamedResponseText
                getInnerResponse().classList.remove('thinking', 'streaming')
                getInnerResponse().classList.add('text-content')
                break
            case 'addTagsSummary':
                addTagsSummary(message.content)
                break

            case 'insertTextAtCursor':
                insertTextAtCursor(message.content)
                break

            case 'insertTextBelowSelection':
                insertTextBelowSelection(message.content)
                break

            case 'setComposeMode':
                const actionsContainer = getInnerResponse().querySelector('#actionsContainer')
                if (message.isCompose) {
                    actionsContainer.classList.add('compose-mode')
                } else {
                    actionsContainer.classList.remove('compose-mode')
                }
                break

            case 'showError':
                showError(message.content)
                break

            case 'hideOutput':
                clearOutputDisplay(true)
                break

            case 'thinking':
                thinking(message.content)
                break
        }
    }
}
// <-- manage async messages

function addAudio(blob: Blob) {
    const requestId = activeRequestId
    clearOutputDisplay()

    const reader = new FileReader()
    reader.onload = () => {
        if (requestId !== activeRequestId || requestId <= dismissedRequestId || !getInnerResponse()) return
        const base64Data = reader.result as string

        const audioElement = document.createElement('audio')
        audioElement.src = base64Data
        audioElement.autoplay = true
        audioElement.controls = true

        getInnerResponse().querySelector('#amsContent').appendChild(audioElement)
    }

    reader.readAsDataURL(blob)
}

function addChart(chart: { [key: string]: number }) {
    clearOutputDisplay()

    const chartUtils = new ChartUtils()
    getInnerResponse().querySelector('#amsContent').append(chartUtils.createBarChart(chart, 50))
}

// Support function to get the inner response node inside the shadow
// DOM.
function getInnerResponse() {
    return document.querySelector('#amsOuterResponse')?.shadowRoot?.querySelector('#amsInnerResponse')
}

function addText(newContent: string) {
    clearOutputDisplay()

    getInnerResponse().classList.add('text-content')

    // Any Markdown present is converted to plain text
    lastAiResponseText = newContent || ''
    renderGeneratedText(getInnerResponse().querySelector('#amsContent'), lastAiResponseText)
}

function normalizeDisplayedText(content: string): string {
    return (content || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\n{2,}/g, '\n')
        .trim()
}

function addTagsSummary(content: { intro?: string; tags?: { label?: string; color?: string }[] }) {
    clearOutputDisplay()

    const innerResponse = getInnerResponse()
    innerResponse.classList.add('text-content')

    const target = innerResponse.querySelector('#amsContent') as HTMLDivElement
    target.innerHTML = ''

    const wrapper = document.createElement('div')
    wrapper.className = 'auto-tags-summary'

    const intro = document.createElement('p')
    intro.className = 'auto-tags-intro'
    intro.textContent = content?.intro || browser.i18n.getMessage('autoTagsSuccessIntro')
    wrapper.appendChild(intro)

    const tagsContainer = document.createElement('div')
    tagsContainer.className = 'auto-tags-badges'

    const tags = Array.isArray(content?.tags) ? content.tags : []

    tags.forEach((tag) => {
        const badge = document.createElement('span')
        badge.className = 'auto-tag-badge'
        badge.style.display = 'inline-flex'
        badge.style.alignItems = 'center'
        badge.style.marginRight = '8px'
        badge.style.marginBottom = '6px'
        badge.style.padding = '4px 10px'
        badge.style.borderRadius = '999px'
        badge.style.border = '1px solid var(--border-color)'

        const dot = document.createElement('span')
        dot.className = 'auto-tag-dot'
        dot.style.backgroundColor = tag?.color || '#6b7280'
        dot.style.display = 'inline-block'
        dot.style.width = '10px'
        dot.style.height = '10px'
        dot.style.borderRadius = '50%'
        dot.style.marginRight = '8px'

        const label = document.createElement('span')
        label.className = 'auto-tag-label'
        label.textContent = tag?.label || browser.i18n.getMessage('autoTagsDefaultLabel')

        badge.appendChild(dot)
        badge.appendChild(label)
        tagsContainer.appendChild(badge)
    })

    wrapper.appendChild(tagsContainer)
    target.appendChild(wrapper)
}

function showError(newContent: string) {
    clearOutputDisplay()

    getInnerResponse().classList.add('error')
    getInnerResponse().querySelector('#amsContent').textContent = newContent
}

function thinking(thinkingText: string) {
    streamedResponseText = ''
    lastAiResponseText = ''
    clearOutputDisplay()

    getInnerResponse().classList.add('thinking')

    const content = getInnerResponse().querySelector('#amsContent')
    content.appendChild(createThinkingLoaderElement())

    const thinkingLabel = document.createElement('span')
    thinkingLabel.className = 'thinking-label'
    thinkingLabel.textContent = thinkingText

    const dots = document.createElement('span')
    dots.className = 'dots'
    thinkingLabel.appendChild(dots)

    content.appendChild(thinkingLabel)
}

function createThinkingLoaderElement(): HTMLDivElement {
    const loader = document.createElement('div')
    loader.id = 'amsThinkingLoader'
    loader.className = 'loader'
    loader.innerHTML = `
        <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
                <mask id="amsLoaderClipping">
                    <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                    <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                    <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                </mask>
            </defs>
        </svg>
        <div class="box"></div>
    `

    return loader
}

// Support function to create the container where various details
// populated by AI systems will be inserted.
async function createOutputDisplay(): Promise<void> {

    // Get theme from storage
    const result = await browser.storage.sync.get('theme')
    const theme = result.theme || 'default'

    // If the container already exists, just synchronize the theme
    const existingInnerResponse = getInnerResponse()
    if(existingInnerResponse) {
        const existingContent = existingInnerResponse.querySelector('#amsContent')

        if (theme === 'dark') {
            existingInnerResponse.classList.add('dark')
            existingContent?.classList.add('dark')
        } else {
            existingInnerResponse.classList.remove('dark')
            existingContent?.classList.remove('dark')
        }
        return
    }

    // Avoid creating the element if it already exists
    if(document.querySelector('#amsOuterResponse')) {
        return
    }

    // Main container for the AI model response
    const amsOuterResponse: HTMLDivElement = document.createElement('div')
    amsOuterResponse.id = 'amsOuterResponse'

    // Uses a shadow DOM to handle all responses, isolating it from styles
    // and any form of interaction present in the email client.
    const shadowRoot = amsOuterResponse.attachShadow({ mode: 'open' })

    // Inner container for the AI model response
    const amsInnerResponse: HTMLDivElement = document.createElement('div')
    amsInnerResponse.id = 'amsInnerResponse'
    if (theme === 'dark') {
        amsInnerResponse.classList.add('dark')
    }
    shadowRoot.appendChild(amsInnerResponse)

    // Add the CSS file to the shadow root
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = browser.runtime.getURL('/outputDisplay/outputDisplay.css')
    amsInnerResponse.appendChild(cssLink)

    // Contents -->
    const content: HTMLDivElement = document.createElement('div')
    content.id = 'amsContent'
    if (theme === 'dark') {
        content.classList.add('dark')
    }
    amsInnerResponse.appendChild(content)

    // Close icon
    const closeIcon: HTMLSpanElement = document.createElement('span')
    closeIcon.className = 'close-icon'
    closeIcon.innerHTML = '&times;'
    closeIcon.addEventListener('click', () => {
        dismissedRequestId = activeRequestId
        stopGeneration(true)
        clearOutputDisplay(true)
    })
    amsInnerResponse.appendChild(closeIcon)

    // Actions container -->
    const actionsContainer: HTMLDivElement = document.createElement('div')
    actionsContainer.id = 'actionsContainer'

    // Copy in clipboard icon
    const copyClipboardIcon: HTMLSpanElement = document.createElement('span')
    copyClipboardIcon.className = 'copy-clipboard-icon'
    copyClipboardIcon.title = messenger.i18n.getMessage('outputDisplay.title.copyClipboard')
    copyClipboardIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m0 4h8m-8 4h6m-6 4h6"/>
            <path d="M12 2v4"/>
            <path d="M8 6h8"/>
        </svg>
    `
    copyClipboardIcon.addEventListener('click', copyClipboard)
    actionsContainer.appendChild(copyClipboardIcon)

    // Copy top icon
    const copyTopIcon: HTMLSpanElement = document.createElement('span')
    copyTopIcon.className = 'copy-top-icon'
    copyTopIcon.title = messenger.i18n.getMessage('outputDisplay.title.copyTop')
    copyTopIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V6"/>
            <path d="M5 12l7-7 7 7"/>
            <path d="M19 21H5"/>
        </svg>
    `
    copyTopIcon.addEventListener('click', copyToEmailTop)
    actionsContainer.appendChild(copyTopIcon)

    // Reload icon
    /*const reloadIcon: HTMLSpanElement = document.createElement('span')
    reloadIcon.className = 'reload-icon'
    reloadIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
        </svg>
    `
    actionsContainer.appendChild(reloadIcon)*/

    // Refine icon
    const refineIcon: HTMLSpanElement = document.createElement('span')
    refineIcon.className = 'refine-icon'
    refineIcon.title = messenger.i18n.getMessage('outputDisplay.title.refine')
    refineIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    `
    refineIcon.addEventListener('click', () => toggleRefineInput(amsInnerResponse))
    actionsContainer.appendChild(refineIcon)
    // <-- refine icon

    // Stop icon, only visible while an answer is being generated
    const stopIcon: HTMLSpanElement = document.createElement('span')
    stopIcon.className = 'stop-icon'
    stopIcon.title = messenger.i18n.getMessage('outputDisplay.title.stop')
    stopIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
    `
    stopIcon.addEventListener('click', () => stopGeneration())
    actionsContainer.appendChild(stopIcon)

    // Footer: groups action icons and refine input -->
    const amsFooter: HTMLDivElement = document.createElement('div')
    amsFooter.id = 'amsFooter'

    amsFooter.appendChild(actionsContainer)

    // Refine input area (hidden by default) -->
    const refineContainer: HTMLDivElement = document.createElement('div')
    refineContainer.id = 'refineContainer'

    const refineTextarea: HTMLTextAreaElement = document.createElement('textarea')
    refineTextarea.id = 'refineTextarea'
    refineTextarea.rows = 1
    refineTextarea.placeholder = messenger.i18n.getMessage('outputDisplay.refine.placeholder')
    refineTextarea.addEventListener('input', () => {
        refineTextarea.style.height = 'auto'
        refineTextarea.style.height = `${refineTextarea.scrollHeight}px`
        refineSendBtn.classList.toggle('active', refineTextarea.value.trim() !== '')
    })
    refineTextarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submitRefinement(refineTextarea, refineContainer)
        }
    })
    refineContainer.appendChild(refineTextarea)

    const refineSendBtn: HTMLButtonElement = document.createElement('button')
    refineSendBtn.className = 'refine-send'
    refineSendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`
    refineSendBtn.addEventListener('click', () => submitRefinement(refineTextarea, refineContainer))
    refineContainer.appendChild(refineSendBtn)
    // <-- refine input area

    amsFooter.appendChild(refineContainer)
    amsInnerResponse.appendChild(amsFooter)
    // <-- footer
    // <-- actions container

    document.body.appendChild(amsOuterResponse)
}

/**
 * Clears the container used for displaying AI model responses between user
 * requests.
 *
 * @param destroy - A boolean flag indicating whether to destroy the container.
 *        The default value is false.
 */
function clearOutputDisplay(destroy: boolean = false): void {
    if(destroy) {
        document.querySelector('#amsOuterResponse')?.remove()
        return
    }

    // Ensure the component is visible
    if(!document.querySelector('#amsOuterResponse').classList.contains('show')) {
        document.querySelector('#amsOuterResponse').classList.add('show')
    }

    getInnerResponse().classList.remove('error', 'text-content', 'thinking', 'streaming')
    getInnerResponse().querySelector('#amsContent').innerHTML = ''
}

/**
 * Copies the textual content to the system clipboard.
 */
function copyClipboard(): void {
    const contentElement = getInnerResponse().querySelector('#amsContent')

    // Create a temporary selection range
    const selection = globalThis.getSelection()
    const range = document.createRange()
    range.selectNodeContents(contentElement)

    // Replace any existing selection
    selection.removeAllRanges()
    selection.addRange(range)

    try {
        document.execCommand('copy')
    } catch {
        logMessage('Copy to clipboard failed or was blocked', 'error')
    } finally {
        selection.removeAllRanges()
    }
}

/**
 * Copies the LLM response content to the top of the email.
 * This function is only available when in compose mode.
 */
function copyToEmailTop(): void {
    const content = getInnerResponse().querySelector('#amsContent')
    if (!content?.textContent?.trim()) return
    browser.runtime.sendMessage({ type: 'insertAtComposeTop', htmlContent: content.innerHTML,
        textContent: (content as HTMLElement).innerText || content.textContent }).catch(error => logMessage(error.message, 'error'))
}

function insertTextAtCursor(contentToInsert: string): void {
    const cleanedContent = normalizeDisplayedText(contentToInsert)

    if (!cleanedContent) {
        return
    }

    try {
        const emailBody: HTMLElement | null = document.querySelector('body')

        if (!emailBody) {
            return
        }

        const aiContent = createInsertedContentNode(cleanedContent)

        const selection = globalThis.getSelection()
        const canInsertAtCursor = selection
            && selection.rangeCount > 0
            && emailBody.contains(selection.getRangeAt(0).commonAncestorContainer)

        if (canInsertAtCursor) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(aiContent)

            range.setStartAfter(aiContent)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        }
        else {
            emailBody.appendChild(aiContent)
        }
    } catch (error) {
        if (error instanceof Error) {
            logMessage(`Error inserting text at cursor: ${error.message}`, 'error')
        } else {
            logMessage('Unknown error inserting text at cursor', 'error')
        }
    }
}

function insertTextBelowSelection(contentToInsert: string): void {
    const cleanedContent = normalizeDisplayedText(contentToInsert)

    if (!cleanedContent) {
        return
    }

    try {
        const emailBody: HTMLElement | null = document.querySelector('body')

        if (!emailBody) {
            return
        }

        const aiContent = createInsertedContentNode(cleanedContent)
        const selection = globalThis.getSelection()
        const canInsertBelowSelection = selection
            && selection.rangeCount > 0
            && emailBody.contains(selection.getRangeAt(0).commonAncestorContainer)

        if (canInsertBelowSelection) {
            const range = selection.getRangeAt(0).cloneRange()
            range.collapse(false)

            const wrapper = document.createElement('div')
            wrapper.appendChild(document.createElement('br'))
            wrapper.appendChild(aiContent)

            range.insertNode(wrapper)

            range.setStartAfter(wrapper)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        }
        else {
            insertTextAtCursor(cleanedContent)
        }
    } catch (error) {
        if (error instanceof Error) {
            logMessage(`Error inserting text below selection: ${error.message}`, 'error')
        } else {
            logMessage('Unknown error inserting text below selection', 'error')
        }
    }
}

function createInsertedContentNode(cleanedContent: string): HTMLDivElement {
    const lines = cleanedContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

    const bullets = lines
        .map(line => line.replace(/^[-*•]\s+/, '').trim())
        .filter(line => line.length > 0)

    const aiContent = document.createElement('div')

    if (bullets.length > 0) {
        const list = document.createElement('ul')

        bullets.forEach((bullet) => {
            const item = document.createElement('li')
            item.textContent = bullet
            list.appendChild(item)
        })

        aiContent.appendChild(list)
    }
    else {
        aiContent.textContent = cleanedContent
    }

    return aiContent
}

function toggleRefineInput(amsInnerResponse: Element): void {
    const container = amsInnerResponse.querySelector('#refineContainer') as HTMLDivElement
    const isVisible = container.classList.toggle('show')
    if (isVisible) {
        (amsInnerResponse.querySelector('#refineTextarea') as HTMLTextAreaElement).focus()
    }
}

/**
 * Sends a refinement request to the background script, pairing the prompt typed
 * by the user with the last AI response, which is the text to be reworked.
 *
 * Nothing is sent when the prompt is empty or when no response has been
 * received yet. The input area is emptied and closed right away, while the new
 * response arrives asynchronously and replaces the current one.
 *
 * @param textarea - The textarea holding the refinement prompt.
 * @param container - The input area to be reset and hidden after sending.
 */
function submitRefinement(textarea: HTMLTextAreaElement, container: HTMLDivElement): void {
    const prompt = textarea.value.trim()
    if (!prompt || !lastAiResponseText) return

    browser.runtime.sendMessage({
        type: 'refineLastResponse',
        refinementPrompt: prompt,
        lastResponse: lastAiResponseText
    }).catch((error: Error) => {
        logMessage(`Error sending refinement: ${error.message}`, 'error')
    })

    textarea.value = ''
    textarea.style.height = 'auto'
    container.classList.remove('show')
}
function stopGeneration(discardOutput = false): void {
    browser.runtime.sendMessage({ type: 'stopGeneration', discardOutput, requestId: activeRequestId })
        .catch(error => logMessage(error.message, 'error'))
}
