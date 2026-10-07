/** @jest-environment jsdom */
/// <reference types="node" />
import { getConfig } from '../src/ts/helpers/utils'
import { LmsProvider } from '../src/ts/llmProviders/impl/lmsProvider'
jest.mock('../src/ts/helpers/utils', () => ({ getConfig: jest.fn() }))
jest.mock('../src/ts/llmProviders/impl/lmsProvider', () => ({ LmsProvider: { getModels: jest.fn() } }))
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)) }
beforeEach(() => {
    document.body.innerHTML = '<select id="llmProvider"><option value="lms" selected>LM Studio</option></select><fieldset id="lms"><input id="lmsServiceUrl" value="http://localhost:1234"><input id="lmsAuthToken" value="saved-token"><select id="lmsModel"></select><button type="button" id="lmsListModel"></button><div class="description lms-error-api"></div><div class="description lms-warning-no-model"></div></fieldset>'
    ;(getConfig as jest.Mock).mockImplementation(async key => key === 'llmProvider' ? 'lms' : { model: 'saved-model' })
    ;(LmsProvider.getModels as jest.Mock).mockReset()
    jest.isolateModules(() => { require('../src/ts/options/optionsModelList') })
})
test('initial loading waits for restored fields and keeps saved model if the server is unreachable', async () => {
    ;(LmsProvider.getModels as jest.Mock).mockRejectedValue(new Error('<img src=x onerror=alert(1)>'))
    await flush(); expect(LmsProvider.getModels).not.toHaveBeenCalled()
    document.dispatchEvent(new Event('optionsRestored')); await flush()
    expect(LmsProvider.getModels).toHaveBeenCalledWith('http://localhost:1234', 'saved-token')
    expect((document.querySelector('#lmsModel') as HTMLSelectElement).value).toBe('saved-model')
    expect(document.querySelector('#lms .lms-error-api img')).toBeNull()
})
test('manual refresh uses a cleared token instead of restoring the saved one', async () => {
    ;(LmsProvider.getModels as jest.Mock).mockResolvedValue(['saved-model', 'other'])
    ;(document.querySelector('#lmsAuthToken') as HTMLInputElement).value = ''
    ;(document.querySelector('#lmsListModel') as HTMLElement).click(); await flush()
    expect(LmsProvider.getModels).toHaveBeenCalledWith('http://localhost:1234', '')
    expect((document.querySelector('#lmsModel') as HTMLSelectElement).value).toBe('saved-model')
})
