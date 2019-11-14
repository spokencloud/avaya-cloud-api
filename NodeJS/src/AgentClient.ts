const lodash = require('lodash');
import {Session} from "./session";

const STATION_NAME = 'generated station';
const AGENT_FIRST_NAME = 'generated';
const AGENT_LAST_NAME = 'agent';
// ten seconds
const INTERVAL_IN_MILLIS = 10 * 1000;
const MAX_RETRY = 5;

interface SkillPriority{
    skillNumber:number,
    skillPriority:number
}

class AgentClient {
    session:Session;

    constructor(session: any) {
        this.session = session
    }

    async createAgent(agent_username: string, agent_password: string, skillsWithPriority: [SkillPriority]) {
        await this.session.login();
        let subAccountId = await this.getSubAccountId();
        let agentStationGroupId = await this.getAgentStationGroupId(subAccountId);
        let agentLoginId = await this.generateExtension(subAccountId, 'AGENT');
        let skillIds = await this.getSkillIds(subAccountId);
        await this.sendCreateAgentRequest(
            subAccountId,
            agent_username,
            agent_password,
            agentStationGroupId,
            agentLoginId,
            skillIds, skillsWithPriority
        );

        // wait until agent is created
        await this.waitForAgentCreation(agentLoginId);

        let stationExtension = await this.generateExtension(subAccountId, 'STATION');
        await this.sendCreateStationRequest(
            agentStationGroupId,
            subAccountId,
            stationExtension,
            agent_username
        );

        // wait until station is created
        await this.waitForStationCreation(subAccountId, agent_username);
        return this.getAgent(agent_username);
    }

    async getAgentStationGroupId(subAccountId: string) {
        return this.session.get('/spokenAbc/agentStationGroups/client/' + subAccountId)
            .then((response: { data: any }) => {
                let agentStationGroups = response.data;
                // ensure we always get the same subAccount ordering
                agentStationGroups = lodash.sortBy(agentStationGroups, ['id']);
                return agentStationGroups[0].id;
            })
    }

    async sendCreateAgentRequest(
        subAccountId: any,
        agent_username: string,
        agent_password: string,
        agentStationGroupId: any,
        agentLoginId: any,
        skillIds: any, skillsWithPriority:[SkillPriority]) {

        let securityCode = this.generateSecurityCode(agentLoginId);
        let avayaPassword = this.generateAvayaPassword(agentLoginId);
        let agent = {
            "username": agent_username,
            "firstName": AGENT_FIRST_NAME,
            "lastName": AGENT_LAST_NAME,
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

        return this.session.post('/spokenAbc/jobs/agents', agent)
            .then((result: any) => {
                return result
            })
    }

    generateAvayaPassword(agentLoginId: { toString: () => any }) {
        let agentLoginIdString = agentLoginId.toString();
        let length = agentLoginIdString.length;
        return agentLoginIdString.substring(length - 6, length);
    }

    generateSecurityCode(agentLoginId: { toString: () => any }) {
        let agentLoginIdString = agentLoginId.toString();
        let length = agentLoginIdString.length;
        return agentLoginIdString.substring(length - 4, length);
    }

    async generateExtension(subAccountId: string, type: string) {
        return this.session.post(
            'spokenAbc/extensions/next/' + subAccountId + '/type/' + type)
            .then((response: { data: any }) => {
                return response.data
            })
    }

    async getSkillIds(subAccountId: string) {
        return this.session.get(
            'spokenAbc/skills/multiClientSkills?clientIds=' + subAccountId + '&skillType=AGENT')
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                // console.log(response)
                let skillResponses = response.data['skillResponses'][subAccountId];
                return skillResponses.map((skillResponse: { id: any }) => skillResponse.id);
            })
    }

    async getSkillNumbers() {
        await this.session.login();

        let subAccountId = await this.session.getSubAccount()
            .then((response: { id: any }) => {
                return response.id
            });

        return this.session.get(
            'spokenAbc/skills/multiClientSkills?clientIds=' + subAccountId + '&skillType=AGENT')
            .then((response: { data: { [x: string]: { [x: string]: any } } }) => {
                let skillResponses = response.data['skillResponses'][subAccountId];
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

    async sendCreateStationRequest(
        agentStationGroupId: any,
        subAccountId: any,
        stationExtension: { toString: () => any },
        agentUsername: string) {

        let securityCode = this.generateSecurityCode(stationExtension);

        let station = {
            "agentStationGroupId": agentStationGroupId,
            "clientId": subAccountId,
            "extension": stationExtension,
            "name": STATION_NAME,
            "securityCode": securityCode,
            "username": agentUsername
        };

        return this.session.post('/spokenAbc/jobs/stations', station)
            .then((result: any) => {
                // console.log(result.data)
                return result
            })
    }

    async getAgent(agentUsername: string) {
        await this.session.login();

        let agent = {};
        try {
            agent = await this.getAgentByUsername(agentUsername)
        } catch (e) {
            if (e.response.status === 404) {
                console.log('agent ' + agentUsername + ' not found')
            } else {
                throw e
            }
        }

        let subAccountId = await this.getSubAccountId();
        let station = {};
        try {
            station = await this.getStationOnly(subAccountId, agentUsername);
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

        return {'agent':agent, 'station': station}
    }

    async getSubAccountId() {
        return this.session.getSubAccount()
            .then((response: { id: any }) => {
                return response.id
            })
    }

    async getAgentByUsername(agent_username: string) {
        return this.session.get('/spokenAbc/agents/username/' + agent_username)
            .then((response: { data: any }) => {
                // console.log(response.data)
                return response.data
            })
    }

    async getAgentByLoginId(loginId: string) {
        return this.session.get('/spokenAbc/agents/loginId/' + loginId)
            .then((response: { data: any }) => {
                // console.log(response.data)
                return response.data
            })
    }

    async waitForAgentCreation(loginId: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Creating agent.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    await this.getAgentByLoginId(loginId);
                    console.log('agent created');
                    clearInterval(intervalId);
                    resolve()
                } catch (e) {
                    if (e.response.status === 404) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('agent creation failed'))
                        }
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForAgentDeletion(agent_username: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Deleting agent.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    await this.getAgentByUsername(agent_username);
                    process.stdout.write('.');
                    counter++;
                    if (counter > MAX_RETRY) {
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
            }, INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForStationCreation(subAccountId: any, agent_username: string) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Creating station.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    let station = await this.getStationOnly(subAccountId, agent_username);
                    if (station) {
                        console.log('station created');
                        clearInterval(intervalId);
                        resolve()
                    } else {
                        process.stdout.write('.');
                        counter++;
                        if (counter > MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('station creation failed'))
                        }
                    }
                } catch (e) {
                    if (e.response.status === 404) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > MAX_RETRY) {
                            console.log();
                            clearInterval(intervalId);
                            reject(Error('station creation failed'))
                        }
                    } else {
                        console.log(e);
                        throw e
                    }
                }
            }, INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async waitForStationDeletion(subAccountId: any, agent_username: any) {
        return new Promise((resolve, reject) => {
            process.stdout.write("Deleting station.");
            let counter = 0;
            const intervalId = setInterval(async () => {
                try {
                    let station = await this.getStationOnly(subAccountId, agent_username);
                    if (station) {
                        process.stdout.write('.');
                        counter++;
                        if (counter > MAX_RETRY) {
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
            }, INTERVAL_IN_MILLIS);
            return intervalId
        })
    }

    async getStationOnly(subAccountId: string, agent_username: string) {
        return this.session.get('/spokenAbc/stations?clientId=' + subAccountId)
            .then((result: { data: any[] }) => {
                return result.data.find(element => element.username === agent_username);
            })
    }

    async deleteAgent(agentUsername: string) {
        await this.session.login();

        let subAccountId = await this.getSubAccountId();

        let station = await this.getStationOnly(subAccountId, agentUsername);
        // station might have been deleted before, so station might be undefined
        if (station) {
            await this.deleteStationOnly(station.id);
            await this.waitForStationDeletion(subAccountId, agentUsername)
        } else {
            console.log('station associated with ' + agentUsername + ' has already been deleted')
        }

        try {
            let agent = await this.getAgentByUsername(agentUsername);
            await this.deleteAgentOnly(agentUsername, agent.loginId);
            await this.waitForAgentDeletion(agentUsername);
        } catch (e) {
            if (e.response.status === 404) {
                console.log('agent ' + agentUsername + ' has already been deleted')
            } else {
                throw e
            }
        }
    }

    async deleteStationOnly(stationId: string) {
        return this.session.delete('/spokenAbc/jobs/stations/' + stationId);
    }

    async deleteAgentOnly(agentUsername: string, agentLoginId: any) {
        let deleteRequest = {'username': agentUsername, 'loginId': agentLoginId};
        return this.session.post('/spokenAbc/agents/removeAgent', deleteRequest)
    }
}

export function createAgentClient(session:Session){
    return new AgentClient(session);
}
