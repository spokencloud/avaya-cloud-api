import { AgentClient, createAgentClient } from '../src/AgentClient'

import { log4js } from '../src/Constants'

const rootLogger = log4js.getLogger()
rootLogger.level = 'debug'
rootLogger.debug('Starting AgentClient Integration Test')

describe('AgentClient', () => {
  // yangadmin1
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY'
  let agentClient: AgentClient

  beforeEach(async () => {
    agentClient = await createAgentClient('http://localhost:8081', token)
  })
  test('waitForStationDeletion should return true', async () => {
    const result = await agentClient.waitForStationDeletion('agentNotExists')
    expect(result).toBeTruthy()
  })
  test('waitForAgentDeletion should return true', async () => {
    const result = await agentClient.waitForAgentDeletion('agentNotExists')
    expect(result).toBeTruthy()
  })
  test('getSkillIds should return skillIds', async () => {
    const skillIds = await agentClient.getSkillIds()
    console.log(skillIds)
    expect(skillIds.length).toBeGreaterThan(0)
  })
  test('getSkillNumbers should return skillNumbers', async () => {
    const skillNumbers = await agentClient.getSkillNumbers()
    expect(skillNumbers.length).toBeGreaterThan(0)
  })
  xtest('existsAgentByLoginId should return true when agent exists', async () => {
    const exists = await agentClient.existsAgentByLoginId(7300000100)
    expect(exists).toBeTruthy()
  })
  xtest('waitForAgentCreation should return true when agent exists', async () => {
    const exists = await agentClient.waitForAgentCreation(7300000100)
    expect(exists).toBeTruthy()
  })
  xtest('waitForAgentCreation should return false when agent does not exists', async () => {
    const exists = await agentClient.waitForAgentCreation(3337300000100)
    expect(exists).toBeFalsy()
  })
  test('existsAgentByUsername returns true when agent exists', async () => {
    const exists = await agentClient.existsAgentByUsername('agent2')
    expect(exists).toBeTruthy()
  })
  test('existsAgentByUsername returns false when agent does not exist', async () => {
    const exists = await agentClient.existsAgentByUsername('notexistagent')
    expect(exists).toBeFalsy()
  })
  xtest('existsStationForAgent should return false when agent has no station', async () => {
    const exists = await agentClient.existsStationForAgent('ddksgy3dnr')
    expect(exists).toBeFalsy()
  })
  test('getAgent should return agent if agent exists', async () => {
    const username = 'agent2'
    const agentAndStation = await agentClient.getAgent(username)
    expect(agentAndStation.username).toEqual(username)
  })

  test('getAgent should return undefined if agent does not exist', async () => {
    const username = 'notexistsagent2'
    const agentAndStation = await agentClient.getAgent(username)
    expect(agentAndStation).toBeUndefined()
  })

  test.only('createStationIfNotExists should return true', async () => {
    const result = await agentClient
      .createStationIfNotExists('agent2', '2')
      .catch(error => console.log(error))
    expect(result).toBeTruthy()
  }, 60000)
  test('getUserToken should return 400 for admin user', async () => {
    const result = await agentClient.getUserToken('yangadmin1').catch(error => {
      return error.response.status
    })
    expect(result).toEqual(400)
  })
  test('createDefaultSkill should return true.', async () => {
    const result = await agentClient.createDefaultSkill()
    expect(result).toBeTruthy()
  })
  test('fetchDefaultSkillNumber should return skillId', async () => {
    const result = await agentClient.fetchDefaultSkillNumber()
    console.log(`skillNumber of default skill = ${result}`)
    expect(result).toBeGreaterThan(100)
  })

  test('isDefaultSkillProvisioned should return false', async () => {
    const skillInWaiting = 102
    const result = await agentClient.isDefaultSkillProvisioned(skillInWaiting)
    expect(result).toBeFalsy()
  })

  test('waitForDefaultSkillCreation should return false when skill job stuck in waiting', async () => {
    const skillInWaiting = 102
    const exists = await agentClient.waitForDefaultSkillCreation(skillInWaiting)
    expect(exists).toBeFalsy()
  }, 60000)
})
