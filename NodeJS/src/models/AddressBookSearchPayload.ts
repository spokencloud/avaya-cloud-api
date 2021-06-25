import { AddressBookContactPayload } from './AddressBookContactPayload'

export interface AddressBookSearchPayload {
  content: AddressBookContactPayload[]
  totalPages: number
  totalElements: number
  number: number
  numberOfElements: number
  size: number
}
