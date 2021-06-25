import { SkillPriority } from './models'
import { RestClient } from './RestClient'
import { sleep } from './Utils'
import { AddressBookPayload } from './models/AddressBookPayload'
import { AddressBookSearchPayload } from './models/AddressBookSearchPayload'

export class AddressBookClient {
  private restClient: RestClient
  private subAccountId: string

  constructor(subAccountId: string, restClient: RestClient) {
    this.restClient = restClient
    this.subAccountId = subAccountId
  }

  /**
   * @returns AddressBookPayload
   * {
   *  addressBookId: number,
   *  subAccountAppId: string,
   *  contacts: Array<AddressBookContactPayload>
   * }
   */
  public async getAddressBook(): Promise<AddressBookPayload> {
    return await this.restClient.getAddressBook()
  }

  /**
   * @param type (optional) Contact Type (ACO, Outbound, VDN, Agent, Supervisor)
   * @param query (optional) text to search (for name and destination properties using partial matching).
   * Also if query is a valid number, virtualExtension property will also be searched (by comparing values)
   * @param orderBy (optional, default = name) property to sort by name, type, virtualExtension, destination
   * @param orderDirection (optional)
   * @param page (optional)
   * @param pageSize (optional)
   *
   * @returns AddressBookSearchPayload
   * {
   *  content: Array<AddressBookContactPayload>,
   *  totalPages: number,
   *  totalElements: number,
   *  number: number,
   *  numberOfElements: number,
   *  size: number
   * }
   */
  public async searchContacts(
    type: string,
    query: string,
    orderBy: string,
    orderDirection: string,
    page: number,
    pageSize: number
  ): Promise<AddressBookSearchPayload> {
    return await this.restClient.searchContacts(
      type,
      query,
      orderBy,
      orderDirection,
      page,
      pageSize
    )
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
