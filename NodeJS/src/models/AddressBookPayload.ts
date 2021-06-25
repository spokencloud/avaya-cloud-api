import { AddressBookContactPayload } from './AddressBookContactPayload'

export interface AddressBookPayload {
  addressBookId: number
  subAccountAppId: string
  contacts: AddressBookContactPayload[]
}
