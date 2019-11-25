import { RestClient } from "../src/RestClient";

describe("RestClient", () => {
    const token = "fake token"
    test("token should starts with Bearer", async () => {
        const restClient = new RestClient("http://localhost:8081", token)
        expect(restClient.masterCredential.token).toEqual("Bearer "+token)
    })
    test("storeUserToken should store token", () => {
        const restClient = new RestClient("http://localhost:8081", token)
        expect(restClient.credentials.has("username")).toBeFalsy()
        restClient.storeUserToken("username", "token")
        expect(restClient.credentials.has("username")).toBeTruthy()
    })
})