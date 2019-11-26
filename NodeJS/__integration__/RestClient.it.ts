import { RestClient } from "../src/RestClient";

describe("RestClient", () => {
    // yangadmin1
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY"

    test("getUserToken should retreive token ", async () => {
        const restClient = new RestClient("http://localhost:8081", token)
        let userToken = await restClient.getUserToken("yangadmin1")
        expect(userToken).toEqual(token)
    })
    test("getAndStoreUserStoken should store user token", async () => {
        const restClient = new RestClient("http://localhost:8081", token)
        await restClient.getAndStoreUserStoken("yangadmin1")
        expect(restClient.credentials.has("yangadmin1")).toBeTruthy()
        let {token: userToken} = restClient.credentials.get("yangadmin1") || { token:""}
        expect(userToken).toEqual(token)
    })

})