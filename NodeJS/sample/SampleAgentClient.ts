import * as Constants from "../src/Constants"
import SkillPriority, { createAgentClient, AgentClient } from "../src/AgentClient"
import isValidParameter, { isValidSkillsWithPriorities } from "../src/Utils"
import { RestClient } from "../src/RestClient"
import {getValue} from "../src/Utils"

const args = require('minimist')(process.argv.slice(2));

function getAgentSkill(){
    let value = getValue(Constants.AGENT_SKILL_KEY, args)
    if(isValidSkillsWithPriorities(Constants.AGENT_SKILL_KEY, value)){
        return JSON.parse(value)
    }else {
        throw new Error(`skill priorities have to be specified in json format`)
    }
}

let endpoint = getValue(Constants.ENDPOINT_KEY, args)
let masterToken = getValue(Constants.API_KEY, args)
let agentUsername = getValue(Constants.AGENT_USERNAME_KEY, args)
let agentPassword = getValue(Constants.AGENT_PASSWORD_KEY, args)

let restClient = new RestClient(endpoint, masterToken)
let skillWithPriorities: [SkillPriority] = getAgentSkill()

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

async function main() {
    let agentClient = await createAgentClient(restClient);
    await createAgent(agentClient);
    await getAgent(agentClient);
    await deleteAgent(agentClient);

}
main();

