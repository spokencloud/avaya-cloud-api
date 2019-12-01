import { Subscription } from "./Subscription"
import { RestClient } from "./RestClient"
import { log4js } from "./Constants"

const logger = log4js.getLogger('SubscriptionClient');

export class SubscriptionClient {
    subAccountAppId: string
    restClient: RestClient
    constructor(subAccountAppId: string, restClient: RestClient) {
        this.subAccountAppId = subAccountAppId
        this.restClient = restClient
    }

    public async createSubscription(createSubscriptionRequest: Subscription) {
        createSubscriptionRequest.subAccountAppId = this.subAccountAppId;
        let returnedSubscription = await this.restClient.createDataSubscription(
            this.subAccountAppId,
            createSubscriptionRequest)
            .then((result: any) => result);

        return returnedSubscription
    }

    public async getAllSubscriptions() {
        return await this.restClient.getAllSubscriptions(this.subAccountAppId)
    }

    public async updateSubscription(updateSubscriptionRequest: Subscription) {
        updateSubscriptionRequest.subAccountAppId = this.subAccountAppId;
        let returnedSubscription = await this.restClient.updateDataSubscription(this.subAccountAppId,
            updateSubscriptionRequest.subscriptionId,
            updateSubscriptionRequest)
            .then((result: any) => result.data);

        return returnedSubscription
    }

    public async deleteSubscription(subscriptionId: string) {
        return await this.restClient.deleteDataSubscription(this.subAccountAppId, subscriptionId)
    }

    public async getSubscription(subscriptionId: string) {
        return this.restClient.getDataSubscription(this.subAccountAppId, subscriptionId)
    }
}
async function createInstance(restClient: RestClient){
    let subAccountAppId = await restClient.getSubAccountAppId()
    return new SubscriptionClient(subAccountAppId, restClient);
}
export async function createSubscriptionClient(endpoint: string, apiKey: string) {
    let restClient = new RestClient(endpoint, apiKey)
    return await createInstance(restClient)
}
