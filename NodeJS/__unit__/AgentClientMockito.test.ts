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
    const response = { data: [{ name: 'DEFAULT_SKILL', skillNumber: 100 }] }
    // set up mock
    when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve(
      response
    )
    // pass instance
    agentClient = new AgentClientProtected(
      '1',
      'MYA_MYARec',
      restClientInstance
    )
    const skillNumber = await agentClient.fetchDefaultSkillNumber()
    expect(skillNumber).toEqual(100)
  })
  test('fetchDefaultSkillNumber should return undefined when default skill is not returned', async () => {
    const response = { data: [{ name: 'some skill', skillNumber: 100 }] }
    // set up mock
    when(restClientMock.getSubAccountAgentSkills(anyString())).thenResolve(
      response
    )
    // pass instance
    agentClient = new AgentClientProtected(
      '1',
      'MYA_MYARec',
      restClientInstance
    )
    const skillNumber = await agentClient.fetchDefaultSkillNumber()
    expect(skillNumber).toBeUndefined()
    verify(restClientMock.getSubAccountAgentSkills('MYA_MYARec')).once()
  })
})
