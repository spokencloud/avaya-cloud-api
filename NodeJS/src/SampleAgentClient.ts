import {Err, Ok, Result} from "ts.data.json/dist/result";
import { JsonDecoder } from 'ts.data.json';
import * as Constants from "./Constants";
import { createSession } from "./session";
import SkillPriority, { createAgentClient} from "./AgentClient";

const args = require('minimist')(process.argv.slice(2));

let endpoint = args[Constants.ENDPOINT_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminUsername = args[Constants.ADMIN_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminPassword = args[Constants.ADMIN_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentUsername = args[Constants.AGENT_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentPassword = args[Constants.AGENT_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let agentSkill = args[Constants.AGENT_SKILL_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);

function isValidParameter(key: string, parameter: undefined): boolean {
    if (!parameter) {
        console.log(key + ' was undefined');
        return false;
    }
    return true;
}

const skillDecoder = JsonDecoder.object<SkillPriority>(
    {
        skillNumber: JsonDecoder.number,
        skillPriority: JsonDecoder.number
    },
    'Skill Priority Combination'
);

function isValidSkillsWithPriorities(key: string, skillPriorities: string): boolean {
    let obj: [SkillPriority]  = JSON.parse(skillPriorities);
    for(let skill of obj){
        if(skillDecoder.decode(skill) instanceof Err){
            return false;
        }
    }
    return true;
}

let isSkillValid = isValidSkillsWithPriorities(Constants.AGENT_SKILL_KEY,agentSkill)
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
let agentClient = createAgentClient(session);
let skillWithPriorities: [SkillPriority]  = JSON.parse(agentSkill);

async function createAgent() {
    try {
        let agentObject = await agentClient.createAgent(agentUsername, agentPassword, skillWithPriorities);
        console.log('agentObject from createAgent');
        console.log(agentObject)
    } catch (e) {
        console.error(e)
    }
}

async function getAgent() {
    try {
        let agentObject = await agentClient.getAgent(agentUsername);
        console.log('agentObject from getAgent');
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
   await createAgent();
   await getAgent();
   await deleteAgent();

}

main();

