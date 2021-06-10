import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'

const rootLogger = Constants.log4js.getLogger()
rootLogger.level = 'debug'
const agentClientLogger = Constants.log4js.getLogger('AgentClient')
agentClientLogger.level = 'debug'
rootLogger.debug('Starting AgentClient Integration Test on dev1')
/**
 * using yangadmin account on dev1 to run integration test
 */
describe('AgentClient', () => {
  // yangadmin on dev1
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4iLCJpc3MiOiJBQkNfU0VDVVJJVFlfR0FURVdBWSJ9.JeoKBUkc6SsNBE70or0vqwuvhVkbyW7qfS5W0ivqfjQ'
  let agentClient: AgentClient
  // set timeout for tests that have to wait for agent and station jobs to complete
  const testTimeOut = 2 * Constants.MAX_RETRY * Constants.INTERVAL_IN_MILLIS

  beforeEach(async () => {
    agentClient = await createAgentClient('https://dev1.bpo.avaya.com', token)
  })

  test(
    'waitForAgentDeletion should return true',
    async () => {
      const result = await agentClient.waitForAgentDeletion('notexistagent')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )

  test.only(
    'createAgent',
    async () => {
      const username = 'abcagent1' // randomString(10)  ddksgy3dnr
      const result = await agentClient.createAgentAndStation(
        username,
        'Passw0rd!'
      )
      console.log(result)
      expect(result.agent.username).toEqual(username)
    },
    testTimeOut
  )

  test(
    'deleteAgent',
    async () => {
      const result = await agentClient.deleteAgentAndStation('abcagent1')
    },
    testTimeOut
  )
})
