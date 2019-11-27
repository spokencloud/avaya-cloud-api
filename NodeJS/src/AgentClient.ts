import * as Constants from "./Constants";
import { RestClient } from "./RestClient";

export default interface SkillPriority {
    skillNumber: number,
    skillPriority: number
}

export class AgentClient {
    restClient: RestClient
    subAccountId: string
    constructor(subAccountId: string, restClient: RestClient) {
        this.restClient = restClient
        this.subAccountId = subAccountId
    }

    async createAgent(agent_username: string, agent_password: string, skillsWithPriority: [SkillPriority]) {
        let agentStationGroupId = await this.restClient.getAgentStationGroupId(this.subAccountId);
        let agentLoginId = await this.restClient.getNextAvailableExtension(this.subAccountId, 'AGENT');
        let skillIds = await this.getSkillIds(this.subAccountId);
        await this.sendCreateAgentRequest(
            this.subAccountId,
            agent_username,
            agent_password,
            agentStationGroupId,
            agentLoginId,
            skillIds, skillsWithPriority
        );

        // wait until agent is created
        await this.waitForAgentCreation(agentLoginId);

        let stationExtension = await this.restClient.getNextAvailableExtension(this.subAccountId, 'STATION');
        await this.sendCreateStationRequest(
            agentStationGroupId,
            this.subAccountId,
            stationExtension,
            agent_username
        );

        // wait until station is created
        await this.waitForStationCreation(agent_username);
        return this.getAgent(agent_username);
    }

    async sendCreateAgentRequest(
        subAccountId: any,
        agent_username: string,
        agent_password: string,
        agentStationGroupId: any,
        agentLoginId: any,
        skillIds: any, skillsWithPriority: [SkillPriority]) {

        let securityCode = this.generateSecurityCode(agentLoginId);
        let avayaPassword = this.generateAvayaPassword(agentLoginId);
        let agent = {
            "username": agent_username,
            "firstName": Constants.AGENT_FIRST_NAME,
            "lastName": Constants.AGENT_LAST_NAME,
            "password": agent_password,
            "loginId": agentLoginId,
            "agentStationGroupId": agentStationGroupId,
            "securityCode": securityCode,
            "startDate": "2019-03-21",
            "endDate": "2038-01-01",
            "avayaPassword": avayaPassword,
            "clientId": subAccountId,
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


    getSkillIds(subAccountId: string) {
        return this.restClient.getSubAccountSkills(subAccountId)
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                // console.log(response)
                let skillResponses = response.data['skillResponses'][subAccountId];
                return skillResponses.map((skillResponse: { id: any }) => skillResponse.id);
            })

    }

    getSkillNumbers() {
        return this.restClient.getSubAccountSkills(this.subAccountId)
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                let skillResponses = response.data['skillResponses'][this.subAccountId];
                const availableSkills = [];
                for (let skill of skillResponses) {
                    let skillInfo = {
                        "skillNumber": skill.number,
                        "skillName": skill.name,
                    };
                    availableSkills.push(skillInfo);
                }
                console.log(availableSkills);
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
        let agent = {};
        try {
            agent = await this.restClient.getAgentByUsername(agentUsername)
        } catch (e) {
            if (e.response.status === 404) {
                console.log('agent ' + agentUsername + ' not found')
            } else {
                throw e
            }
        }

        let station = {};
        try {
            station = await this.restClient.getStationForAgent(this.subAccountId, agentUsername);
            if (!station) {
                console.log('station associated with ' + agentUsername + ' not found');
                station = {}
            }
        } catch (e) {
            if (e.response.status === 404) {
                console.log('station associated with ' + agentUsername + ' not found')
            } else {
                throw e
            }
        }

        return { 'agent': agent, 'station': station }
    }


    async waitForAgentCreation(loginId: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Creating agent.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    await this.restClient.getAgentByLoginId(loginId);
                    console.log('agent created');
                    clearInterval(intervalId);
                    resolve()
                } catch (e) {
                    if (e.response.status === 404) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > Constants.MAX_RETRY) {
                            clearInterval(intervalId);
                            reject(Error('agent creation failed'))
                        }
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, Constants.INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForAgentDeletion(agent_username: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Deleting agent.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    await this.restClient.getAgentByUsername(agent_username);
                    process.stdout.write('.');
                    counter++;
                    if (counter > Constants.MAX_RETRY) {
                        console.log();
                        clearInterval(intervalId);
                        reject(Error('agent deletion failed'))
                    }
                } catch (e) {
                    if (e.response.status === 404) {
                        console.log('agent deleted');
                        clearInterval(intervalId);
                        resolve()
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, Constants.INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForStationCreation(agent_username: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Creating station.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    let station = await this.restClient.getStationForAgent(this.subAccountId, agent_username);
                    if (station) {
                        console.log('station created');
                        clearInterval(intervalId);
                        resolve()
                    } else {
                        process.stdout.write('.');
                        counter++;
                        if (counter > Constants.MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('station creation failed'))
                        }
                    }
                } catch (e) {
                    if (e.response.status === 404) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > Constants.MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('station creation failed'))
                        }
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, Constants.INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForStationDeletion(agent_username: any) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Deleting station.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    let station = await this.restClient.getStationForAgent(this.subAccountId, agent_username);
                    if (station) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > Constants.MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('station deletion failed'))
                        }
                    } else {
                        console.log('station deleted');
                        clearInterval(intervalId);
                        resolve()
                    }
                } catch (e) {
                    if (e.response.status === 404) {
                        console.log('station deleted');
                        clearInterval(intervalId);
                        resolve()
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, Constants.INTERVAL_IN_MILLIS);
            return intervalId
        })
    }



    async deleteAgent(agentUsername: string) {

        let station = await this.restClient.getStationForAgent(this.subAccountId, agentUsername);
        // station might have been deleted before, so station might be undefined
        if (station) {
            await this.restClient.requestStationDeletion(station.id);
            await this.waitForStationDeletion(agentUsername)
        } else {
            console.log('station associated with ' + agentUsername + ' has already been deleted')
        }

        try {
            let agent = await this.restClient.getAgentByUsername(agentUsername);
            let submitted = await this.restClient.requestAgentDeletion(agentUsername, agent.loginId);
            if (submitted) {
                await this.waitForAgentDeletion(agentUsername);
            }
        } catch (e) {
            if (e.response.status === 404) {
                console.log('agent ' + agentUsername + ' has already been deleted')
            } else {
                throw e
            }
        }
    }
}
export async function createAgentClient(restClient: RestClient): Promise<AgentClient> {
    let subAccountId = await restClient.getSubAccountId()
    return new AgentClient(subAccountId, restClient);

}
