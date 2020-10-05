import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'

const rootLogger = Constants.log4js.getLogger()
rootLogger.level = 'debug'
const agentClientLogger = Constants.log4js.getLogger('AgentClient')
agentClientLogger.level = 'debug'
rootLogger.debug('Starting AgentClient Integration Test on dev1')
/**
 * using yangadmin account on integration to run integration test
 */
describe('AgentClient', () => {
  // yangadmin on integration
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4iLCJpc3MiOiJBQkNfU0VDVVJJVFlfR0FURVdBWSJ9.JeoKBUkc6SsNBE70or0vqwuvhVkbyW7qfS5W0ivqfjQ'
  let agentClient: AgentClient
  // set timeout for tests that have to wait for agent and station jobs to complete
  const testTimeOut = 4 * Constants.MAX_RETRY * Constants.INTERVAL_IN_MILLIS

  beforeEach(async () => {
    agentClient = await createAgentClient(
      'https://integration.bpo.avaya.com',
      token
    )
  })

  test(
    'waitForStationDeletion should return true',
    async () => {
      const result = await agentClient.waitForStationDeletion('nonExistAgent1')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )

  test(
    'waitForAgentDeletion should return true',
    async () => {
      const result = await agentClient.waitForAgentDeletion('notexistagent')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )

  test(
    'createAgent',
    async () => {
      const username = 'ddksgy3dnr' // randomString(10)
      const result = await agentClient.createAgentAndStation(
        username,
        'Passw0rd!'
      )
      console.log(result)
      expect(result.agent.username).toEqual(username)
    },
    testTimeOut
  )

  test.only('fetchDefaultSkillNumber should return skillId', async () => {
    const result = await agentClient.fetchDefaultSkillNumber()
    console.log(`skillNumber of default skill = ${result}`)
    expect(result).toBeGreaterThan(100)
  })

  test('createStationIfNotExists should return true', async () => {
    const result = await agentClient.createStationIfNotExists('ddksgy3dnr', '2')
    expect(result).toBeTruthy()
  })
  test(
    'deleteAgent',
    async () => {
      const result = await agentClient.deleteAgentAndStation('ddksgy3dnr')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )
})
