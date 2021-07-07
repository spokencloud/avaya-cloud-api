import * as Constants from './Constants'
import { SkillPriority } from './models'
import { RestClient } from './RestClient'
import {
  isValidPassword,
  isValidUsername,
  sleep,
  isValidUrl,
  isTokenWellFormed
} from './Utils'

const logger = Constants.log4js.getLogger('AgentClient')

export class AgentClient {
  private restClient: RestClient
  private subAccountId: string
  private subAccountAppId: string
  private defaultSkillNumber: number

  constructor(
    subAccountId: string,
    subAccountAppId: string,
    restClient: RestClient
  ) {
    this.restClient = restClient
    this.subAccountId = subAccountId
    this.subAccountAppId = subAccountAppId
    this.defaultSkillNumber = -1
    logger.debug(
      `subAccountAppid=${subAccountAppId}; accountId = ${subAccountId}`
    )
  }

  public get SubAccountAppId(): string {
    return this.subAccountAppId
  }
  /**
   * @protected
   */
  public getDefaultSkillNumber() {
    return this.defaultSkillNumber
  }
  /**
   * Create Agent and Station. Upon success, returns agent object and station object
   * @param agentUsername min length 2, max length 20, must pass ^[-.@\w]+$
   * @param agentPassword min length 8, max length 32, must have a uppercase character, must have at least one lowercase char, no whitespace, must contains a number, must contain one of ~!@?#$%^&*_
   * @param firstName (optional) min length 2, max 16, must pass /^[a-zA-Z][a-zA-Z0-9_ .,'+]*$/
   * @param lastName (optional) min length 2, max 16, must pass /^[a-zA-Z][a-zA-Z0-9_ .,'+]*$/
   */
  public async createAgentAndStation(
    agentUsername: string,
    agentPassword: string,
    firstName?: string,
    lastName?: string
  ) {
    if (!isValidPassword(agentPassword)) {
      return Promise.reject('invalid password')
    }

    if (!isValidUsername(agentUsername)) {
      return Promise.reject('invalid username')
    }

    if (this.defaultSkillNumber === -1) {
      const success = await this.setDefaultSkillNumberIfNotExists()
      if (!success) {
        return Promise.reject(
          'Can not create default skill for agent creation.'
        )
      }
    }
    const skillsWithPriority: SkillPriority[] = [
      {
        skillNumber: this.defaultSkillNumber,
        skillPriority: Constants.DEFAULT_SKILL_PRIORITY
      }
    ]
    const agentStationGroupId = await this.restClient.getAgentStationGroupId(
      this.subAccountAppId
    )
    if (agentStationGroupId < 0) {
      throw new Error(
        `subAccount ${this.subAccountId} has no agent station group defined`
      )
    }

    await this.createUserIfNotExists(
      agentUsername,
      agentPassword,
      skillsWithPriority,
      agentStationGroupId,
      firstName,
      lastName
    )

    return this.getAgentAndStation(agentUsername)
  }
  /**
   * @protected
   */
  public async setDefaultSkillNumberIfNotExists(): Promise<boolean> {
    const defaultSkillNumber = await this.fetchDefaultSkillNumber()
    logger.debug(`defaultSkillNumber is ${defaultSkillNumber}`)
    if (!!defaultSkillNumber) {
      this.defaultSkillNumber = defaultSkillNumber
      return true
    } else {
      logger.debug('tring to create default skill')
      const skillNumber = await this.createDefaultSkill()
      this.defaultSkillNumber = skillNumber
      return await this.waitForDefaultSkillCreation(skillNumber)
    }
  }
  /**
   * @protected
   */
  public async createUserIfNotExists(
    agentUsername: string,
    agentPassword: string,
    skillsWithPriority: SkillPriority[],
    agentStationGroupId: string,
    firstName?: string,
    lastName?: string
  ) {
    const userExists = await this.existsAgentByUsername(agentUsername)
    if (userExists) {
      return Promise.resolve(true)
    }
    const agentLoginId = await this.restClient.getNextAvailableExtension(
      this.subAccountId,
      'AGENT'
    )
    if (agentLoginId < 0) {
      throw new Error(
        `subAccount ${this.subAccountId} has no available agent extension`
      )
    }

    await this.sendCreateAgentRequest(
      agentUsername,
      agentPassword,
      agentStationGroupId,
      agentLoginId,
      skillsWithPriority,
      firstName,
      lastName
    )
    return await this.waitForAgentCreation(agentLoginId)
  }
  /**
   * @protected
   */
  public async sendCreateAgentRequest(
    agentUsername: string,
    agentPassword: string,
    agentStationGroupId: any,
    agentLoginId: any,
    skillsWithPriority: SkillPriority[],
    firstname?: string,
    lastname?: string
  ) {
    const securityCode = this.generateSecurityCode(agentLoginId)
    const avayaPassword = this.generateAvayaPassword(agentLoginId)
    if (!firstname || !lastname) {
      firstname = Constants.AGENT_FIRST_NAME
      lastname = Constants.AGENT_LAST_NAME
    }
    const agent = {
      username: agentUsername,
      firstName: firstname,
      lastName: lastname,
      password: agentPassword,
      loginId: agentLoginId,
      agentStationGroupId,
      securityCode,
      startDate: '2019-03-21',
      endDate: '2038-01-01',
      avayaPassword,
      clientId: this.subAccountId,
      agentSkills: skillsWithPriority,
      // no supervisors
      supervisorId: 0,
      // channel 1 is voice
      channelIds: [1]
    }

    return this.restClient.createAgentJob(agent)
  }

  /**
   * @protected
   */
  public generateAvayaPassword(agentLoginId: { toString: () => any }) {
    const agentLoginIdString = agentLoginId.toString()
    const length = agentLoginIdString.length
    // substring(starting_index, ending_index), negative starting_index is treated as 0
    return agentLoginIdString.substring(length - 6, length)
  }

  /**
   * @protected
   */
  public generateSecurityCode(agentLoginId: { toString: () => any }) {
    const agentLoginIdString = agentLoginId.toString()
    const length = agentLoginIdString.length
    // substring(starting_index, ending_index), negative starting_index is treated as 0
    return agentLoginIdString.substring(length - 4, length)
  }

  /**
   * @protected
   */
  public getSkillIds(): Promise<[]> {
    return this.restClient
      .getSubAccountAgentSkills(this.subAccountId)
      .then((skillResponses: any) => {
        logger.debug(skillResponses)
        if (skillResponses) {
          return skillResponses.map(
            (skillResponse: { id: any }) => skillResponse.id
          )
        } else {
          return []
        }
      })
  }

  /**
   * @protected
   */
  public fetchDefaultSkillNumber(): Promise<number | undefined> {
    return this.restClient
      .getSubAccountAgentSkills(this.subAccountAppId)
      .then((response: any) => {
        logger.debug(response.data)

        const defaultSkill = response.data.find(
          (skillResponse: { skillNumber: number; name: string }) =>
            skillResponse.name === Constants.DEFAULT_SKILL_NAME
        )
        return defaultSkill?.skillNumber
      })
  }

  /**
   * @protected
   */
  public isDefaultSkillProvisioned(skillNumber: number): Promise<boolean> {
    return this.restClient.getSkillV2(skillNumber).then((response: any) => {
      logger.debug(response.data.status)
      return response.data.status === 'COMPLETED'
    })
  }

  /**
   * @protected
   */
  public async createDefaultSkill(): Promise<number> {
    const skillExtensionNumber = await this.restClient.getNextAvailableNumber(
      this.subAccountId,
      'SKILL'
    )
    if (skillExtensionNumber < 0) {
      return Promise.reject(false)
    }
    const skillRequest = {
      name: Constants.DEFAULT_SKILL_NAME,
      skillNumber: skillExtensionNumber,
      subAccountAppId: this.subAccountAppId,
      acwInterval: null,
      slaInSeconds: null,
      slaPercentage: null,
      announcementExtension: null,
      redirectOnNoAnswerRings: null,
      chatDigitalChannelsEnabled: false,
      emailDigitalChannelsEnabled: false,
      smsDigitalChannelsEnabled: false,
      dispositionSetId: ''
    }
    logger.debug(
      `creating default skill with payload ${JSON.stringify(skillRequest)}`
    )
    const result = await this.restClient.createSkillV2(skillRequest)
    if (result === 200) {
      return skillExtensionNumber
    }
    throw new Error(`Failed to create default skill error is ${-result}`)
  }

  /**
   * retrieve agent skills in {skillName:string, skillNumber:number}[]
   * @protected
   */
  public async getSkillNumbers(): Promise<
    Array<{ skillName: string; skillNumber: number }>
  > {
    return await this.restClient
      .getSubAccountAgentSkills(this.subAccountAppId)
      .then((skillResponses: any) => {
        const availableSkills = []
        for (const skill of skillResponses) {
          const skillInfo = {
            skillNumber: skill.number,
            skillName: skill.name
          }
          availableSkills.push(skillInfo)
        }
        logger.debug(availableSkills)
        return availableSkills
      })
  }

  /**
   * @protected
   */
  public async getAgent(agentUsername: string) {
    return this.restClient
      .getAgentByUsername(agentUsername)
      .then(agent => agent)
      .catch(error => undefined)
  }

  /**
   * @protected
   */
  public async getAgentAndStation(agentUsername: string) {
    const agent = await this.getAgent(agentUsername)
    // for backwards-compatibility
    const station = agent.station
    return { agent: agent || {}, station: station || {} }
  }

  /**
   * @protected
   */
  public existsAgentByLoginId(loginId: number) {
    const promise = this.restClient.getAgentByLoginId(loginId)
    return this.existsAgent(promise)
  }

  /**
   * @protected
   */

  public existsAgentByUsername(username: string) {
    const promise = this.restClient.getAgentByUsername(username)
    return this.existsAgent(promise)
  }

  /**
   * @protected
   */

  public existsAgent(promise: Promise<any>): Promise<boolean> {
    return promise
      .then(agent => {
        return true
      })
      .catch(error => {
        return false
      })
  }

  /**
   * redo action, as a callback function, a number of times
   * @param callback need to always resolve to either true or false
   * @param retries max number of retries
   * @param millis time to sleep before retry
   * @protected
   */
  public async redo(
    callback: () => Promise<boolean>,
    retries: number,
    millis: number
  ) {
    logger.debug(`entering redo ${retries}`)
    for (let count = 0; count < retries; count++) {
      const result = await callback()
      logger.debug(`redo count=${count}; result=${result}`)
      if (result) {
        logger.debug('result is true exiting redo...')
        return true
      }
      await sleep(millis)
    }
    return false
  }

  /**
   * @protected
   */
  public async waitForAgentCreation(loginId: number) {
    const callback = () => {
      return this.existsAgentByLoginId(loginId)
    }
    return this.repeat(callback)
  }

  /**
   * @protected
   */
  public async waitForAgentDeletion(agentUsername: string) {
    const callback = () => {
      return this.existsAgentByUsername(agentUsername).then(result => !result)
    }
    return this.repeat(callback)
  }

  /**
   * @protected
   */
  public async waitForDefaultSkillCreation(
    skillNumber: number
  ): Promise<boolean> {
    const callback = () => {
      return this.isDefaultSkillProvisioned(skillNumber)
    }
    return this.repeat(callback)
  }
  /**
   * delete agent and station
   * @param agentUsername username of agent
   */
  public async deleteAgentAndStation(agentUsername: string) {
    const agent = await this.getAgent(agentUsername)
    if (!agent) {
      return true
    }
    const submitted = await this.restClient.requestAgentDeletion(
      agentUsername,
      agent.loginId
    )
    if (submitted) {
      return await this.waitForAgentDeletion(agentUsername)
    }
    return false
  }
  public async getUserToken(username: string) {
    return await this.restClient.getUserToken(username)
  }

  private async repeat(callback: () => Promise<boolean>) {
    return this.redo(
      callback,
      Constants.MAX_RETRY,
      Constants.INTERVAL_IN_MILLIS
    )
  }
}
/**
 * @protected
 */
async function createInstance(restClient: RestClient) {
  const result = await restClient.getSubAccountIdAndAppId()
  return new AgentClient(result.id, result.appId, restClient)
}

export async function createAgentClient(
  endpoint: string,
  apiKey: string
): Promise<AgentClient> {
  if (!isValidUrl(endpoint)) {
    return Promise.reject('invalid endpoint')
  }

  if (!isTokenWellFormed(apiKey)) {
    return Promise.reject('invalid api key')
  }

  const restClient = new RestClient(endpoint, apiKey)
  return await createInstance(restClient)
}
