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
})