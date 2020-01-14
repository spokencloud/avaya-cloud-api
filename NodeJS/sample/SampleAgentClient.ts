import * as Constants from "../src/Constants"
import { createAgentClient, AgentClient } from "../src/AgentClient"
import { isValidSkillsWithPriorities } from "../src/Utils"
import { getValue } from "../src/Utils"

const args = require('minimist')(process.argv.slice(2));

let endpoint: string
let apiKey: string
let agentUsername: string
let agentPassword: string
try {
    endpoint = getValue(Constants.ENDPOINT_KEY, args)
    apiKey = getValue(Constants.API_KEY, args)

    agentUsername = getValue(Constants.AGENT_USERNAME_KEY, args)
    agentPassword = getValue(Constants.AGENT_PASSWORD_KEY, args)

    main();
} catch (error) {
    console.log(error)
    process.exit(-1)
}

async function createAgent(agentClient: AgentClient) {
    try {
        let response = await agentClient.createAgentAndStation(agentUsername, agentPassword);
        console.log(response)
    } catch (e) {
        console.error(e)
    }
}

async function getAgent(agentClient: AgentClient) {
    try {
        let agentObject = await agentClient.getAgent(agentUsername);
        console.log('agentObject from getAgent');
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
    let agentClient = await createAgentClient(endpoint, apiKey);
    await createAgent(agentClient);
    await getAgent(agentClient);
    await deleteAgent(agentClient);
    let agentToken = await agentClient.getUserToken('yangadmin1')
    console.log(agentToken)
}

