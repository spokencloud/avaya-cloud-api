import SkillPriority, { AgentClient } from "../src/AgentClient";
import { Session } from "../src/session";
import { RestClient } from "../src/RestClient";

describe("AgentClient.ts", () => {
    let client: AgentClient;
    beforeEach(() => {
        // Cast to any if mocking and not fulfilling the static type
        let restClient: any = RestClient as jest.Mock
        client = new AgentClient("1", restClient)
    });

    test("generateAvayaPassword should return last 6 characters", () => {
        let actual = client.generateAvayaPassword("agentLoginId")
        expect(actual).toEqual("oginId")
    })
    test("generateAvayaPassword should return full string", () => {
        let actual = client.generateAvayaPassword("abc")
        expect(actual).toEqual("abc")
    })
    test("generateSecurityCode should return last 4 chars", () => {
        let actual = client.generateSecurityCode("securityCode")
        expect(actual).toEqual("Code")
    })
    test("generateSecurityCode should return all chars", () => {
        let actual = client.generateSecurityCode("abc")
        expect(actual).toEqual("abc")
    })
    test("stationExtension: { toString: () => any }", () => {
        let stationExtension: { toString: () => any } = "hello world"
        expect(stationExtension.toString()).toEqual("hello world")
    })
    test("redo less than max retries should return true", async () => {
        let retries = 7
        let millis = 5
        let count = 0
        let callback = () => {
            count++
            if (count < 3) {
                return Promise.resolve(false)
            }
            return Promise.resolve(true)

        }
        let result = await client.redo(callback, retries, millis)
        expect(result).toBeTruthy()
    })
    test("redo greater than max retries should return false", async () => {
        let retries = 3
        let millis = 5
        let count = 0
        let callback = () => {
    
            count++
            console.log(`callback count=${count}`)
            if (count < 10) {
                console.log(`callback if count=${count}`)
                return Promise.resolve(false)
            }
            console.log(`callback outside if count=${count}`)
            return Promise.resolve(true)
        }
        let result = await client.redo(callback, retries, millis)
        expect(result).toBeFalsy()
    })
    test("checkAgentPromise should return false", async () => {
       let result = await client.checkAgentPromise(Promise.reject(true))
       expect(result).toBeFalsy()
    })
    test("checkAgentPromise should return true", async () => {
        let result = await client.checkAgentPromise(Promise.resolve(true))
        expect(result).toBeTruthy()
     })
})