import * as Constants from "./Constants";
import { createSession } from "./session"
import { createSubscriptionClient } from "./SubscriptionClient";
import { Subscription } from "./Subscription";
import isValidParameter from "./Utils";
import { RestClient } from "./RestClient";


const args = require('minimist')(process.argv.slice(2));

let endpoint = args[Constants.ENDPOINT_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminUsername = args[Constants.ADMIN_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminPassword = args[Constants.ADMIN_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);

let isEndpointValid = isValidParameter(Constants.ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(Constants.ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(Constants.ADMIN_PASSWORD_KEY, adminPassword);

if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid
) {
    process.exit()
}
let session = createSession(endpoint, adminUsername, adminPassword);
// todo: provide token
let masterToken = ""
let restClient = new RestClient(endpoint, masterToken)
let subscriptionClient = createSubscriptionClient(session, restClient);

async function createSubscription() {
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

async function deleteSubscription(subscriptionId: string) {
    try {
        await subscriptionClient.deleteSubscription(subscriptionId);
        console.log('subscription with ' + subscriptionId + ' deleted');
    } catch (e) {
        console.error(e);
    }
}

async function getAllSubscriptions() {
    try {
        let allSubscriptions = await subscriptionClient.getAllSubscriptions();
        console.log('all subscriptions:');
        console.log(allSubscriptions);
    } catch (e) {
        console.error(e)
    }
}

async function getSubscription(subscriptionId: string) {
    try {
        let subscriptionObject = await subscriptionClient.getSubscription(subscriptionId)
            .then((result: { data: any }) => result.data);
        console.log('subscriptionObject from getSubscription');
        console.log(subscriptionObject)
    } catch (e) {
        console.error(e)
    }
}

async function updateSubscription(subscription: Subscription) {
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
    await getAllSubscriptions();
    //let subscription = await createSubscription();
    //await updateSubscription(subscription);
    // await getSubscription(subscription.subscriptionId);
    // await deleteSubscription(subscription.subscriptionId);
}

main();

