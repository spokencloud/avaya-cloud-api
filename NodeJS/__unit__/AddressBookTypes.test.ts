import {
  AddressBookSearchRequest,
  appendQueryParam,
  buildQueryParams
} from '../src'

describe('AddressBookTypes.ts tests', () => {
  test('appendQueryParam for an empty query should return string starts with a question mark', () => {
    const result = appendQueryParam('', 'param1', 'value1')
    expect(result).toEqual('?param1=value1')
  })

  test('appendQueryParam for a non-empty query should return the query appended with ampersand and key-value pair', () => {
    const result = appendQueryParam('?param1=value1', 'param2', 'value2')
    expect(result).toEqual('?param1=value1&param2=value2')
  })

  test('buildQueryParams w/o AddressBookSearchRequest should return empty query', () => {
    const result = buildQueryParams()
    expect(result).toEqual('')
  })

  test('buildQueryParams for an empty request should return empty query', () => {
    const request: AddressBookSearchRequest = {}
    const result = buildQueryParams(request)
    expect(result).toEqual('')
  })

  test('buildQueryParams for a non-empty request should return a query with valid connectors and key-value pairs', () => {
    const request: AddressBookSearchRequest = {
      type: 'ACO',
      query: 'aco1',
      orderBy: 'name',
      orderDirection: 'DESC',
      page: 0,
      pageSize: 5
    }
    const result = buildQueryParams(request)
    expect(result).toEqual(
      '?type=ACO&query=aco1&orderBy=name&orderDirection=DESC&page=0&pageSize=5'
    )
  })
})
