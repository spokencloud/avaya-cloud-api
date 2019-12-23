import * as Constants from "../src/Constants"
import { createAUXCodeClient, AUXCodeClient } from "../src/AUXCodeClient"
import { getValue } from "../src/Utils"

const args = require('minimist')(process.argv.slice(2));

let endpoint: string
let apiKey: string

try {
    endpoint = getValue(Constants.ENDPOINT_KEY, args)
    apiKey = getValue(Constants.API_KEY, args)
    main()
    .catch(error => console.error(error))
    .finally(() => process.exit(-1))
} catch (error) {
    console.log(error)
    process.exit(-1)
}

async function getAUXCodes(auxCodeClient: AUXCodeClient) {
    try {
        return await auxCodeClient.getAuxCodes();
    } catch (e) {
        console.log("getAUXCodes error ");
        console.error(e)
    }
}

async function getEffectiveAUXCodes(auxCodeClient: AUXCodeClient) {
    try {
        console.log("getEffectiveAUXCodes calling");
        return await auxCodeClient.getEffectiveAuxCodes();
    } catch (e) {
        console.log("getEffectiveAUXCodes error ");
        console.error(e)
    }
}

async function getAUXCodesForEffectiveAppId(auxCodeClient: AUXCodeClient){
    try {
        return await auxCodeClient.getAUXCodesForEffectiveAppId();
    } catch (e) {
        console.log("getEffectiveAUXCodes error ");
        console.error(e)
    }
}

async function main() {
    let auxCodeClient = await createAUXCodeClient(endpoint, apiKey);
    let auxCodes = await getAUXCodes(auxCodeClient);
    let effectiveAUXCodes = await getEffectiveAUXCodes(auxCodeClient);
    let appIdAuxCodes = await getAUXCodesForEffectiveAppId(auxCodeClient);
}