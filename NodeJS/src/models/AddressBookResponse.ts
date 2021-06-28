import { AddressBookContactResponse } from './AddressBookContactResponse'

export interface AddressBookResponse {
  addressBookId: number
  subAccountAppId: string
  contacts: AddressBookContactResponse[]
}
