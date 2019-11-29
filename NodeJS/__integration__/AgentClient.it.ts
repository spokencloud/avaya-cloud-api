import { AgentClient, createAgentClient } from "../src/AgentClient"
import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from "../src/RestClient"
import { randomString } from "../src/Utils"

describe("AgentClient", () => {
    // yangadmin1
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY"
    let restClient: RestClient
    let agentClient: AgentClient

    beforeEach(async () => {
        restClient = new RestClient("http://localhost:8081", token)
        agentClient = await createAgentClient(restClient)
    });
    test("waitForStationDeletion should return true", async () => {
       let result = await agentClient.waitForStationDeletion("agentNotExists")
       expect(result).toBeTruthy()
    })
    test("waitForAgentDeletion should return true", async () => {
        let result = await agentClient.waitForAgentDeletion("agentNotExists")
        expect(result).toBeTruthy()
     })
     test("getSkillIds should return skillIds", async () => {
         let skillIds = await agentClient.getSkillIds()
         expect(skillIds.length).toBeGreaterThan(0)
     })
     test("getSkillNumbers should return skillNumbers", async () => {
         let skillNumbers = await agentClient.getSkillNumbers()
         expect(skillNumbers.length).toBeGreaterThan(0)
     })
     xtest("existsAgentByLoginId should return true when agent exists", async () => {
        let exists = await agentClient.existsAgentByLoginId(7300000100)
        expect(exists).toBeTruthy()
     })
     xtest("waitForAgentCreation should return true when agent exists", async () => {
        let exists = await agentClient.waitForAgentCreation(7300000100)
        expect(exists).toBeTruthy()
     })
     xtest("waitForAgentCreation should return false when agent does not exists", async () => {
        let exists = await agentClient.waitForAgentCreation(3337300000100)
        expect(exists).toBeFalsy()
     })
     xtest("existsAgentByUsername returns when agent exists by username", async () => {
        let exists = await agentClient.existsAgentByUsername("ddksgy3dnr")
        expect(exists).toBeTruthy()
     })
     xtest("existsStationForAgent should return false when agent has no station", async () => {
        let exists = await agentClient.existsStationForAgent("ddksgy3dnr")
        expect(exists).toBeFalsy()
     })
     xtest("getAgent should return agent and station", async () => {
         let agentAndStation = await agentClient.getAgent("ddksgy3dnr")
         expect(agentAndStation.agent).toBeDefined()
         expect(agentAndStation.station).toEqual({})
     })
     xtest("createStationIfNotExists should return true", async ()=> {
         let result = await agentClient.createStationIfNotExists("ddksgy3dnr", "2")
         expect(result).toBeTruthy()
     })
})