
const Session = require('./session')

let ENDPOINT = 'https://login.bpo.avaya.com'  // My endpoint here
let username = 'your-username-here'           // My username
let password = 'your-password-here'           // My password

let session = Session.createSession(ENDPOINT, username, password)

let agent_name = 'your-agent-name'          // The agent name you want to create
let agent_password = 'your-agent-password'  // The password for the agent that's being created

async function createAgent() {
  try {
    let agentObject = await session.createAgent(agent_name, agent_password)
    console.log('agentObject from createAgent')
    console.log(agentObject)
  } catch (e) {
    console.error(e)
  }
}

async function getAgent() {
  try {
    let agentObject = await session.getAgent(agent_name)
    console.log('agentObject from getAgent')
    console.log(agentObject)
  } catch (e) {
    console.error(e)
  }
}

async function deleteAgent() {
  try {
    await session.deleteAgent(agent_name)
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

