import { AgentClient, createAgentClient } from '../src/AgentClient'
import * as Constants from '../src/Constants'
import { getValue } from '../src/Utils'

const args = require('minimist')(process.argv.slice(2))

let endpoint: string
let apiKey: string
let agentUsername: string
let agentPassword: string
try {
  endpoint = getValue(Constants.ENDPOINT_KEY, args)
  apiKey = getValue(Constants.API_KEY, args)

  agentUsername = getValue(Constants.AGENT_USERNAME_KEY, args)
  agentPassword = getValue(Constants.AGENT_PASSWORD_KEY, args)

  main().catch(error => {
    console.error(error)
  })
} catch (error) {
  console.log(error)
  process.exit(-1)
}

async function createAgent(agentClient: AgentClient) {
  try {
    const response = await agentClient.createAgentAndStation(
      agentUsername,
      agentPassword
    )
    console.log(response)
  } catch (e) {
    console.error(e)
  }
}

async function getAgent(agentClient: AgentClient) {
  try {
    const agentObject = await agentClient.getAgent(agentUsername)
    console.log('agentObject from getAgent')
    console.log(agentObject)
  } catch (e) {
    console.error(e)
  }
}

async function deleteAgent(agentClient: AgentClient) {
  try {
    await agentClient.deleteAgentAndStation(agentUsername)
  } catch (e) {
    console.error(e)
  }
}

async function main() {
  const agentClient = await createAgentClient(endpoint, apiKey)
  const subAccountAppId = agentClient.SubAccountAppId
  await createAgent(agentClient)
  await getAgent(agentClient)
  const agentToken = await agentClient.getUserToken(agentUsername)
  console.log(agentToken)
  await deleteAgent(agentClient)
}
