import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'

/**
 * For tests to run successfully, abc stack, gateway, ac, cluster api, vp, db, redis need to run locally.
 * Also admin user "yangadmin1" should be created via ac
 * A subaccount should exist for user "yangadmin1"
 * A skill with number 100 should exist in the subaccount
 * An agentStationGroup with id 2 should exist in the subaccount
 *
 */
describe('AgentClient', () => {
   // yangadmin1
   const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY'
   let agentClient: AgentClient
   // set timeout for tests that have to wait for agent and station jobs to complete
   const testTimeOut = 2 * Constants.MAX_RETRY * Constants.INTERVAL_IN_MILLIS

   beforeEach(async () => {
      agentClient = await createAgentClient('http://localhost:8081', token)
   })

   test('waitForStationDeletion should return true', async () => {
      const result = await agentClient.waitForStationDeletion('nonExistAgent1')
      expect(result).toBeTruthy()
   }, testTimeOut)

   test('waitForAgentDeletion should return true', async () => {
      const result = await agentClient.waitForAgentDeletion('notexistagent')
      expect(result).toBeTruthy()
   }, testTimeOut)

   test('createAgent', async () => {
      const username = 'ddksgy3dnr' // randomString(10)
      const result = await agentClient.createAgentAndStation(username, 'Passw0rd!')
      console.log(result)
      expect(result.agent.username).toEqual(username)
   }, testTimeOut)

   test('createStationIfNotExists should return true', async () => {
      const result = await agentClient.createStationIfNotExists('ddksgy3dnr', '2')
      expect(result).toBeTruthy()
   })
   test('deleteAgent', async () => {
      const result = await agentClient.deleteAgentAndStation('ddksgy3dnr')
      expect(result).toBeTruthy()
   }, testTimeOut)
})