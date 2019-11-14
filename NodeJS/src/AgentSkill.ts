const args = require('minimist')(process.argv.slice(2));
export default args

const ENDPOINT_KEY = 'endpoint';
const ADMIN_USERNAME_KEY = 'admin_username';
const ADMIN_PASSWORD_KEY = 'admin_password';
const REPLACE_REGEX = /'/g;
const EMPTY_STRING = "";
let endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);

function isValidParameter(key: string, parameter: undefined): boolean {
    if (parameter === undefined) {
        console.log(key + ' was undefined');
        return false;
    }
    return true;
}

let isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword);

if (!isEndpointValid || !isAdminUsernameValid || !isAdminPasswordValid) {
    console.log("Invalid input provided..!!");
    process.exit();
}

import { createSession } from "./session"
import { createAgentClient } from "./AgentClient"
let session = createSession(endpoint, adminUsername, adminPassword);
let agentClient = createAgentClient(session);

async function agentSkillNumbers() {
    try {
        await agentClient.getSkillNumbers();
    } catch (e) {
        console.error(e)
    }
}

async function main() {
    await agentSkillNumbers();
}

main();
