import { RestClient } from "../src/RestClient";
import { log4js } from "../src/Constants"
// get root/default logger
const logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("Some debug messages"); // logged by default logger

describe("RestClient Subscription Integration Test", () => {

    const localEnv = {
        user: "yangadmin1",
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY",
        url: "http://localhost:8081",
        subAccountAppId: "MYA_MYARec"
    }

    const integrationEnv = {
        user: "yangtestadmin1",
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5ndGVzdGFkbWluMSIsImlzcyI6IkFCQ19TRUNVUklUWV9HQVRFV0FZIn0.I_-nlD5J3Jkdr-XihlD7rK-SjZgMqgI_soF2xHnAk34",
        url: "https://integration.bpo.avaya.com",
        subAccountAppId: "CCS_CCIRec"
    }

    const {subAccountAppId, token, url} = localEnv 

    let restClient: RestClient;
    let subscriptionId: string;
    beforeEach(() => {
        restClient = new RestClient(url, token)
        subscriptionId = ""
    });

    xtest("getDataSubscription should retreive empty data", async () => {
        let subscriptionId = "1" // "27bd115d-3805-4019-ad30-e73c671af752"
        let subscriptions = await restClient.getDataSubscription(subAccountAppId, subscriptionId)
        expect(subscriptions).toEqual({})
    })
    xtest("createDataSubscription should create a new subscription", async () =>{
        let createSubscriptionRequest = {
            "dataSourceType": "HAGENT",
            "dataDeliveryFormat": "CSV",
            "endpoint": "https://example.com",
            "retryPolicy": "DEFAULT",
            "basicAuthUsername": "avaya",
            "basicAuthPassword": "avayanodeapi",
            "frequencyInMinutes": 0,
            "maxPostSize": 0,
            "startTime": "2019-11-04T21:55:24.421Z",
            "disableTLSVerify": true,
            "subAccountAppId": "ALL",
            "eventType": "HISTORICAL"
        };
        let subscription = await restClient.createDataSubscription(subAccountAppId, createSubscriptionRequest)
        console.log(subscription)
        subscriptionId = subscription.subscriptionId
        expect(subscription.subAccountAppId).toEqual(subAccountAppId)

        /*
        let status = await restClient.deleteDataSubscription(subAccountAppId, subscriptionId)
        expect(status).toEqual(200)
        */
    }, 50000)

    xtest("updateDataSubscription on nonexist subscription should fail", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptionId = "6b9296f0-d43a-4fc7-89e6-b4bd9b4a8ff7"
        let updateSubscriptionRequest = {
            subAccountAppId,
            endpoint: "http://localhost:8081",
            dataSourceType: "ECH",
            dataDeliveryFormat: "JSON",
            retryPolicy: "DEFAULT"
        }
        let subscriptions = await restClient.updateDataSubscription(subAccountAppId, subscriptionId, updateSubscriptionRequest)
        expect(subscriptions).toEqual(500)
    })
    test("updateDataSubscription on exist subscription should succeed", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptionId = "6b9296f0-d43a-4fc7-89e6-b4bd9b4a8ff7"
        let updateSubscriptionRequest = {
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
            "subAccountAppId": subAccountAppId,
            "eventType": "HISTORICAL"
        }
        let subscriptions = await restClient.updateDataSubscription(subAccountAppId, subscriptionId, updateSubscriptionRequest)
        expect(subscriptions.subscriptionId).toEqual(subscriptionId)
    })

    xtest("deleteDataSubscription should return 403 when subAccountAppId does not exists.", async () => {
        let subscriptionId = "200c216a-2178-44af-9927-ef28cb4307a7"
        let subscription = await restClient.deleteDataSubscription("subaccount", subscriptionId)
        expect(subscription).toEqual(-403)
    })

    xtest("deleteDataSubscription should return 200 when subscription exists.", async () => {
        let subscriptionId = "27bd115d-3805-4019-ad30-e73c671af752"
        let subscription = await restClient.deleteDataSubscription(subAccountAppId, subscriptionId)
        expect(subscription).toEqual(200)
    })
    xtest("getAllSubscriptions should return subscriptions", async () => {
        let subscriptions = await restClient.getAllSubscriptions(subAccountAppId)
        console.log(subscriptions)
        expect(subscriptions.length).toBeGreaterThan(0)
    })
})