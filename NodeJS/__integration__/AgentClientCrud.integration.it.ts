import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'
import { randomString } from '../src/Utils'

const rootLogger = Constants.log4js.getLogger()
rootLogger.level = 'debug'
const agentClientLogger = Constants.log4js.getLogger('AgentClient')
agentClientLogger.level = 'debug'
rootLogger.debug('Starting AgentClient Integration Test on integration env')
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
  const agentPassword = 'Passw0rd!'

  beforeEach(async () => {
    agentClient = await createAgentClient(
      'https://integration.bpo.avaya.com',
      token
    )
  })

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
      // const username = 'ddksgy3dnr' // randomString(10)
      const username = 'yangagent1' // randomString(10)

      const result = await agentClient.createAgentAndStation(
        username,
        agentPassword
      )
      console.log(result)
      expect(result.agent.username).toEqual(username)
      expect(result.agent.firstName).toEqual(Constants.AGENT_FIRST_NAME)
      expect(result.agent.lastName).toEqual(Constants.AGENT_LAST_NAME)
    },
    testTimeOut
  )

  test(
    'createAgent should accept optional first name and last name',
    async () => {
      const username = randomString(10)
      const firstName = 'FirstName_' + username
      const lastName = 'LastName_' + username
      const result = await agentClient.createAgentAndStation(
        username,
        agentPassword,
        firstName,
        lastName
      )
      console.log(result)
      expect(result.agent.username).toEqual(username)
      expect(result.agent.firstName).toEqual(firstName)
      expect(result.agent.lastName).toEqual(lastName)
    },
    testTimeOut
  )

  test(
    'createAgent should use the default first and last name if one of them is missing',
    async () => {
      const username = randomString(10)
      const name = 'Name_' + username
      const result = await agentClient.createAgentAndStation(
        username,
        agentPassword,
        name
      )
      console.log(result)
      expect(result.agent.username).toEqual(username)
      expect(result.agent.firstName).toEqual(Constants.AGENT_FIRST_NAME)
      expect(result.agent.lastName).toEqual(Constants.AGENT_LAST_NAME)
    },
    testTimeOut
  )

  test('fetchDefaultSkillNumber should return skillId', async () => {
    const result = await agentClient.fetchDefaultSkillNumber()
    console.log(`skillNumber of default skill = ${result}`)
    expect(result).toBeGreaterThan(100)
  })

  test(
    'deleteAgent',
    async () => {
      const result = await agentClient.deleteAgentAndStation('yangagent1')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )
})
