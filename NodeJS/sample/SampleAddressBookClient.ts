import { AddressBookClient, createAddressBookClient } from '../src'
import * as Constants from '../src/Constants'
import { getValue } from '../src/Utils'

const args = require('minimist')(process.argv.slice(2))

let endpoint: string
let apiKey: string

try {
  endpoint = getValue(Constants.ENDPOINT_KEY, args)
  apiKey = getValue(Constants.API_KEY, args)
  main()
    .catch(error => console.error(error))
    .finally(() => process.exit(-1))
} catch (error) {
  console.log(error)
  process.exit(-1)
}

async function getAddressBook(addressBookClient: AddressBookClient) {
  try {
    return await addressBookClient.getAddressBook()
  } catch (e) {
    console.log('getAddressBook error ')
    console.error(e)
  }
}

async function searchContacts(addressBookClient: AddressBookClient) {
  try {
    return await addressBookClient.searchContacts()
  } catch (e) {
    console.log('searchContacts error ')
    console.error(e)
  }
}

async function main() {
  const addressBookClient = createAddressBookClient(endpoint, apiKey)
  const addressBookResponse = await getAddressBook(addressBookClient)
  console.log(addressBookResponse)
  const addressBookSearchResponse = await searchContacts(addressBookClient)
  console.log(addressBookSearchResponse)
}
