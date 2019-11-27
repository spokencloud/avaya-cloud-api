import { createSession } from "./session"
import { createAgentClient, AgentClient } from "./AgentClient"
import * as Constants from "./Constants";
import isValidParameter from "./Utils";
import { RestClient } from "./RestClient";

const args = require('minimist')(process.argv.slice(2));

let endpoint = args[Constants.ENDPOINT_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminUsername = args[Constants.ADMIN_USERNAME_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);
let adminPassword = args[Constants.ADMIN_PASSWORD_KEY].replace(Constants.REPLACE_REGEX, Constants.EMPTY_STRING);

let isEndpointValid = isValidParameter(Constants.ENDPOINT_KEY, endpoint);
let isAdminUsernameValid = isValidParameter(Constants.ADMIN_USERNAME_KEY, adminUsername);
let isAdminPasswordValid = isValidParameter(Constants.ADMIN_PASSWORD_KEY, adminPassword);

if (!isEndpointValid || !isAdminUsernameValid || !isAdminPasswordValid) {
    console.log("Invalid input provided..!!");
    process.exit();
}

// todo: provide token
let masterToken = ""
let restClient = new RestClient(endpoint, masterToken)

async function agentSkillNumbers(agentClient: AgentClient) {
    try {
        await agentClient.getSkillNumbers();
    } catch (e) {
        console.error(e)
    }
}

async function main() {
    let agentClient = await createAgentClient(restClient);
    await agentSkillNumbers(agentClient);
}

main();
