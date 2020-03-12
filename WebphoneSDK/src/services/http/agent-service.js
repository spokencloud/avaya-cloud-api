const apiPrefix = '/gateway'
let url = '/gateway/'

url = `http://localhost:9001${apiPrefix}/`

const axios = require('axios').default
const api = axios.create({
  baseURL: url,
  withCredentials: true
})

// Request interceptor
const onPreRequest = config => config
const onRequestError = error => Promise.reject(error)
api.interceptors.request.use(onPreRequest, onRequestError)

// Response interceptor
const onResponseSuccess = response => response
const onResponseError = error => Promise.reject(error)
api.interceptors.response.use(onResponseSuccess, onResponseError)

function normalizeAgentResponse (response) {
  console.log('response: ', response)
  let {
    data = []
  } = response || {}

  if (!Array.isArray(data)) {
    data = []
  }

  return data.map(data => {
    const {
      username = '',
      loginId = ''
    } = data || {}

    return {
      username,
      loginId
    }
  })
}

export function fetchAgentssBySubAccountId (subAccountId) {
  console.log('fetchAgentssBySubAccountId1: ')
  // return api.get(`spokenAbc/agents?clientId=${subAccountId}`)
  return api.get(`https://moon-admincenter.bpo.avaya.com/gateway/spokenAbc/agents?clientId=${subAccountId}`)
    .then(normalizeAgentResponse)
  // we had tested rest call using absolute path.
  // for this to work you need to have same agent login into moon in browser and in anather tab try login same agent locally and webscoket URL should be of moon
  // return api.get(`https://moon-admincenter.bpo.avaya.com/gateway/spokenAbc/agents?clientId=568018`)
  //  .then(normalizeAgentResponse)
}
