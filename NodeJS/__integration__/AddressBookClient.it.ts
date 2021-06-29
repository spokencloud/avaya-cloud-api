import { AddressBookClient, createAddressBookClient } from '../src'
import { log4js } from '../src/Constants'

const rootLogger = log4js.getLogger()
rootLogger.level = 'debug'
rootLogger.debug('Starting AddressBookClient Integration Test')

describe('AddressBookClient.ts', () => {
  const localEnv = {
    user: 'sdetSubAccAdmin',
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZGV0U3ViQWNjQWRtaW4iLCJpc3MiOiJBQkNfU0VDVVJJVFlfR0FURVdBWSJ9.0HacDx5e1mS9uFmZzrQ8MG8qYp_w27VbsY_z07Tw45w',
    url: 'https://integration.bpo.avaya.com',
    subAccountAppId: 'SDE_SDBRec'
  }

  const { subAccountAppId, token, url } = localEnv

  let addressBookClient: AddressBookClient
  beforeEach(async () => {
    addressBookClient = createAddressBookClient(url, token)
  })

  test('getAddressBook should return AddressBookPayload with contacts', async () => {
    const addressBookPayload = await addressBookClient.getAddressBook()
    console.debug('GET addressBook ', addressBookPayload)
    expect(addressBookPayload).toBeDefined()
    expect(addressBookPayload.addressBookId).toBeDefined()
    expect(addressBookPayload.subAccountAppId).toEqual(subAccountAppId)
    expect(addressBookPayload.contacts.length).toBeGreaterThan(0)
  }, 3000)

  test('searchContacts does not require parameters', async () => {
    const addressBookSearchResponse = await addressBookClient.searchContacts()
    console.debug('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
  }, 3000)

  test('searchContacts of ACO type should return only ACO contacts', async () => {
    const searchRequest = { type: 'ACO' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.debug('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    addressBookSearchResponse.content.forEach(contact =>
      expect(contact.type).toEqual('ACO')
    )
  }, 3000)

  test('searchContacts by partial name should return corresponding contacts', async () => {
    const searchRequest = { query: 'sdetAg' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.debug('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    addressBookSearchResponse.content.forEach(contact =>
      expect(contact.name).toContain('sdetAg')
    )
  }, 3000)

  test('searchContacts sorted by name in DESC order should return all contacts in expected order', async () => {
    const searchRequest = { orderBy: 'name', orderDirection: 'DESC' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.debug('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    // Collect all contact names and sort in expected (Descending) order
    const names = addressBookSearchResponse.content
      .map(contact => contact.name)
      .sort()
      .reverse()
    // Validate response contacts are sorted in expected order
    let i = 0
    addressBookSearchResponse.content.forEach(contact => {
      expect(contact.name).toEqual(names[i++])
    })
  }, 3000)

  test('searchContacts with page number/size query should return requested page number and size', async () => {
    const searchRequest = { page: 2, pageSize: 2 }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.debug('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(2)
    expect(addressBookSearchResponse.size).toEqual(2)
  }, 3000)
})
