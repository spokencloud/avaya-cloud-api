const axios = require('axios').default;
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
// const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const lodash = require('lodash')

const STATION_NAME = 'generated station'
const AGENT_FIRST_NAME = 'generated'
const AGENT_LAST_NAME = 'agent'
// ten seconds
const INTERVAL_IN_MILLIS = 10 * 1000
const MAX_RETRY = 5

class Session {

  constructor(axios_instance, admin_username, admin_password) {
    this.axios_instance = axios_instance;
    this.admin_username = admin_username;
    this.admin_password = admin_password;
  }

  async createLoginRequest() {
    return this.axios_instance.post(
      '/login?username=' + this.admin_username
      + '&password=' + this.admin_password)
      .then(result => {
        // console.log(result)
        return result
      })
  }

  async createQuestionRequest() {
    return this.axios_instance.get('/question/answer')
      .then(result => {
        // console.log(result)
        return result
      })
  }

  getAnswer(rawQuestion) {
    let words = rawQuestion.split(' ')
    let answer = words[words.length - 1].split('?')[0]
    return answer
  }

  async createQuestionAnswerRequest(questionContainer) {
    let questions = questionContainer['questions']

    let answers = []

    answers[0] = this.getAnswer(questions[0])
    answers[1] = this.getAnswer(questions[1])
    answers[2] = this.getAnswer(questions[2])

    let questionAnswer =
      {"username":this.admin_username,
        "questionAnswerPairs":
          [{"question":questions[0],"answer":answers[0]},
            {"question":questions[1],"answer":answers[1]},
            {"question":questions[2],"answer":answers[2]}]}

    return this.axios_instance.post('/user/question/answer', questionAnswer)
      .then(result => {
        return result
      })
  }

  async createTestGetRequest() {
    return await this.axios_instance.get('/spokenAbc/ac/tenants')
      .then(response => {
        console.log(response);
        return response
      })
  }

  async createTestLoginRequest() {
    this.createLoginRequest()
      .then(() => this.createQuestionRequest())
      .then(response => this.createQuestionAnswerRequest(response.data))
      .then(() => this.getStationOnly(10, 'AAA_ag4'))
      .catch(error => console.error(error))
  }

  async createAgent(agent_username, agent_password) {
    await this.createLoginRequest()
    let questionResponse = await this.createQuestionRequest()
    await this.createQuestionAnswerRequest(questionResponse.data)
    let subAccountId = await this.getSubAccountId()
    let agentStationGroupId = await this.getAgentStationGroupId(subAccountId)
    let agentLoginId = await this.generateExtension(subAccountId, 'AGENT')
    let skillIds = await this.getSkillIds(subAccountId)
    await this.sendCreateAgentRequest(
      subAccountId,
      agent_username,
      agent_password,
      agentStationGroupId,
      agentLoginId,
      skillIds
    )

    // wait until agent is created
    await this.waitForAgentCreation(agent_username)

    let stationExtension = await this.generateExtension(subAccountId, 'STATION')
    await this.sendCreateStationRequest(
      agentStationGroupId,
      subAccountId,
      stationExtension,
      agent_username
    )

    // wait until station is created
    await this.waitForStationCreation(subAccountId, agent_username)

    return this.getAgent(agent_username)
  }

  async getSubAccountId() {
    return this.axios_instance.get('/user')
      .then(response => {
        let accessibleSubAccounts = response.data['accessibleClients']
        // ensure we always get the same subAccount ordering
        accessibleSubAccounts = lodash.sortBy(accessibleSubAccounts, ['id'])
        let subAccountId = accessibleSubAccounts[0].id
        return subAccountId
      })
  }

  async getAgentStationGroupId(subAccountId) {
    return this.axios_instance.get('/spokenAbc/agentStationGroups/client/' + subAccountId)
      .then(response => {
        let agentStationGroups = response.data
        // ensure we always get the same subAccount ordering
        agentStationGroups = lodash.sortBy(agentStationGroups, ['id'])
        let agentStationGroupId = agentStationGroups[0].id
        return agentStationGroupId
      })
  }

  async sendCreateAgentRequest(
    subAccountId,
    agent_username,
    agent_password,
    agentStationGroupId,
    agentLoginId,
    skillIds) {

    let securityCode = this.generateSecurityCode(agentLoginId)
    let avayaPassword = this.generateAvayaPassword(agentLoginId)

    let agent = {
      "username": agent_username,
      "firstName": AGENT_FIRST_NAME,
      "lastName": AGENT_LAST_NAME,
      "password": agent_password,
      "loginId": agentLoginId,
      "agentStationGroupId": agentStationGroupId,
      "securityCode": securityCode,
      "startDate": "2019-03-21",
      "endDate": "2038-01-01",
      "avayaPassword": avayaPassword,
      "clientId": subAccountId,
      "skillIds": skillIds,
      // no supervisors
      "supervisorId": 0,
      // channel 1 is voice
      "channelIds": [1]
    }

    return this.axios_instance.post('/spokenAbc/jobs/agents', agent)
      .then(result => {
        return result
      })
  }

  generateAvayaPassword(agentLoginId) {
    let agentLoginIdString = agentLoginId.toString()
    let length = agentLoginIdString.length
    let result = agentLoginIdString.substring(length - 6, length)
    return result
  }

  generateSecurityCode(agentLoginId) {
    let agentLoginIdString = agentLoginId.toString()
    let length = agentLoginIdString.length
    let result = agentLoginIdString.substring(length - 4, length)
    return result
  }

  async generateExtension(subAccountId, type) {
    return this.axios_instance.post(
      'spokenAbc/extensions/next/' + subAccountId + '/type/' + type)
      .then(response => {
        return response.data
      })
  }

  async getSkillIds(subAccountId) {
    return this.axios_instance.get(
      'spokenAbc/skills/multiClientSkills?clientIds=' + subAccountId + '&skillType=AGENT')
      .then(response => {
        // console.log(response)
        let skillResponses = response.data['skillResponses'][subAccountId]
        let skillIds = skillResponses.map(skillResponse => skillResponse.id)
        return skillIds
      })
  }

  async sendCreateStationRequest(
    agentStationGroupId,
    subAccountId,
    stationExtension,
    agentUsername
    ) {

    let securityCode = this.generateSecurityCode(stationExtension)

    let station = {
      "agentStationGroupId": agentStationGroupId,
      "clientId": subAccountId,
      "extension": stationExtension,
      "name": STATION_NAME,
      "securityCode": securityCode,
      "username": agentUsername
    }

    return this.axios_instance.post('/spokenAbc/jobs/stations', station)
      .then(result => {
        // console.log(result.data)
        return result
      })
  }

  async getAgent(agentUsername) {
    await this.createLoginRequest()
    let questionResponse = await this.createQuestionRequest()
    await this.createQuestionAnswerRequest(questionResponse.data)

    let agent = {}
    try {
      agent = await this.getAgentOnly(agentUsername)
    } catch (e) {
      if (e.response.status === 404) {
        console.log('agent ' + agentUsername + ' not found')
      } else {
        throw e
      }
    }

    let subAccountId = await this.getSubAccountId()
    let station = {}
    try {
      station = await this.getStationOnly(subAccountId, agentUsername)
      if (!station) {
        console.log('station associated with ' + agentUsername + ' not found')
        station = {}
      }
    } catch (e) {
      if (e.response.status === 404) {
        console.log('station associated with ' + agentUsername + ' not found')
      } else {
        throw e
      }
    }

    return {'agent':agent, 'station': station}
  }

  async getAgentOnly(agent_username) {
    return this.axios_instance.get('/spokenAbc/agents/username/' + agent_username)
      .then(response => {
        // console.log(response.data)
        return response.data
      })
  }

  async waitForAgentCreation(agent_username) {
    return new Promise((resolve, reject) => {
      process.stdout.write("Creating agent.")
      let counter = 0
      const intervalId = setInterval(async () => {
        try {
          await this.getAgentOnly(agent_username)
          console.log('agent created');
          clearInterval(intervalId);
          resolve()
        } catch (e) {
          if (e.response.status === 404) {
            process.stdout.write('.')
            counter++
            if (counter > MAX_RETRY) {
              console.log()
              clearInterval(intervalId);
              reject(Error('agent creation failed'))
            }
          } else {
            console.log(e)
            throw e
          }
        }
      }, INTERVAL_IN_MILLIS);
      return intervalId
    })
  }

  async waitForAgentDeletion(agent_username) {
    return new Promise((resolve, reject) => {
      process.stdout.write("Deleting agent.")
      let counter = 0
      const intervalId = setInterval(async () => {
        try {
          await this.getAgentOnly(agent_username)
          process.stdout.write('.')
          counter++
          if (counter > MAX_RETRY) {
            console.log()
            clearInterval(intervalId);
            reject(Error('agent deletion failed'))
          }
        } catch (e) {
          if (e.response.status === 404) {
            console.log('agent deleted');
            clearInterval(intervalId);
            resolve()
          } else {
            console.log(e)
            throw e
          }
        }
      }, INTERVAL_IN_MILLIS);
      return intervalId
    })
  }

  async waitForStationCreation(subAccountId, agent_username) {
    return new Promise((resolve, reject) => {
      process.stdout.write("Creating station.")
      let counter = 0
      const intervalId = setInterval(async () => {
        try {
          let station = await this.getStationOnly(subAccountId, agent_username)
          if (station) {
            console.log('station created');
            clearInterval(intervalId);
            resolve()
          } else {
            process.stdout.write('.')
            counter++
            if (counter > MAX_RETRY) {
              console.log()
              clearInterval(intervalId);
              reject(Error('station creation failed'))
            }
          }
        } catch (e) {
          if (e.response.status === 404) {
            process.stdout.write('.')
            counter++
            if (counter > MAX_RETRY) {
              console.log()
              clearInterval(intervalId);
              reject(Error('station creation failed'))
            }
          } else {
            console.log(e)
            throw e
          }
        }
      }, INTERVAL_IN_MILLIS);
      return intervalId
    })
  }

  async waitForStationDeletion(subAccountId, agent_username) {
    return new Promise((resolve, reject) => {
      process.stdout.write("Deleting station.")
      let counter = 0
      const intervalId = setInterval(async () => {
        try {
          let station = await this.getStationOnly(subAccountId, agent_username)
          if (station) {
            process.stdout.write('.')
            counter++
            if (counter > MAX_RETRY) {
              console.log()
              clearInterval(intervalId);
              reject(Error('station deletion failed'))
            }
          } else {
            console.log('station deleted');
            clearInterval(intervalId);
            resolve()
          }
        } catch (e) {
          if (e.response.status === 404) {
            console.log('station deleted');
            clearInterval(intervalId);
            resolve()
          } else {
            console.log(e)
            throw e
          }
        }
      }, INTERVAL_IN_MILLIS);
      return intervalId
    })
  }

  async getStationOnly(subAccountId, agent_username) {
    return this.axios_instance.get('/spokenAbc/stations?clientId=' + subAccountId)
      .then(result => {
        const desiredStation = result.data.find(element => element.username === agent_username);
        return desiredStation
      })
  }

  async deleteAgent(agentUsername) {
    await this.createLoginRequest()
    let questionResponse = await this.createQuestionRequest()
    await this.createQuestionAnswerRequest(questionResponse.data)
    let subAccountId = await this.getSubAccountId()

    let station = await this.getStationOnly(subAccountId, agentUsername)
    // station might have been deleted before, so station might be undefined
    if (station) {
      await this.deleteStationOnly(station.id)
      await this.waitForStationDeletion(subAccountId, agentUsername)
    } else {
      console.log('station associated with ' + agentUsername + ' has already been deleted')
    }

    try {
      let agent = await this.getAgentOnly(agentUsername)
      await this.deleteAgentOnly(agentUsername, agent.loginId)
      await this.waitForAgentDeletion(agentUsername)
    } catch (e) {
      if (e.response.status === 404) {
        console.log('agent ' + agentUsername + ' has already been deleted')
      } else {
        throw e
      }
    }
  }

  async deleteStationOnly(stationId) {
    return this.axios_instance.delete('/spokenAbc/jobs/stations/' + stationId)
  }

  async deleteAgentOnly(agentUsername, agentLoginId) {
    let deleteRequest = {'username': agentUsername, 'loginId': agentLoginId}
    return this.axios_instance.post('/spokenAbc/agents/removeAgent', deleteRequest)
  }
}

axiosCookieJarSupport(axios);
function createAxiosInstance(endpoint) {
  const cookieJar = new tough.CookieJar();
  const instance = axios.create({
    baseURL: endpoint,
    withCredentials: true,
    jar: cookieJar,
  });
  return instance
}

module.exports = {
  createSession: (endpoint, admin_username, admin_password) => {
    let axiosInstance = createAxiosInstance(endpoint);

    let session = new Session(axiosInstance, admin_username, admin_password)

    return session
  }
}


