import { createSession } from "./session"
import { createAgentClient } from "./AgentClient"
import * as Constants from "./Constants";
const args = require('minimist')(process.argv.slice(2));

let endpoint = args[Constants.ENDPOINT_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminUsername = args[Constants.ADMIN_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminPassword = args[Constants.ADMIN_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);

function isValidParameter(key: string, parameter: undefined): boolean {
    if (!parameter) {
        console.log(key + ' was undefined');
        return false;
    }
    return true;
}

let isEndpointValid = isValidParameter(Constants.ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(Constants.ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(Constants.ADMIN_PASSWORD_KEY, adminPassword);

if (!isEndpointValid || !isAdminUsernameValid || !isAdminPasswordValid) {
    console.log("Invalid input provided..!!");
    process.exit();
}

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
