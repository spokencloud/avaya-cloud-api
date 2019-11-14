import {Session} from "./session";
import {Subscription} from "./Subscription";

const VERSION = '1.0';
const SUBSCRIPTION_PATH = '/spokenAbc/subscriptions/v' + VERSION + '/subscriptions';
const SLASH = '/';
const SUB_ACCOUNT_KEY = 'subAccountAppId=';
const QUESTION_MARK = '?';

class SubscriptionClient {
    session:Session;

    constructor(session: any) {
        this.session = session
    }

    async createSubscription(createSubscriptionRequest:Subscription) {
        await this.session.login();

        let subAccountAppId = await this.getSubAccountAppId();
        createSubscriptionRequest.subAccountAppId = subAccountAppId;
        let returnedSubscription = await this.session.post(
            SUBSCRIPTION_PATH + QUESTION_MARK + SUB_ACCOUNT_KEY + subAccountAppId,
            createSubscriptionRequest)
            .then(result => result.data);

        return returnedSubscription
    }

    async getAllSubscriptions() {
        await this.session.login();
        let subAccountAppId = await this.getSubAccountAppId();
        return this.session.get(SUBSCRIPTION_PATH + QUESTION_MARK + SUB_ACCOUNT_KEY + subAccountAppId)
            .then(result => result.data)
    }

    async getSubAccountAppId() {
        return this.session.getSubAccount()
            .then(response => {
                return response.appId
            })
    }

    async updateSubscription(updateSubscriptionRequest:Subscription) {
        await this.session.login();

        let subAccountAppId = await this.getSubAccountAppId();
        updateSubscriptionRequest.subAccountAppId = subAccountAppId;
        let returnedSubscription = await this.session.put(
            SUBSCRIPTION_PATH + SLASH + updateSubscriptionRequest.subscriptionId
            + QUESTION_MARK + SUB_ACCOUNT_KEY + subAccountAppId,
            updateSubscriptionRequest)
            .then(result => result.data);

        return returnedSubscription
    }

    async deleteSubscription(subscriptionId:string) {
        await this.session.login();

        let subAccountAppId = await this.getSubAccountAppId();

        return await this.session.delete(SUBSCRIPTION_PATH + SLASH + subscriptionId
            + QUESTION_MARK + SUB_ACCOUNT_KEY + subAccountAppId)
    }

    async getSubscription(subscriptionId:string) {
        await this.session.login();

        let subAccountAppId = await this.getSubAccountAppId();

        return this.session.get(SUBSCRIPTION_PATH + SLASH + subscriptionId
            + QUESTION_MARK + SUB_ACCOUNT_KEY + subAccountAppId)
    }
}

export function createSubscriptionClient(session:Session){
    return new SubscriptionClient(session);
}
