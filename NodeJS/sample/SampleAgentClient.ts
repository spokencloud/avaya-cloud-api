import { Err, Ok, Result } from "ts.data.json/dist/result";
import * as Constants from "../src/Constants";
import { createSession } from "../src/session";
import SkillPriority, { createAgentClient, AgentClient } from "../src/AgentClient";
import isValidParameter, { isValidSkillsWithPriorities } from "../src/Utils";
import { RestClient } from "../src/RestClient";

const args = require('minimist')(process.argv.slice(2));

let endpoint = args[Constants.ENDPOINT_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminUsername = args[Constants.ADMIN_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminPassword = args[Constants.ADMIN_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentUsername = args[Constants.AGENT_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentPassword = args[Constants.AGENT_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentSkill = args[Constants.AGENT_SKILL_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);


let isSkillValid = isValidSkillsWithPriorities(Constants.AGENT_SKILL_KEY, agentSkill)
let isEndpointValid = isValidParameter(Constants.ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(Constants.ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(Constants.ADMIN_PASSWORD_KEY, adminPassword);
let isAgentUsernameValid = isValidParameter(Constants.AGENT_USERNAME_KEY, agentUsername);
let isAgentPasswordValid = isValidParameter(Constants.AGENT_PASSWORD_KEY, agentPassword);

if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid ||
    !isAgentUsernameValid ||
    !isAgentPasswordValid || !isSkillValid) {
    console.log("Invalid input provided..!!")
    process.exit()
}
let session = createSession(endpoint, adminUsername, adminPassword);
// todo: provide token
let masterToken = ""
let restClient = new RestClient(endpoint, masterToken)
let skillWithPriorities: [SkillPriority] = JSON.parse(agentSkill);

async function createAgent(agentClient: AgentClient) {
    try {
        let agentObject = await agentClient.createAgent(agentUsername, agentPassword, skillWithPriorities);
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
        await agentClient.deleteAgent(agentUsername)
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

