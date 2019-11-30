import { createAgentClient, AgentClient } from "./AgentClient"
import * as Constants from "./Constants";
import {getValue} from "./Utils";
import { RestClient } from "./RestClient";

const args = require('minimist')(process.argv.slice(2));

let endpoint = getValue(Constants.ENDPOINT_KEY, args)
let masterToken = getValue(Constants.API_KEY, args)

let restClient = new RestClient(endpoint, masterToken)

async function agentSkillNumbers(agentClient: AgentClient) {
    try {
        return await agentClient.getSkillNumbers();
    } catch (e) {
        console.error(e)
    }
}

async function main() {
    let agentClient = await createAgentClient(restClient);
    let skillNumbers = await agentSkillNumbers(agentClient);
    console.log(skillNumbers)
}

main();
