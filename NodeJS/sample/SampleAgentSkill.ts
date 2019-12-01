import * as Constants from "../src/Constants"
import { createAgentClient, AgentClient } from "../src/AgentClient"
import { getValue } from "../src/Utils"

const args = require('minimist')(process.argv.slice(2));

let endpoint: string
let apiKey: string

try {
    endpoint = getValue(Constants.ENDPOINT_KEY, args)
    apiKey = getValue(Constants.API_KEY, args)
    main();
} catch (error) {
    console.log(error)
    process.exit(-1)
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
    await agentSkillNumbers(agentClient);

}
