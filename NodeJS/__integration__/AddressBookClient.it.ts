import {
  AddressBookClient,
  createAddressBookClient
} from '../src/AddressBookClient'
import { log4js } from '../src/Constants'

const rootLogger = log4js.getLogger()
rootLogger.level = 'debug'
rootLogger.debug('Starting AddressBookClient Integration Test')

describe('SubscriptionClient.ts', () => {
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
    addressBookClient = await createAddressBookClient(url, token)
  })

  test('getAddressBook should return AddressBookPayload with active contacts', async () => {
    const addressBookPayload = await addressBookClient.getAddressBook()
    console.log('GET addressBook ', addressBookPayload)
    expect(addressBookPayload).toBeDefined()
    expect(addressBookPayload.addressBookId).toBeDefined()
    expect(addressBookPayload.subAccountAppId).toEqual(subAccountAppId)
    expect(addressBookPayload.contacts.length).toBeGreaterThan(0)
  }, 3000)

  test('searchContacts w/o query params should return all active contacts', async () => {
    const addressBookSearchResponse = await addressBookClient.searchContacts()
    console.log('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
  }, 3000)

  test('searchContacts of ACO type should return active ACO contacts', async () => {
    const searchRequest = { type: 'ACO' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.log('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    for (const contact of addressBookSearchResponse.content) {
      expect(contact.type).toEqual('ACO')
    }
  }, 3000)

  test('searchContacts using query should return corresponding contacts', async () => {
    const searchRequest = { query: 'agent' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.log('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    for (const contact of addressBookSearchResponse.content) {
      expect(contact.name).toContain('agent')
      console.log(contact.name)
    }
  }, 3000)

  test('searchContacts sorted by should return all active contacts in expected order', async () => {
    const searchRequest = { orderBy: 'name', orderDirection: 'DESC' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.log('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(0)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(0)
    // Collect all contact names and sort in expected order
    const names: string[] = []
    let i = 0
    for (const contact of addressBookSearchResponse.content) {
      names[i++] = contact.name
    }
    names.sort()
    names.reverse()
    let j = 0
    for (const contact of addressBookSearchResponse.content) {
      expect(contact.name).toEqual(names[j++])
    }
  }, 3000)

  test('searchContacts with page number/size query should return corresponding page', async () => {
    const searchRequest = { page: 2, pageSize: 2 }
    const addressBookSearchResponse = await addressBookClient.searchContacts(
      searchRequest
    )
    console.log('GET searchContacts ', addressBookSearchResponse)
    expect(addressBookSearchResponse).toBeDefined()
    expect(addressBookSearchResponse.content.length).toBeGreaterThan(0)
    expect(addressBookSearchResponse.number).toEqual(2)
    expect(addressBookSearchResponse.totalPages).toBeGreaterThan(2)
  }, 3000)
})
