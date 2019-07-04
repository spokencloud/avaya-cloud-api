const Session = require('./session')
const AgentClient = require('./AgentClient')
const args = require('minimist')(process.argv.slice(2))

ENDPOINT_KEY = 'endpoint'
ADMIN_USERNAME_KEY = 'admin_username'
ADMIN_PASSWORD_KEY = 'admin_password'
AGENT_USERNAME_KEY = 'agent_username'
AGENT_PASSWORD_KEY = 'agent_password'

REPLACE_REGEX = /'/g
EMPTY_STRING = ""

let endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let agentUsername = args[AGENT_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let agentPassword = args[AGENT_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);

function isValidParameter(key, parameter) {
  if (parameter === undefined) {
    console.log(key + ' was undefined')
    return false
  } else {
    return true
  }
}

let isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint)
let isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername)
let isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword)
let isAgentUsernameValid = isValidParameter(AGENT_USERNAME_KEY, agentUsername)
let isAgentPasswordValid = isValidParameter(AGENT_PASSWORD_KEY, agentPassword)

if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid ||
    !isAgentUsernameValid ||
    !isAgentPasswordValid) {
  process.exit()
}

let session = Session.createSession(endpoint, adminUsername, adminPassword)
let agentClient = AgentClient.createAgentClient(session)

async function createAgent() {
  try {
    let agentObject = await agentClient.createAgent(agentUsername, agentPassword)
    console.log('agentObject from createAgent')
    console.log(agentObject)
  } catch (e) {
    console.error(e)
  }
}

async function getAgent() {
  try {
    let agentObject = await agentClient.getAgent(agentUsername)
    console.log('agentObject from getAgent')
    console.log(agentObject)
  } catch (e) {
    console.error(e)
  }
}

async function deleteAgent() {
  try {
    await agentClient.deleteAgent(agentUsername)
  } catch (e) {
    console.error(e)
  }
}

async function main() {
  await createAgent()
  await getAgent()
  await deleteAgent()
}

main()

