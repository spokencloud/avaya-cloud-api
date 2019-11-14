const axios = require('axios').default;
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
const tough = require('tough-cookie');
const lodash = require('lodash')

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

  async login() {
    await this.createLoginRequest()
    let questionResponse = await this.createQuestionRequest()
    await this.createQuestionAnswerRequest(questionResponse.data)
  }

  async get(path) {
    return this.axios_instance.get(path)
  }

  async post(path, body) {
    return this.axios_instance.post(path, body)
  }

  async delete(path) {
    return this.axios_instance.delete(path)
  }

  async put(path, body) {
    return this.axios_instance.put(path, body)
  }

  async getSubAccount() {
    return this.axios_instance.get('/user')
      .then(response => {
        let accessibleSubAccounts = response.data['accessibleClients']
        // ensure we always get the same subAccount ordering
        accessibleSubAccounts = lodash.sortBy(accessibleSubAccounts, ['id'])
        let subAccount = accessibleSubAccounts[0]
        return subAccount
      })
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


