import SkillPriority, { AgentClient } from "../src/AgentClient";
import { Session } from "../src/session";

describe("AgentClient.ts", () => {
    test("generateAvayaPassword should return last 6 characters", () => {
        let session = Session as jest.Mock<Session>
        let client = new AgentClient(session)
        let actual = client.generateAvayaPassword("agentLoginId")
        expect(actual).toEqual("oginId")
    })
    test("generateAvayaPassword should return full string", () => {
        let session = Session as jest.Mock<Session>
        let client = new AgentClient(session)
        let actual = client.generateAvayaPassword("abc")
        expect(actual).toEqual("abc")
    })
    test("generateSecurityCode should return last 4 chars", () => {
        let session = Session as jest.Mock<Session>
        let client = new AgentClient(session)
        let actual = client.generateSecurityCode("securityCode")
        expect(actual).toEqual("Code")
    })
    test("generateSecurityCode should return all chars", () => {
        let session = Session as jest.Mock<Session>
        let client = new AgentClient(session)
        let actual = client.generateSecurityCode("abc")
        expect(actual).toEqual("abc")
    })
    test("stationExtension: { toString: () => any }", () => {
        let stationExtension: { toString: () => any } = "hello world"
        expect(stationExtension.toString()).toEqual("hello world")
    })
})