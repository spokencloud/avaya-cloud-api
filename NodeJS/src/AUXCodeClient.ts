import { RestClient } from "./RestClient";
import { sleep } from "./Utils";
import { SkillPriority } from "./models";


export class AUXCodeClient {
    private restClient: RestClient
    private subAccountId: string

    constructor(subAccountId: string, restClient: RestClient) {
        this.restClient = restClient
        this.subAccountId = subAccountId
    }

    public async getAuxCodes() {
        return await this.restClient.getAuxCodesBySubaccountId(this.subAccountId);
    }

    public async getEffectiveAuxCodes(){
        return await this.restClient.getEffectiveAuxCodesBySubaccountId(this.subAccountId);
    }

    public async getAUXCodesForEffectiveAppId(){
        return await this.restClient.getAUXCodeForEffectiveAppId();
    }
    
}

async function createInstance(restClient: RestClient){
    let subAccountId = await restClient.getSubAccountId()
    return new AUXCodeClient(subAccountId, restClient);
}

export async function createAUXCodeClient(endpoint: string, apiKey: string): Promise<AUXCodeClient> {
    
    let restClient = new RestClient(endpoint, apiKey)
    return await createInstance(restClient)
}