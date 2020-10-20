import { anyString, instance, mock, reset, spy, verify, when } from 'ts-mockito'
import { AgentClient } from '../src/AgentClient'
import { RestClient } from '../src/RestClient'

describe('AgentClient.ts', () => {
  let client: AgentClient
  beforeEach(() => {
    // Cast to any if mocking and not fulfilling the static type
    const restClient: any = RestClient as jest.Mock
    client = new AgentClient('1', 'MYA_MYARec', restClient)
  })
  test('createAgentAndStation throws an error given an invalid username', async () => {
    expect.assertions(1)
    expect(client.createAgentAndStation('a')).rejects.toEqual(
      'invalid username'
    )
  })
  test('createAgentAndStation throws an error when createDefaultSkill fails', async () => {
    const agentClientSpy = spy(client)
    // set up spy
    when(agentClientSpy.setDefaultSkillNumberIfNotExists()).thenResolve(false)

    expect.assertions(1)
    expect(client.createAgentAndStation('testuser')).rejects.toEqual(
      'Can not create default skill for agent creation.'
    )
  })

  test('generateAvayaPassword should return last 6 characters', () => {
    const actual = client.generateAvayaPassword('agentLoginId')
    expect(actual).toEqual('oginId')
  })
  test('generateAvayaPassword should return full string', () => {
    const actual = client.generateAvayaPassword('abc')
    expect(actual).toEqual('abc')
  })
  test('generateSecurityCode should return last 4 chars', () => {
    const actual = client.generateSecurityCode('securityCode')
    expect(actual).toEqual('Code')
  })
  test('generateSecurityCode should return all chars', () => {
    const actual = client.generateSecurityCode('abc')
    expect(actual).toEqual('abc')
  })
  test('stationExtension: { toString: () => any }', () => {
    const stationExtension: { toString: () => any } = 'hello world'
    expect(stationExtension.toString()).toEqual('hello world')
  })
  test('redo less than max retries should return true', async () => {
    const retries = 7
    const millis = 5
    let count = 0
    const callback = () => {
      count++
      if (count < 3) {
        return Promise.resolve(false)
      }
      return Promise.resolve(true)
    }
    const result = await client.redo(callback, retries, millis)
    expect(result).toBeTruthy()
  }, 10000)
  test('redo greater than max retries should return false', async () => {
    const retries = 3
    const millis = 5
    let count = 0
    const callback = () => {
      count++
      console.log(`callback count=${count}`)
      if (count < 10) {
        console.log(`callback if count=${count}`)
        return Promise.resolve(false)
      }
      console.log(`callback outside if count=${count}`)
      return Promise.resolve(true)
    }
    const result = await client.redo(callback, retries, millis)
    expect(result).toBeFalsy()
  })
  test('checkAgentPromise should return false', async () => {
    const result = await client.existsAgent(Promise.reject(true))
    expect(result).toBeFalsy()
  })
  test('checkAgentPromise should return true', async () => {
    const result = await client.existsAgent(Promise.resolve(true))
    expect(result).toBeTruthy()
  })
})
