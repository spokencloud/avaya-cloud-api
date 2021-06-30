import { AddressBookResponse } from './models'
import { AddressBookSearchRequest } from './models'
import { AddressBookSearchResponse } from './models'
import { RestClient } from './RestClient'

export class AddressBookClient {
  private restClient: RestClient

  constructor(endpoint: string, apiKey: string) {
    this.restClient = new RestClient(endpoint, apiKey)
  }

  /**
   * @returns AddressBookResponse with all active contacts for a Sub-account
   */
  public async getAddressBook(): Promise<AddressBookResponse> {
    return await this.restClient.getAddressBook()
  }

  /**
   * @param AddressBookSearchRequest (optional) search by type, query, orderBy, orderDirection, page, pageSize
   * @returns AddressBookSearchResponse with active contacts for a Sub-account according to search params
   */
  public async searchContacts(
    request?: AddressBookSearchRequest
  ): Promise<AddressBookSearchResponse> {
    return await this.restClient.searchContacts(request)
  }
}

export function createAddressBookClient(
  endpoint: string,
  apiKey: string
): AddressBookClient {
  return new AddressBookClient(endpoint, apiKey)
}
