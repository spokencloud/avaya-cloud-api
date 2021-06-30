import { SkillCreateRequest } from '../src'
import * as Constants from '../src/Constants'
import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from '../src/RestClient'

const rootLogger = Constants.log4js.getLogger()
rootLogger.level = 'debug'
const restClientLogger = Constants.log4js.getLogger('RestClient')
restClientLogger.level = 'debug'
restClientLogger.debug('Starting RestClientAgent Integration Test on local')

describe('RestClientAgent.ts integration test', () => {
  // yangadmin1
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY'
  let restClient: RestClient
  beforeEach(() => {
    restClient = new RestClient('http://localhost:8081', token)
  })

  test('getUserToken should retreive token ', async () => {
    const userToken = await restClient.getUserToken('yangadmin1')
    expect(userToken).toEqual(token)
  })
  test('getAndStoreUserStoken should store user token', async () => {
    await restClient.getAndStoreUserToken('yangadmin1')
    expect(restClient.credentials.has('yangadmin1')).toBeTruthy()
    const { token: userToken } = restClient.credentials.get('yangadmin1') || {
      token: ''
    }
    expect(userToken).toEqual(token)
  })
  test('getAgentStationGroupId should return id if station groups exist', async () => {
    const subAccountAppIdWithAgentGroups = 'MYA_MYARec'
    const id = await restClient.getAgentStationGroupId(
      subAccountAppIdWithAgentGroups
    )
    expect(id).toBeGreaterThan(0)
  })
  test('getAgentStationGroupId should return STATION_GROUP_ID_NOT_EXISTS if no station groups exist', async () => {
    const subAccountAppIdWithoutAgentStationGroups = 'GRO_GRORec'
    const id = await restClient.getAgentStationGroupId(
      subAccountAppIdWithoutAgentStationGroups
    )
    expect(id).toEqual(STATION_GROUP_ID_NOT_EXISTS)
  })
  test('getAgentStationGroupId should return -404 if no station groups exist', async () => {
    const subAccountAppIdNotExists = 'app_id_not_exist'
    const id = await restClient.getAgentStationGroupId(subAccountAppIdNotExists)
    expect(id).toEqual(-404)
  })
  test('getSubAccount should return first subaccount', async () => {
    const subaccount = await restClient.getSubAccount()
    expect(subaccount.id).toEqual(1)
  })
  test('getAgentByUsername should return agent', async () => {
    const username = 'super1'
    const agent = await restClient.getAgentByUsername(username)
    console.log(agent)
    expect(agent.username).toEqual(username)
  }, 10000)

  test('getAgentByUsername should return 404 if username does not exist', async () => {
    const username = 'notexist'
    const agent = await restClient
      .getAgentByUsername(username)
      .catch((error: any) => {
        return error.response.status
      })
    console.log(agent)
    expect(agent).toEqual(404)
  }, 10000)
  test('requestAgentDeletion should return false if agent1 can not be deleted', async () => {
    const username = 'agent1'
    const submitted = await restClient.requestAgentDeletion(
      username,
      '7300001102'
    )
    expect(submitted).toBeFalsy()
  })
  test('getAgentByLoginId return undefined when not found', async () => {
    const loginId = 1
    const submitted = await restClient
      .getAgentByLoginId(loginId)
      .catch(error => {
        return error.response.status
      })
    expect(submitted).toEqual(404)
  })
  test('getAgentByLoginId return agent', async () => {
    const loginId = 7300001101
    const submitted = await restClient.getAgentByLoginId(loginId)
    expect(submitted).toBeDefined()
    expect(submitted.loginId).toEqual(loginId.toString())
  })

  test('getSubAccountAgentSkills should return skills', async () => {
    // make sure client has some skills defined
    const skills = await restClient.getSubAccountAgentSkills('2')
    expect(skills.data.skillResponses['2']).toBeDefined()
  })
  test('getSubAccountAgentSkills should return empty skills', async () => {
    // make sure client does not have skills
    const skills = await restClient.getSubAccountAgentSkills('22')
    expect(skills.data.skillResponses['2']).toBeUndefined()
  })
  xtest('requestAgentDeletion should return false if ddksgy3dnr can not be deleted', async () => {
    const username = 'ddksgy3dnr'
    const submitted = await restClient.requestAgentDeletion(
      username,
      '7300000100'
    )
    expect(submitted).toBeTruthy()
  })

  test('createSkillV2 with unavailable extension number should fail', async () => {
    const skillCreateRequest: SkillCreateRequest = {
      name: 'survey',
      skillNumber: 1030,
      subAccountAppId: 'MYA_MYARec',
      acwInterval: null,
      slaInSeconds: null,
      slaPercentage: null,
      announcementExtension: null,
      redirectOnNoAnswerRings: null,
      chatDigitalChannelsEnabled: null,
      emailDigitalChannelsEnabled: null,
      smsDigitalChannelsEnabled: null
    }
    const submitted = await restClient.createSkillV2(skillCreateRequest)
    expect(submitted).toEqual(-500)
  })

  test('getNextAvailableExtension for agent', async () => {
    const submitted = await restClient.getNextAvailableExtension('1', 'AGENT')
    console.log(submitted)
    expect(submitted).toBeDefined()
  })

  test('getNextAvailableExtension concurrent calls should return different values', async () => {
    const submitted1 = restClient.getNextAvailableExtension('1', 'AGENT')
    const submitted2 = restClient.getNextAvailableExtension('1', 'AGENT')
    const submitted3 = restClient.getNextAvailableExtension('1', 'AGENT')

    const [loginId1, loginId2, loginId3] = await Promise.all([
      submitted1,
      submitted2,
      submitted3
    ]).then(([value1, value2, value3]) => {
      return [value1, value2, value3]
    })
    console.log(loginId1, loginId2, loginId3)
    expect(loginId1).toBeDefined()
    expect(loginId1).not.toEqual(loginId2)
    expect(loginId1).not.toEqual(loginId3)
    expect(loginId2).not.toEqual(loginId3)
  })

  test('getNextAvailableExtension for skill called correctly.', async () => {
    const submitted = await restClient.getNextAvailableNumber('1', 'SKILL')
    console.log(submitted)
    expect(submitted).toBeDefined()
  })
  /*
   * Number needs to be in reserved state for this to work. Reserve number via AC or call
   * getNextAvaialbeNumber()
   */
  test('createSkillV2 with reserved extension should work.', async () => {
    const reservedNumber = 103
    const skillCreateRequest: SkillCreateRequest = {
      name: 'DEFAULT_SKILL',
      /* needs to be reserved before hand */
      skillNumber: reservedNumber,
      subAccountAppId: 'MYA_MYARec',
      acwInterval: null,
      slaInSeconds: null,
      slaPercentage: null,
      announcementExtension: null,
      redirectOnNoAnswerRings: null,
      chatDigitalChannelsEnabled: null,
      emailDigitalChannelsEnabled: null,
      smsDigitalChannelsEnabled: null
    }
    const submitted = await restClient.createSkillV2(skillCreateRequest)
    expect(submitted).toBe(200)
  })
})
