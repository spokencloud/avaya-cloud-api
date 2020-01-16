import { DataDeliveryFormat, DataSourceType, EventType, RetryPolicy, Subscription } from "../src/models";
import { createSubscriptionClient, SubscriptionClient } from "../src/SubscriptionClient";

describe("SubscriptionClient.ts", () => {
    const localEnv = {
        user: "yangadmin1",
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY",
        url: "http://localhost:8081",
        subAccountAppId: "MYA_MYARec",
    };

    const {subAccountAppId, token, url} = localEnv;

    let subscriptionClient: SubscriptionClient;
    beforeEach(async () => {
        subscriptionClient = await createSubscriptionClient(url, token);
    });

    test("createSubscription, updateSubscription, deleteSubscription should return subscription", async () => {

        const createSubscriptionRequest = {
            dataSourceType: DataSourceType.HAgent,
            dataDeliveryFormat: DataDeliveryFormat.Csv,
            endpoint: "https://example.com",
            retryPolicy: RetryPolicy.Default,
            basicAuthUsername: "avaya",
            basicAuthPassword: "password",
            frequencyInMinutes: 0,
            maxPostSize: 0,
            startTime: "2019-11-04T21:55:24.421Z",
            disableTLSVerify: true,
            subAccountAppId: "ALL",
            eventType: EventType.Realtime,
        };

        let subscription = await subscriptionClient.createSubscription(createSubscriptionRequest);
        expect(subscription.subscriptionId).toBeDefined();
        console.log("subscription created with id ", subscription.subscriptionId);
        const updateSubscriptionRequest: Subscription = {
            subscriptionId: subscription.subscriptionId,
            dataSourceType: DataSourceType.HAgent,
            dataDeliveryFormat: DataDeliveryFormat.Csv,
            endpoint: "https://example.com",
            retryPolicy: RetryPolicy.Default,
            basicAuthUsername: "avaya",
            basicAuthPassword: "password",
            frequencyInMinutes: 0,
            maxPostSize: 0,
            startTime: "2019-11-04T21:55:24.421Z",
            disableTLSVerify: true,
            subAccountAppId: subAccountAppId,
            eventType: EventType.Historical,
        };
        subscription = await subscriptionClient.updateSubscription(updateSubscriptionRequest);
        expect(subscription.subscriptionId).toBeDefined();
        console.log("subscription updated with id ", subscription.subscriptionId);

        const result = await subscriptionClient.deleteSubscription(subscription.subscriptionId);
        expect(result).toBe(200);
        console.log("subscription deleted with id ", subscription.subscriptionId);

    }, 20000);

});