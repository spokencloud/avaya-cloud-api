import {Err, Ok, Result} from "ts.data.json/dist/result";

const args = require('minimist')(process.argv.slice(2));

const ENDPOINT_KEY = 'endpoint';
const ADMIN_USERNAME_KEY = 'admin_username';
const ADMIN_PASSWORD_KEY = 'admin_password';
const AGENT_USERNAME_KEY = 'agent_username';
const AGENT_PASSWORD_KEY = 'agent_password';
const AGENT_SKILL_KEY = 'agent_skill';

const REPLACE_REGEX = /'/g;
const EMPTY_STRING = "";
let endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let agentUsername = args[AGENT_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let agentPassword = args[AGENT_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let agentSkill = args[AGENT_SKILL_KEY].replace(REPLACE_REGEX, EMPTY_STRING);

function isValidParameter(key: string, parameter: undefined): boolean {
    if (parameter === undefined) {
        console.log(key + ' was undefined');
        return false;
    }
    return true;
}

interface SkillPriority{
    skillNumber:number,
    skillPriority:number
}

import { JsonDecoder } from 'ts.data.json';

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

let isSkillValid = isValidSkillsWithPriorities(AGENT_SKILL_KEY,agentSkill)
let isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword);
let isAgentUsernameValid = isValidParameter(AGENT_USERNAME_KEY, agentUsername);
let isAgentPasswordValid = isValidParameter(AGENT_PASSWORD_KEY, agentPassword);




if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid ||
    !isAgentUsernameValid ||
    !isAgentPasswordValid || !isSkillValid) {
    console.log("Invalid input provided..!!")
    process.exit()
}
import { createSession } from "./session"
import { createAgentClient } from "./AgentClient"
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

async function agentSkillNumbers() {
    try {
        await agentClient.getSkillNumbers();
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

