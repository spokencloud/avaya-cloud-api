import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from "../src/RestClient";

describe("RestClient Subscription Integration Test", () => {

    // yangadmin1
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY"
    let restClient: RestClient;
    beforeEach(() => {
        restClient = new RestClient("http://localhost:8081", token)
    });

    test("getDataSubscription should retreive empty data", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptionId = "1"
        let subscriptions = await restClient.getDataSubscription(subAccountAppId, subscriptionId)
        expect(subscriptions).toEqual({})
    })
    test("", async () =>{
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
        let subAccountAppId = "MYA_MYARec"

        let subscription = await restClient.createDataSubscription(subAccountAppId, createSubscriptionRequest)
        console.log(subscription)
        expect(subscription.subAccountAppId).toEqual(subAccountAppId)
    }
    )

    xtest("updateDataSubscription on nonexist subscription should fail", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptionId = "1"
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

    test("deleteDataSubscription should retreive empty data", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptionId = "1"
        let subscriptions = await restClient.deleteDataSubscription(subAccountAppId, subscriptionId)
        expect(subscriptions).toEqual("")
    })

    test("getAllSubscriptions should return subscriptions", async () => {
        let subAccountAppId = "MYA_MYARec"
        let subscriptions = await restClient.getAllSubscriptions(subAccountAppId)
        expect(subscriptions.length).toBeGreaterThan(0)
    })
})