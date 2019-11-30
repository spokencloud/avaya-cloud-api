import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from "../src/RestClient";

describe("RestClient", () => {

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

})