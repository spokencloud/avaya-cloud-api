import { AgentClient, createAgentClient } from "../src/AgentClient";
import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from "../src/RestClient";

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
       let result = await agentClient.waitForStationDeletion("agent1")
       expect(result).toBeTruthy()
    })
    test("waitForAgentDeletion should return true", async () => {
        let result = await agentClient.waitForAgentDeletion("agent1")
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
     test("")
})