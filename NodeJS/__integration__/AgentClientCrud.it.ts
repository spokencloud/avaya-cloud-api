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
    xtest("waitForStationDeletion should return true", async () => {
       let result = await agentClient.waitForStationDeletion("agent1")
       expect(result).toBeTruthy()
    })

     // todo: right now this takes too long to finish
     xtest("createAgent", async () => {
        let skillPriority = {skillNumber: 100, skillPriority: 2}
        let username = "ddksgy3dnr" // randomString(10)
        let result =await agentClient.createAgentAndStation(username, "Passw0rd!", [skillPriority])
        console.log(restClient)
     })

     xtest("createStationIfNotExists should return true", async ()=> {
         let result = await agentClient.createStationIfNotExists("ddksgy3dnr", "2")
         expect(result).toBeTruthy()
     })
     test("deleteAgent", async () => {
        let result = await agentClient.deleteAgent("ddksgy3dnr")
        expect(result).toBeTruthy()
      })
      xtest("requestAgentDeletion should return false if ddksgy3dnr can not be deleted", async () => {
         let username = "ddksgy3dnr"
         let submitted = await restClient.requestAgentDeletion(username, "7300000100")
         expect(submitted).toBeTruthy()
     })
})