import { RestClient } from '../src/RestClient'

describe('RestClient', () => {
  const token = 'fake token'
  let restClient: RestClient
  beforeEach(() => {
    restClient = new RestClient('http://localhost:8081', token)
  })
  test('prepareBaseOptions should return options', async () => {
    const baseOptions = restClient.prepareBaseOptions()
    expect(baseOptions.headers.Authorization).toEqual('Bearer ' + token)
    expect(baseOptions.jar).toBeDefined()
    expect(baseOptions.withCredentials).toBeTruthy()
  })
  test('prepareGetOptions should have get method', async () => {
    const url = 'url'
    const baseOptions = restClient.prepareGetOptions(url)
    expect(baseOptions.headers.Authorization).toEqual('Bearer ' + token)
    expect(baseOptions.jar).toBeDefined()
    expect(baseOptions.withCredentials).toBeTruthy()
    expect(baseOptions.url).toBe(url)
    expect(baseOptions.method).toEqual('GET')
  })
  test('prepareDeleteOptions should have delete method', async () => {
    const url = 'url'
    const baseOptions = restClient.prepareDeleteOptions(url)
    expect(baseOptions.headers.Authorization).toEqual('Bearer ' + token)
    expect(baseOptions.jar).toBeDefined()
    expect(baseOptions.withCredentials).toBeTruthy()
    expect(baseOptions.url).toBe(url)
    expect(baseOptions.method).toEqual('DELETE')
  })
  test('token should starts with Bearer', async () => {
    expect(restClient.masterCredential.token).toEqual('Bearer ' + token)
  })
  test('storeUserToken should store token', () => {
    expect(restClient.credentials.has('username')).toBeFalsy()
    restClient.storeUserToken('username', 'token')
    expect(restClient.credentials.has('username')).toBeTruthy()
  })
  test('makeSubscriptionUrl should return correct url', () => {
    const subAccountAppId = 'app'
    const subscriptionId = '1'
    const url = restClient.makeSubscriptionUrl(subAccountAppId, subscriptionId)
    expect(url).toContain(
      '/spokenAbc/subscriptions/v1.0/subscriptions/1?subAccountAppId=app'
    )
  })
  test('makeSubAccountSubscriptionUrl should return correct url for post', () => {
    const url = restClient.makeSubAccountSubscriptionUrl(undefined)
    expect(url).toContain('/spokenAbc/subscriptions/v1.0/subscriptions')
  })
  test('makeSubAccountSubscriptionUrl should return correct url for getAll', () => {
    const subAccountAppId = 'app'
    const url = restClient.makeSubAccountSubscriptionUrl(subAccountAppId)
    expect(url).toContain(
      '/spokenAbc/subscriptions/v1.0/subscriptions?subAccountAppId=app'
    )
  })
})
