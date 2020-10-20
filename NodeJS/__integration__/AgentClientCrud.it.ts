import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'

/**
 * For tests to run successfully, abc stack is needed locally:
 *  gateway, ac, ac-ui(optional) cluster-api, provisioner, locates, legacy, rtds, db, redis.
 * Also subaccount admin user "yangsubadmin1" should be created via ac with provisioner role and sub admin role
 * This user should have a subaccount assigned and an agent group created.
 * Subaccount needs to have large enough ranges assigned for agent and skill respectively.
 * An agentStationGroup with id agentGroup defined in code should exist for the subaccount
 *
 */
describe('AgentClient', () => {
  // yangadmin1
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nc3ViYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.as7iFmBnNx9mR9xwIUzpYNKdrHjtZhVBijoLWHRvwao'
  let agentClient: AgentClient
  // set timeout for tests that have to wait for agent and station jobs to complete
  const testTimeOut = 5 * Constants.MAX_RETRY * Constants.INTERVAL_IN_MILLIS
  const agentGroup = '3'
  beforeEach(async () => {
    agentClient = await createAgentClient('http://localhost:8081', token)
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
      const result = await agentClient.createAgentAndStation(username)
      console.log(result)
      expect(result.agent.username).toEqual(username)
    },
    testTimeOut
  )
  // agent must exists for create station to succeed.
  xtest('createStationIfNotExists should return true', async () => {
    const result = await agentClient.createStationIfNotExists(
      'ddksgy3dnr',
      agentGroup
    )
    expect(result).toBeTruthy()
  })
  test.only(
    'deleteAgent',
    async () => {
      const result = await agentClient.deleteAgentAndStation('ddksgy3dnr')
      expect(result).toBeTruthy()
    },
    testTimeOut
  )
})
