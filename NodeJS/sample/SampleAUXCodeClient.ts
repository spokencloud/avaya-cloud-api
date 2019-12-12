import * as Constants from "../src/Constants"
import { createAUXCodeClient, AUXCodeClient } from "../src/AUXCodeClient"
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

async function getAUXCodes(auxCodeClient: AUXCodeClient) {
    try {
        console.log("getAUXCode calling");
        return await auxCodeClient.getAuxCodes();
    } catch (e) {
        console.log("getAUXCode error ");
        console.error(e)
    }
}

async function getEffectiveAUXCodes(auxCodeClient: AUXCodeClient) {
    try {
        console.log("getEffectiveAUXCode calling");
        return await auxCodeClient.getEffectiveAuxCodes();
    } catch (e) {
        console.log("getEffectiveAUXCode error ");
        console.error(e)
    }
}

async function getAUXCodeForEffectiveAppId(auxCodeClient: AUXCodeClient){
    try {
        console.log("getEffectiveAUXCode calling");
        return await auxCodeClient.getAUXCodesForEffectiveAppId();
    } catch (e) {
        console.log("getEffectiveAUXCode error ");
        console.error(e)
    }
}

async function main() {
    console.log("AUXCodeClient creation");
    let auxCodeClient = await createAUXCodeClient(endpoint, apiKey);
    let auxCode = await getAUXCodes(auxCodeClient);
    console.log("Aux Code is : %j",auxCode);
    let effectiveAUXCode = await getEffectiveAUXCodes(auxCodeClient);
    console.log("Effective Aux Code is : %j",effectiveAUXCode);
    let appIdAuxCode = await getAUXCodeForEffectiveAppId(auxCodeClient);
    console.log("AppId Aux Code is : %j",appIdAuxCode);
}