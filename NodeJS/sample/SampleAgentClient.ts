import * as Constants from "../src/Constants"
import { createAgentClient, AgentClient } from "../src/AgentClient"
import { SkillPriority } from "../src/definitions"
import { isValidSkillsWithPriorities } from "../src/Utils"
import { getValue } from "../src/Utils"

const args = require('minimist')(process.argv.slice(2));

let endpoint: string
let apiKey: string
let agentUsername: string
let agentPassword: string
let skillWithPriorities: SkillPriority[]
try {
    endpoint = getValue(Constants.ENDPOINT_KEY, args)
    apiKey = getValue(Constants.API_KEY, args)

    agentUsername = getValue(Constants.AGENT_USERNAME_KEY, args)
    agentPassword = getValue(Constants.AGENT_PASSWORD_KEY, args)
    skillWithPriorities = getAgentSkill()
    console.log(skillWithPriorities)
    main();
} catch (error) {
    console.log(error)
    process.exit(-1)
}

function getAgentSkill() {
    let value = getValue(Constants.AGENT_SKILL_KEY, args)
    if (isValidSkillsWithPriorities(Constants.AGENT_SKILL_KEY, value)) {
        return JSON.parse(value)
    } else {
        throw new Error(`skill priorities have to be specified in json format`)
    }
}

async function createAgent(agentClient: AgentClient) {
    try {
        let agentObject = await agentClient.createAgentAndStation(agentUsername, agentPassword, skillWithPriorities);
        console.log('agentObject from createAgent');
        console.log(agentObject)
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
async function agentSkillNumbers(agentClient: AgentClient) {
    try {
        return await agentClient.getSkillNumbers();
    } catch (e) {
        console.error(e)
    }
}

async function main() {
    let agentClient = await createAgentClient(endpoint, apiKey);
    await createAgent(agentClient);
    await getAgent(agentClient);
    await deleteAgent(agentClient);
}

