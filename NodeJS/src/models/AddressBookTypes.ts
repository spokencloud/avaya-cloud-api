export interface AddressBookContactResponse {
  name: string
  type: string
  virtualExtension: string | null
  destination: string
  dialString: string
}

export interface AddressBookResponse {
  addressBookId: number
  subAccountAppId: string
  contacts: AddressBookContactResponse[]
}

export interface AddressBookSearchRequest {
  type?: string
  query?: string
  orderBy?: string
  orderDirection?: string
  page?: number
  pageSize?: number
}

export interface AddressBookSearchResponse {
  content: AddressBookContactResponse[]
  totalPages: number
  totalElements: number
  number: number
  numberOfElements: number
  size: number
}

export function buildQueryParams(request?: AddressBookSearchRequest) {
  if (request === undefined) {
    return ''
  }
  let queryParams = ''
  if (request.type) {
    queryParams = appendQueryParam(queryParams, 'type', request.type)
  }
  if (request.query) {
    queryParams = appendQueryParam(queryParams, 'query', request.query)
  }
  if (request.orderBy) {
    queryParams = appendQueryParam(queryParams, 'orderBy', request.orderBy)
  }
  if (request.orderDirection) {
    queryParams = appendQueryParam(
      queryParams,
      'orderDirection',
      request.orderDirection
    )
  }
  if (request.page !== undefined) {
    queryParams = appendQueryParam(queryParams, 'page', request.page)
  }
  if (request.pageSize !== undefined) {
    queryParams = appendQueryParam(queryParams, 'pageSize', request.pageSize)
  }
  return queryParams
}

export function appendQueryParam(
  query: string,
  paramName: string,
  paramValue: string | number
) {
  const connectorCharacter = query ? '&' : '?'
  return `${query}${connectorCharacter}${paramName}=${paramValue}`
}
