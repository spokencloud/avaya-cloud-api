import { AgentClient } from "../src/AgentClient";
import { RestClient } from "../src/RestClient";
import { mock, when, anyString, reset, instance, verify } from "ts-mockito";

class AgentClientProtected extends AgentClient{
    public getDefaultSkillNumber(){
        return super.getDefaultSkillNumber()
    }
}

describe("AgentClient.ts tests with mocked RestClient", () => {
    let agentClient: AgentClientProtected;
    let restClientMock: RestClient = mock(RestClient)
    let restClientInstance: RestClient

    beforeEach(() => {
        reset(restClientMock)
        restClientInstance = instance(restClientMock)

    });
    test("getDefaultSkillId should return default skill id", async () => {
        let data = { "skillResponses": { '1': [{ name: 'DEFAULT_SKILL', number: 100 }] } }
        let response = { data }
        // set up mock
        when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // pass instance
        agentClient = new AgentClientProtected("1", restClientInstance)
        let skillId = await agentClient.getDefaultSkillNumber()
        expect(skillId).toEqual(100)
    })
    test("getDefaultSkillId should return undefined when default skill is not returned", async () => {
        let data = { "skillResponses": { '1': [{ name: 'SKILL', number: 100 }] } }
        let response = { data }
        // set up mock
        when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // pass instance
        agentClient = new AgentClientProtected("1", restClientInstance)
        let skillId = await agentClient.getDefaultSkillNumber()
        expect(skillId).toBeUndefined()
        verify(restClientMock.getSubAccountAgentSkills('1')).once()
    })
})