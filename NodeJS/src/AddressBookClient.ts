import { SkillPriority } from './models'
import { RestClient } from './RestClient'
import { sleep } from './Utils'
import { AddressBookResponse } from './models/AddressBookResponse'
import { AddressBookSearchRequest } from './models/AddressBookSearchRequest'
import { AddressBookSearchResponse } from './models/AddressBookSearchResponse'

export class AddressBookClient {
  private restClient: RestClient
  private subAccountId: string

  constructor(subAccountId: string, restClient: RestClient) {
    this.restClient = restClient
    this.subAccountId = subAccountId
  }

  /**
   * @returns AddressBookResponse with all active contacts for a Sub-account
   */
  public async getAddressBook(): Promise<AddressBookResponse> {
    return await this.restClient.getAddressBook()
  }

  /**
   * @param AddressBookSearchRequest (optional) search params: type, query, orderBy, orderDirection, page, pageSize
   * @returns AddressBookSearchResponse with active contacts for a Sub-account according to query params
   */
  public async searchContacts(
    request?: AddressBookSearchRequest
  ): Promise<AddressBookSearchResponse> {
    return await this.restClient.searchContacts(request)
  }
}

async function createInstance(restClient: RestClient) {
  const subAccountId = await restClient.getSubAccountId()
  return new AddressBookClient(subAccountId, restClient)
}

export async function createAddressBookClient(
  endpoint: string,
  apiKey: string
): Promise<AddressBookClient> {
  const restClient = new RestClient(endpoint, apiKey)
  return await createInstance(restClient)
}
