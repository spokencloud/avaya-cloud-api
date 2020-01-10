import { AgentClient } from "../src/AgentClient";
import { RestClient } from "../src/RestClient";
import { mock, when, anyString, reset, instance, verify } from "ts-mockito";


describe("AgentClient.ts tests with mocked RestClient", () => {
    let agentClient: AgentClient;
    let restClient: RestClient = mock(RestClient)

    beforeEach(() => {
        reset(restClient)
    });
    test("getDefaultSkillId should return default skill id", async () => {
        let data = { "skillResponses": { '1': [{ name: 'DEFAULT_SKILL', id: 100 }] } }
        let response = { data }
        when(restClient.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // has to create an instance
        let instanceRestClient = instance(restClient)
        agentClient = new AgentClient("1", instanceRestClient)
        let skillId = await agentClient.getDefaultSkillId()
        expect(skillId).toEqual(100)
    })
    test("getDefaultSkillId should return undefined when default skill is not returned", async () => {
        let data = { "skillResponses": { '1': [{ name: 'SKILL', id: 100 }] } }
        let response = { data }
        when(restClient.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // has to create an instance
        let instanceRestClient = instance(restClient)
        agentClient = new AgentClient("1", instanceRestClient)
        let skillId = await agentClient.getDefaultSkillId()
        expect(skillId).toBeUndefined()
        verify(restClient.getSubAccountAgentSkills('1')).once()
    })
})