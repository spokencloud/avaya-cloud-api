import { anyString, instance, mock, reset, verify, when } from 'ts-mockito'
import { AgentClient } from '../src/AgentClient'
import { RestClient } from '../src/RestClient'

class AgentClientProtected extends AgentClient {
    public fetchDefaultSkillNumber() {
        return super.fetchDefaultSkillNumber()
    }
}

describe('AgentClient.ts tests with mocked RestClient', () => {
    let agentClient: AgentClientProtected
    const restClientMock: RestClient = mock(RestClient)
    let restClientInstance: RestClient

    beforeEach(() => {
        reset(restClientMock)
        restClientInstance = instance(restClientMock)
    })
    test('fetchDefaultSkillNumber should return default skill number', async () => {
        const data = { skillResponses: { 1: [{ name: 'DEFAULT_SKILL', number: 100 }] } }
        const response = { data }
        // set up mock
        when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // pass instance
        agentClient = new AgentClientProtected('1', restClientInstance)
        const skillNumber = await agentClient.fetchDefaultSkillNumber()
        expect(skillNumber).toEqual(100)
    })
    test('fetchDefaultSkillNumber should return undefined when default skill is not returned', async () => {
        const data = { skillResponses: { 1: [{ name: 'SKILL', number: 100 }] } }
        const response = { data }
        // set up mock
        when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve((response))
        // pass instance
        agentClient = new AgentClientProtected('1', restClientInstance)
        const skillNumber = await agentClient.fetchDefaultSkillNumber()
        expect(skillNumber).toBeUndefined()
        verify(restClientMock.getSubAccountAgentSkills('1')).once()
    })
})