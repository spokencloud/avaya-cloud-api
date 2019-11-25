import { RestClient } from "../src/RestClient";

describe("RestClient", () => {
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY"
    test("getUser ", async () => {
        const restClient = new RestClient("http://localhost:8081", token)
        expect(restClient.masterCredential.token).toEqual("Bearer "+token)
        let response = await restClient.getUser()
        expect(response.token).toEqual(token)
        expect(restClient.printMasterCookieJar()).toContain("SESSION")
    })
})