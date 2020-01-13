import * as Constants from "./Constants";
import { RestClient } from "./RestClient";
import { sleep, isValidPassword, isValidUsername } from "./Utils";
import { SkillPriority } from "./models";

const logger = Constants.log4js.getLogger('AgentClient');

export class AgentClient {

    private restClient: RestClient
    private subAccountId: string

    constructor(subAccountId: string, restClient: RestClient) {
        this.restClient = restClient
        this.subAccountId = subAccountId
    }
    /**
     * Create Agent and Station. Upon success, returns agent object and station object
     * @param agentUsername min length 2, max length 25, must pass ^[-.@\w]+$
     * @param agentPassword min length 8, max length 32, must have a uppercase character, must have at least one lowercase char, no whitespace, must contains a number, must contain one of ~!@?#$%^&*_
     * @param skillsWithPriority this could retrieved via #getSkillNumbers()
     */
    public async createAgentAndStation(agentUsername: string, agentPassword: string, skillsWithPriority: SkillPriority[]) {
        if (!isValidPassword(agentPassword)) {
            return Promise.reject("invalid password")
        }
        if (!isValidUsername(agentUsername)) {
            return Promise.reject("invalid username")
        }
        if (skillsWithPriority.length == 0) {
            return Promise.reject("invalid skills")
        }
        let agentStationGroupId = await this.restClient.getAgentStationGroupId(this.subAccountId);
        if (agentStationGroupId < 0) {
            throw new Error(`subAccount ${this.subAccountId} has no agent station group defined`)
        }

        await this.createUserIfNotExists(agentUsername, agentPassword, skillsWithPriority, agentStationGroupId)
        await this.createStationIfNotExists(agentUsername, agentStationGroupId)

        return this.getAgentAndStation(agentUsername);
    }

    public async createStationIfNotExists(agentUsername: string, agentStationGroupId: string) {
        let stationExists = await this.existsStationForAgent(agentUsername)
        if (stationExists) {
            return Promise.resolve(true)
        }
        let stationExtension = await this.restClient.getNextAvailableExtension(this.subAccountId, 'STATION');
        if (stationExtension < 0) {
            throw new Error(`subAccount ${this.subAccountId} has no station extensions available`)
        }
        await this.sendCreateStationRequest(
            agentStationGroupId,
            this.subAccountId,
            stationExtension,
            agentUsername
        );
        return await this.waitForStationCreation(agentUsername);
    }

    public async createUserIfNotExists(agentUsername: string, agentPassword: string, skillsWithPriority: SkillPriority[], agentStationGroupId: string) {
        let userExists = await this.existsAgentByUsername(agentUsername)
        if (userExists) {
            return Promise.resolve(true)
        }
        let agentLoginId = await this.restClient.getNextAvailableExtension(this.subAccountId, 'AGENT');
        if (agentLoginId < 0) {
            throw new Error(`subAccount ${this.subAccountId} has no available agent extension`)
        }

        // todo: pass it in to reuse
        let skillIds = await this.getSkillIds();
        if (skillIds.length == 0) {
            throw new Error(`subAccount ${this.subAccountId} has no skills`)
        }

        await this.sendCreateAgentRequest(
            agentUsername,
            agentPassword,
            agentStationGroupId,
            agentLoginId,
            skillIds, skillsWithPriority
        );
        return await this.waitForAgentCreation(agentLoginId);
    }
    async sendCreateAgentRequest(
        agentUsername: string,
        agentPassword: string,
        agentStationGroupId: any,
        agentLoginId: any,
        skillIds: any, skillsWithPriority: SkillPriority[]) {

        let securityCode = this.generateSecurityCode(agentLoginId);
        let avayaPassword = this.generateAvayaPassword(agentLoginId);
        let agent = {
            "username": agentUsername,
            "firstName": Constants.AGENT_FIRST_NAME,
            "lastName": Constants.AGENT_LAST_NAME,
            "password": agentPassword,
            "loginId": agentLoginId,
            "agentStationGroupId": agentStationGroupId,
            "securityCode": securityCode,
            "startDate": "2019-03-21",
            "endDate": "2038-01-01",
            "avayaPassword": avayaPassword,
            "clientId": this.subAccountId,
            "skillIds": skillIds,
            "agentSkills": skillsWithPriority,
            // no supervisors
            "supervisorId": 0,
            // channel 1 is voice
            "channelIds": [1]
        };

        return this.restClient.createAgentJob(agent)
    }

    generateAvayaPassword(agentLoginId: { toString: () => any }) {
        let agentLoginIdString = agentLoginId.toString();
        let length = agentLoginIdString.length;
        // substring(starting_index, ending_index), negative starting_index is treated as 0
        return agentLoginIdString.substring(length - 6, length);
    }

    generateSecurityCode(agentLoginId: { toString: () => any }) {
        let agentLoginIdString = agentLoginId.toString();
        let length = agentLoginIdString.length;
        // substring(starting_index, ending_index), negative starting_index is treated as 0
        return agentLoginIdString.substring(length - 4, length);
    }

    getSkillIds(): Promise<[]> {
        return this.restClient.getSubAccountAgentSkills(this.subAccountId)
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                logger.debug(response.data)
                let skillResponses = response.data['skillResponses'][this.subAccountId];
                if (skillResponses) {
                    return skillResponses.map((skillResponse: { id: any }) => skillResponse.id);
                } else {
                    return []
                }
            })

    }

    protected async getDefaultSkillId(): Promise<number> {
        return await this.restClient.getSubAccountAgentSkills(this.subAccountId)        
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                logger.debug(response.data)
                // data has a key of skillResponse, which is a map of subaccountId, and array of skillResponse
                // skillResponses is SkillResponse[]
                let skillResponses = response.data['skillResponses'][this.subAccountId];
                if (skillResponses) {
                    let defaultSkill = skillResponses.find((skillResponse: { id: number, name: string }) => skillResponse.name === Constants.DEFAULT_SKILL_NAME);
                    return !!defaultSkill ? defaultSkill.id : undefined
                }
            }) 
    }

    /**
     * retrieve agent skills in {skillName:string, skillNumber:number}[]
     */
    async getSkillNumbers(): Promise<{ skillName: string, skillNumber: number }[]> {
        return await this.restClient.getSubAccountAgentSkills(this.subAccountId)
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                let skillResponses = response.data['skillResponses'][this.subAccountId];
                if (skillResponses === undefined) {
                    return [];
                }
                const availableSkills = [];
                for (let skill of skillResponses) {
                    let skillInfo = {
                        "skillNumber": skill.number,
                        "skillName": skill.name,
                    };
                    availableSkills.push(skillInfo);
                }
                logger.debug(availableSkills);
                return availableSkills;
            })
    }

    sendCreateStationRequest(
        agentStationGroupId: any,
        subAccountId: any,
        stationExtension: { toString: () => any },
        agentUsername: string) {

        let securityCode = this.generateSecurityCode(stationExtension);

        let station = {
            "agentStationGroupId": agentStationGroupId,
            "clientId": subAccountId,
            "extension": stationExtension,
            "name": Constants.STATION_NAME,
            "securityCode": securityCode,
            "username": agentUsername
        };

        return this.restClient.createStationJob(station)
    }

    async getAgent(agentUsername: string) {
        return this.restClient
            .getAgentByUsername(agentUsername)
            .then(agent => agent)
            .catch(error => { return undefined })
    }

    async getStation(agentUsername: string) {
        return this.restClient
            .getStationForAgent(this.subAccountId, agentUsername)
            .then((response: any) => response)
            .catch((error: any) => { return undefined })
    }

    async getAgentAndStation(agentUsername: string) {
        let agent = await this.getAgent(agentUsername)
        let station = await this.getStation(agentUsername)
        return { 'agent': agent || {}, 'station': station || {} }
    }

    existsAgentByLoginId(loginId: number) {
        let promise = this.restClient.getAgentByLoginId(loginId)
        return this.existsAgent(promise)
    }
    existsAgentByUsername(username: string) {
        let promise = this.restClient.getAgentByUsername(username)
        return this.existsAgent(promise)
    }
    existsAgent(promise: Promise<any>): Promise<boolean> {
        return promise
            .then(agent => {
                return true
            })
            .catch(error => {
                return false
            }
            )
    }

    existsStationForAgent(agentUsername: string) {
        return this.restClient
            .getStationForAgent(this.subAccountId, agentUsername)
            .then((station: any) => station !== undefined)
    }

    private async repeat(callback: () => Promise<boolean>) {
        return this.redo(callback, Constants.MAX_RETRY, Constants.INTERVAL_IN_MILLIS)
    }

    /**
     * redo action, as a callback function, a number of times
     * @param callback need to always resolve to either true or false
     * @param retries max number of retries
     * @param millis time to sleep before retry
     */
    async redo(callback: () => Promise<boolean>, retries: number, millis: number) {
        logger.debug(`entering redo ${retries}`)
        for (let count = 0; count < retries; count++) {
            let result = await callback()
            logger.debug(`redo count=${count}; result=${result}`)
            if (result) {
                logger.debug("result is true exiting redo...")
                return true
            }
            await sleep(millis)
        }
        return false
    }

    async waitForAgentCreation(loginId: number) {
        let callback = () => {
            return this.existsAgentByLoginId(loginId)
        }
        return this.repeat(callback)
    }

    async waitForAgentDeletion(agentUsername: string) {
        let callback = () => {
            return this.existsAgentByUsername(agentUsername)
                .then(result => !result)
        }
        return this.repeat(callback)
    }

    async waitForStationCreation(agentUsername: string) {
        let callback = () => {
            return this.existsStationForAgent(agentUsername)
        }
        return this.repeat(callback)
    }

    async waitForStationDeletion(agentUsername: string) {
        let callback = () => {
            return this.restClient
                .getStationForAgent(this.subAccountId, agentUsername)
                .then((station: any) => station === undefined)
        }
        return this.repeat(callback)
    }

    async deleteAgentAndStation(agentUsername: string) {

        let station = await this.restClient.getStationForAgent(this.subAccountId, agentUsername);
        // station might have been deleted before, so station might be undefined
        if (station) {
            await this.restClient.requestStationDeletion(station.id);
            await this.waitForStationDeletion(agentUsername)
        } else {
            logger.debug('station associated with ' + agentUsername + ' has already been deleted')
        }

        let agent = await this.getAgent(agentUsername);
        if (!agent) {
            return true
        }
        let submitted = await this.restClient.requestAgentDeletion(agentUsername, agent.loginId);
        if (submitted) {
            return await this.waitForAgentDeletion(agentUsername);
        }
        return false
    }
    async getUserToken(username: string) {
        return await this.restClient.getUserToken(username)
    }
}
async function createInstance(restClient: RestClient) {
    let subAccountId = await restClient.getSubAccountId()
    return new AgentClient(subAccountId, restClient);
}

export async function createAgentClient(endpoint: string, apiKey: string): Promise<AgentClient> {
    let restClient = new RestClient(endpoint, apiKey)
    return await createInstance(restClient)
}
