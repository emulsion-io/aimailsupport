/**
 * Custom element for managing multiple language selection with dual-list
 * interface.
 */
class MultipleLanguageSelector extends HTMLElement {
    private readonly sourceSelect: HTMLSelectElement
    private readonly targetSelect: HTMLSelectElement

    constructor() {
        super()

        this.style.display = 'block'
        this.style.flex = '1 1 auto'
        this.style.minWidth = '0'

        const container = document.createElement('div')
        container.style.display = 'flex'
        container.style.alignItems = 'center'
        container.style.gap = '8px'
        container.style.width = '100%'

        this.sourceSelect = this.createListSelect()

        const buttonContainer = document.createElement('div')
        buttonContainer.style.display = 'flex'
        buttonContainer.style.flexDirection = 'column'
        buttonContainer.style.flex = '0 0 auto'
        buttonContainer.style.gap = '6px'

        const moveRightButton = this.createMoveButton('→', true)
        const moveLeftButton = this.createMoveButton('←', false)

        buttonContainer.append(moveRightButton, moveLeftButton)

        this.targetSelect = this.createListSelect()

        container.append(this.sourceSelect, buttonContainer, this.targetSelect)
        this.append(container)
    }

    connectedCallback() {
        this.syncSourceFromMainSelector()

        if (this.sourceSelect.options.length === 0) {
            requestAnimationFrame(() => this.syncSourceFromMainSelector())
        }
    }

    private createListSelect(): HTMLSelectElement {
        const select = document.createElement('select')
        select.multiple = true
        select.style.flex = '1 1 0'
        select.style.minWidth = '220px'
        select.style.width = '100%'
        select.style.height = '120px'

        select.addEventListener('change', () => this.dispatchEvent(new Event('change')))

        return select
    }

    private createMoveButton(symbol: string, toTarget: boolean): HTMLButtonElement {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = symbol
        button.style.minHeight = '28px'
        button.style.padding = '0 8px'

        button.addEventListener('click', (event) => {
            event.preventDefault()
            this.moveSelected(toTarget)
        })

        return button
    }

    private syncSourceFromMainSelector() {
        if (this.sourceSelect.options.length > 0) {
            return
        }

        const mainLanguageSelector = document.querySelector<HTMLSelectElement>('#mainUserLanguageCode')
        if (!mainLanguageSelector || mainLanguageSelector.options.length === 0) {
            return
        }

        const options = Array.from(mainLanguageSelector.options)
            .map((option) => option.cloneNode(true) as HTMLOptionElement)

        this.sourceSelect.replaceChildren(...options)
    }

    private moveSelected(toTarget: boolean) {
        const source = toTarget ? this.sourceSelect : this.targetSelect
        const target = toTarget ? this.targetSelect : this.sourceSelect

        Array.from(source.selectedOptions).forEach(option => target.appendChild(option))

        const sortedOptions = Array.from(target.options)
            .sort((a, b) => (a.textContent || '').localeCompare(b.textContent || ''))

        target.replaceChildren(...sortedOptions)
        this.dispatchEvent(new Event('change'))
    }

    get value(): string { return this.targetSelect.value }
    set value(v: string) { this.targetSelect.value = v }

    get selectedIndex(): number { return this.targetSelect.selectedIndex }
    set selectedIndex(v: number) { this.targetSelect.selectedIndex = v }

    get options(): HTMLOptionsCollection { return this.targetSelect.options }
    get selectedOptions(): HTMLCollectionOf<HTMLOptionElement> { return this.targetSelect.selectedOptions }

    getValues(): string[] {
        return Array.from(this.targetSelect.options).map((option) => option.value)
    }

    setValues(values: string[]) {
        this.syncSourceFromMainSelector()

        const allOptions = [
            ...Array.from(this.sourceSelect.options),
            ...Array.from(this.targetSelect.options)
        ]

        const sourceOptions = allOptions
            .filter((option) => !values.includes(option.value))
            .sort((a, b) => (a.textContent || '').localeCompare(b.textContent || ''))

        const targetOptions = allOptions
            .filter((option) => values.includes(option.value))
            .sort((a, b) => (a.textContent || '').localeCompare(b.textContent || ''))

        this.sourceSelect.replaceChildren(...sourceOptions)
        this.targetSelect.replaceChildren(...targetOptions)

        this.dispatchEvent(new Event('change'))
    }
}

customElements.define('multiple-language-selector', MultipleLanguageSelector)
