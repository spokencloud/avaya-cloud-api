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
