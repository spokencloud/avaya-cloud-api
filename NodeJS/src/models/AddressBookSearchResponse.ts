import { AddressBookContactResponse } from './AddressBookContactResponse'

export interface AddressBookSearchResponse {
  content: AddressBookContactResponse[]
  totalPages: number
  totalElements: number
  number: number
  numberOfElements: number
  size: number
}
