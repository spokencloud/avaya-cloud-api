import * as Constants from "../src/Constants";
import { createSession } from "../src/session"
import { createSubscriptionClient, SubscriptionClient } from "../src/SubscriptionClient";
import { Subscription } from "../src/Subscription";
import {getValue} from "../src/Utils";
import { RestClient } from "../src/RestClient";


const args = require('minimist')(process.argv.slice(2));

let endpoint = getValue(Constants.ENDPOINT_KEY, args)
let masterToken = getValue(Constants.API_KEY, args)

let restClient = new RestClient(endpoint, masterToken)

async function createSubscription(subscriptionClient: SubscriptionClient) {
    try {
        let createSubscriptionRequest = {
            "dataSourceType": "HAGENT",
            "dataDeliveryFormat": "CSV",
            "endpoint": "https://example.com",
            "retryPolicy": "DEFAULT",
            "basicAuthUsername": "avaya",
            "basicAuthPassword": "password",
            "frequencyInMinutes": 0,
            "maxPostSize": 0,
            "startTime": "2019-11-04T21:55:24.421Z",
            "disableTLSVerify": true,
            "subAccountAppId": "ALL"
        };
        let returnedSubscriptionRequest = await subscriptionClient.createSubscription(createSubscriptionRequest);
        console.log('subscriptionObject from createSubscription');
        console.log(returnedSubscriptionRequest);
        return returnedSubscriptionRequest;
    } catch (e) {
        console.error(e)
    }
}

async function deleteSubscription(subscriptionClient: SubscriptionClient, subscriptionId: string) {
    try {
        await subscriptionClient.deleteSubscription(subscriptionId);
        console.log('subscription with ' + subscriptionId + ' deleted');
    } catch (e) {
        console.error(e);
    }
}

async function getAllSubscriptions(subscriptionClient: SubscriptionClient) {
    try {
        let allSubscriptions = await subscriptionClient.getAllSubscriptions();
        console.log('all subscriptions:');
        console.log(allSubscriptions);
    } catch (e) {
        console.error(e)
    }
}

async function getSubscription(subscriptionClient: SubscriptionClient, subscriptionId: string) {
    try {
        let subscriptionObject = await subscriptionClient.getSubscription(subscriptionId)
            .then((result: { data: any }) => result.data);
        console.log('subscriptionObject from getSubscription');
        console.log(subscriptionObject)
    } catch (e) {
        console.error(e)
    }
}

async function updateSubscription(subscriptionClient: SubscriptionClient,subscription: Subscription) {
    try {
        subscription.dataDeliveryFormat = 'JSON'
        let returnedSubscriptionRequest = await subscriptionClient.updateSubscription(subscription);
        console.log('subscriptionObject from updateSubscription');
        console.log(returnedSubscriptionRequest);
        return returnedSubscriptionRequest;
    } catch (e) {
        console.error(e)
    }
}

async function main() {
    let subscriptionClient = await createSubscriptionClient(restClient);

    await getAllSubscriptions(subscriptionClient);
    //let subscription = await createSubscription();
    //await updateSubscription(subscription);
    // await getSubscription(subscription.subscriptionId);
    // await deleteSubscription(subscription.subscriptionId);
}

main();

