import { RestClient } from "../src/RestClient";

describe("RestClient", () => {
    const token = "fake token"
    let restClient: RestClient;
    beforeEach(() => {
        restClient = new RestClient("http://localhost:8081", token)
    });
    test("prepareBaseOptions should return options", async () => {
        let baseOptions = restClient.prepareBaseOptions()
        expect(baseOptions.headers.Authorization).toEqual("Bearer " + token)
        expect(baseOptions.jar).toBeDefined()
        expect(baseOptions.withCredentials).toBeTruthy()
    })
    test("prepareGetOptions should have get method", async () => {
        let url = "url"
        let baseOptions = restClient.prepareGetOptions(url)
        expect(baseOptions.headers.Authorization).toEqual("Bearer " + token)
        expect(baseOptions.jar).toBeDefined()
        expect(baseOptions.withCredentials).toBeTruthy()
        expect(baseOptions.url).toBe(url)
        expect(baseOptions.method).toEqual("GET")
    })
    test("prepareDeleteOptions should have delete method", async () => {
        let url = "url"
        let baseOptions = restClient.prepareDeleteOptions(url)
        expect(baseOptions.headers.Authorization).toEqual("Bearer " + token)
        expect(baseOptions.jar).toBeDefined()
        expect(baseOptions.withCredentials).toBeTruthy()
        expect(baseOptions.url).toBe(url)
        expect(baseOptions.method).toEqual("DELETE")
    })
    test("token should starts with Bearer", async () => {
        expect(restClient.masterCredential.token).toEqual("Bearer " + token)
    })
    test("storeUserToken should store token", () => {
        expect(restClient.credentials.has("username")).toBeFalsy()
        restClient.storeUserToken("username", "token")
        expect(restClient.credentials.has("username")).toBeTruthy()
    })

})