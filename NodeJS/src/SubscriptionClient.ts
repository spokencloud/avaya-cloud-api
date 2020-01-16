import { log4js } from './Constants'
import { CreateSubscriptionData, Subscription } from './models'
import { RestClient } from './RestClient'

const logger = log4js.getLogger('SubscriptionClient')

export class SubscriptionClient {
    public subAccountAppId: string
    public restClient: RestClient
    constructor(subAccountAppId: string, restClient: RestClient) {
        this.subAccountAppId = subAccountAppId
        this.restClient = restClient
    }

    /**
     * create a data subscription on the default sub account and returns a Subscription object
     * @param createSubscriptionRequest
     */
    public async createSubscription(createSubscriptionRequest: CreateSubscriptionData): Promise<Subscription> {
        const returnedSubscription = await this.restClient.createDataSubscription(
            this.subAccountAppId,
            Object.assign({}, createSubscriptionRequest, { subAccountAppId: this.subAccountAppId }))
            .then((result: Subscription) => result)

        return returnedSubscription
    }

    /**
     * return all subscripitions of the default sub account
     */
    public async getAllSubscriptions(): Promise<Subscription[]> {
        return await this.restClient.getAllSubscriptions(this.subAccountAppId)
    }

    /**
     * Update subscription and returns updated Subscription object
     * @param updateSubscriptionRequest
     */
    public async updateSubscription(updateSubscriptionRequest: Subscription): Promise<Subscription> {
        updateSubscriptionRequest.subAccountAppId = this.subAccountAppId
        const returnedSubscription = await this.restClient.updateDataSubscription(this.subAccountAppId,
            updateSubscriptionRequest.subscriptionId,
            updateSubscriptionRequest)
            .then((result: Subscription) => result)
        return returnedSubscription
    }

    /**
     * Delete subscription by subscription id. Returns 200 if successful, negative status code in error.
     * @param subscriptionId
     */
    public async deleteSubscription(subscriptionId: string): Promise<number> {
        return await this.restClient.deleteDataSubscription(this.subAccountAppId, subscriptionId)
    }

    /**
     * returns Subscription object given subscription id or an empty object
     * @param subscriptionId
     */
    public async getSubscription(subscriptionId: string) {
        return await this.restClient.getDataSubscription(this.subAccountAppId, subscriptionId)
    }
}
async function createInstance(restClient: RestClient) {
    const subAccountAppId = await restClient.getSubAccountAppId()
    return new SubscriptionClient(subAccountAppId, restClient)
}
/**
 * create SubscriptionClient given endpoint and apiKey
 * @param endpoint
 * @param apiKey
 */
export async function createSubscriptionClient(endpoint: string, apiKey: string) {
    const restClient = new RestClient(endpoint, apiKey)
    return await createInstance(restClient)
}
