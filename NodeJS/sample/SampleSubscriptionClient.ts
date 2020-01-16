import * as Constants from '../src/Constants'
import { DataDeliveryFormat, DataSourceType, EventType, RetryPolicy, Subscription } from '../src/models'
import { createSubscriptionClient, SubscriptionClient } from '../src/SubscriptionClient'
import { getValue } from '../src/Utils'

const args = require('minimist')(process.argv.slice(2))

let endpoint, apiKey
try {
    endpoint = getValue(Constants.ENDPOINT_KEY, args)
    apiKey = getValue(Constants.API_KEY, args)
    main(endpoint, apiKey)
} catch (error) {
    console.log(error)
    process.exit(-1)
}

async function createSubscription(subscriptionClient: SubscriptionClient) {
    try {
        const createSubscriptionRequest = {
            dataSourceType: DataSourceType.HAgent,
            dataDeliveryFormat: DataDeliveryFormat.Csv,
            endpoint: 'https://example.com',
            retryPolicy: RetryPolicy.Default,
            basicAuthUsername: 'avaya',
            basicAuthPassword: 'password',
            frequencyInMinutes: 0,
            maxPostSize: 0,
            startTime: '2019-11-04T21:55:24.421Z',
            disableTLSVerify: true,
            subAccountAppId: 'ALL',
            eventType: EventType.Historical,
        }
        const response = await subscriptionClient.createSubscription(createSubscriptionRequest)
        console.log('subscriptionObject from createSubscription')
        console.log(response)
        return response
    } catch (e) {
        console.error(e)
    }
}

async function deleteSubscription(subscriptionClient: SubscriptionClient, subscriptionId: string) {
    try {
        await subscriptionClient.deleteSubscription(subscriptionId)
        console.log('subscription with ' + subscriptionId + ' deleted')
    } catch (e) {
        console.error(e)
    }
}

async function getAllSubscriptions(subscriptionClient: SubscriptionClient) {
    try {
        const allSubscriptions = await subscriptionClient.getAllSubscriptions()
        console.log('total subscriptions:', allSubscriptions.length)
    } catch (e) {
        console.error(e)
    }
}

async function getSubscription(subscriptionClient: SubscriptionClient, subscriptionId: string) {
    try {
        const subscriptionObject = await subscriptionClient.getSubscription(subscriptionId)
        console.log('subscriptionObject from getSubscription')
        console.log(subscriptionObject)
    } catch (e) {
        console.error(e)
    }
}

async function updateSubscription(subscriptionClient: SubscriptionClient, subscription: Subscription) {
    try {
        subscription.dataDeliveryFormat = DataDeliveryFormat.Json
        const returnedSubscriptionRequest = await subscriptionClient.updateSubscription(subscription)
        console.log('subscriptionObject from updateSubscription')
        console.log(returnedSubscriptionRequest)
        return returnedSubscriptionRequest
    } catch (e) {
        console.error(e)
    }
}

async function main(endpoint: string, apiKey: string) {
    const subscriptionClient = await createSubscriptionClient(endpoint, apiKey)

    const subscription = await createSubscription(subscriptionClient)
    // await updateSubscription(subscription);
    if (!subscription) {
        console.error('create failed')
        return -1
    }
    console.log('subscription id is ', subscription.subscriptionId)
    await getSubscription(subscriptionClient, subscription.subscriptionId)
    await deleteSubscription(subscriptionClient, subscription.subscriptionId)
    return 0
}
