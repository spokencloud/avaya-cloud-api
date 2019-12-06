import { CookieJar } from "tough-cookie";
import { log4js, STATION_JOB_PATH, STATION_GROUP_PATH, FETCH_SKILL_ID_PATH, EXTENSION_PATH, USER_PATH, REMOVE_AGENT_PATH, AGENT_JOB_PATH, FETCH_AGENT_BY_USERNAME_PATH, FETCH_AGENT_ID_PATH, DELETE_STATION_PATH, STATION_ONLY_PATH, SUBSCRIPTION_PATH, VERSION, SUB_ACCOUNT_KEY, lodash } from "./Constants";
import { Subscription } from './models';
export const STATION_GROUP_ID_NOT_EXISTS = -1

const axios = require('axios').default;
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
const logger = log4js.getLogger('AgentClient');

axiosCookieJarSupport(axios);

interface Credential {
    token: string,
    cookieJar: CookieJar
}

export class RestClient {


    private baseUrl: string
    masterCredential: Credential
    credentials: Map<string, Credential>
    constructor(baseUrl: string, masterToken: string) {
        this.baseUrl = baseUrl
        const masterCookieJar = new CookieJar()
        this.masterCredential = { token: `Bearer ${masterToken}`, cookieJar: masterCookieJar }
        this.credentials = new Map();
    }
    public getUser() {
        let url = `${this.baseUrl}/user`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data)
    }
    public getUserToken(username: string) {
        let url = `${this.baseUrl}/user/${username}/token`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                return response.data
            })
    }
    storeUserToken(username: string, userToken: string) {
        let credential = { token: userToken, cookieJar: new CookieJar() }
        this.credentials.set(username, credential)
    }
    public async getAndStoreUserStoken(username: string) {
        let userToken = await this.getUserToken(username)
        logger.debug(`storing token for ${username}`)
        this.storeUserToken(username, userToken)

    }

    /**
     * Caller should await the method to finish. When call is successful, a number greater than 0 will be returned.
     * When subAccountId has no station group defined, -1 will be returned;
     * For other errors, a negative value of http status code will be returned;
     * @param subAccountId
     */
    public getAgentStationGroupId(subAccountId: string) {
        let url = `${this.baseUrl}/${STATION_GROUP_PATH}/${subAccountId}`
        logger.debug(`getAgentStationGroupId url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                let agentStationGroups = response.data;
                if (agentStationGroups.length === 0) {
                    return STATION_GROUP_ID_NOT_EXISTS
                }
                // ensure we always get the same subAccount ordering
                agentStationGroups = lodash.sortBy(agentStationGroups, ['id']);
                return agentStationGroups[0].id;
            })
            .catch((error: any) => {
                return - error.response.status
            })
    }
    public getSubAccount() {
        let url = `${this.baseUrl}/${USER_PATH}`
        logger.debug(`getSubAccount url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: { [x: string]: any; }; }) => {
                //logger.debug(response);
                let accessibleSubAccounts = response.data['accessibleClients'];
                // logger.debug(accessibleSubAccounts);
                accessibleSubAccounts = lodash.sortBy(accessibleSubAccounts, ['id'])
                let subAccount = accessibleSubAccounts[0]
                return subAccount
            })
    }
    public async getSubAccountId() {
        let id = await this.getSubAccount()
            .then((response: { id: any }) => {
                return response.id
            })
        return id
    }

    public async getSubAccountAppId() {
        let appId = await this.getSubAccount()
            .then((response: any) => {
                return response.appId
            })
        return appId
    }

    public getAgentByUsername(agent_username: string): Promise<any> {
        let url = `${this.baseUrl}/${FETCH_AGENT_BY_USERNAME_PATH}/${agent_username}`
        logger.debug(`getAgentByUsername url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                // logger.debug(response.data)
                return response.data
            })
    }
    /**
     * return true if agent deletion is requested successfully
     * return fasle otherwise
     * @param agentUsername
     * @param agentLoginId
     */
    public requestAgentDeletion(agentUsername: string, agentLoginId: any) {
        let url = `${this.baseUrl}/${REMOVE_AGENT_PATH}`
        let deleteRequest = { 'username': agentUsername, 'loginId': agentLoginId };
        const options = this.prepareBaseOptions()
        return axios.post(url, deleteRequest, options)
            .then((response: { data: any }) => {
                return true
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return false
            })
    }

    prepareBaseOptions() {
        const cookieJar = this.masterCredential.cookieJar
        return {
            headers: { 'Authorization': this.masterCredential.token },
            jar: cookieJar,
            withCredentials: true
        };
    }
    prepareGetOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'GET' }
    }
    preparePostOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'POST' }
    }
    prepareDeleteOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'DELETE' }
    }

    /**
     * returns true if request submitted successfully
     * returns false otherwise
     * @param stationId
     */
    public requestStationDeletion(stationId: string) {
        let url = `${this.baseUrl}/${DELETE_STATION_PATH}/${stationId}`
        let options = this.prepareDeleteOptions(url)
        return axios(options)
            .then((response: any) => {
                return true
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return false
            })
    }
    /**
     * return station or undefined
     * @param subAccountId
     * @param agentUsername
     */
    public getStationForAgent(subAccountId: string, agentUsername: string) {
        let url = `${this.baseUrl}/${STATION_ONLY_PATH}${subAccountId}`
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((result: { data: any[] }) => {
                return result.data.find(element => element.username === agentUsername);
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return undefined
            })
    }
    /**
     * return agent or undefined
     * @param loginId
     */
    public getAgentByLoginId(loginId: number): Promise<any> {
        let url = `${this.baseUrl}/${FETCH_AGENT_ID_PATH}/${loginId}`
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })

    }
    public createAgentJob(agent: any) {
        let url = `${this.baseUrl}/${AGENT_JOB_PATH}`
        let options = this.prepareBaseOptions()
        return axios.post(url, agent, options)
            .then((result: any) => {
                return result
            })
    }
    /**
     * return extension number if successful.otherwise a negative status code
     * @param subAccountId
     * @param type
     */
    public getNextAvailableExtension(subAccountId: string, type: string): Promise<number> {
        let url = `${this.baseUrl}/${EXTENSION_PATH}/${subAccountId}/type/${type}`
        let options = this.preparePostOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return - error.response.status
            })
    }
    public createStationJob(station: object): Promise<number> {
        let url = `${this.baseUrl}/${STATION_JOB_PATH}`
        let options = this.prepareBaseOptions()
        return axios.post(url, station, options)
            .then((result: any) => {
                // logger.debug(result.data)
                return result
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return - error.response.status
            })
    }

    public getSubAccountAgentSkills(subAccountId: string) {
        let url = `${this.baseUrl}/${FETCH_SKILL_ID_PATH}${subAccountId}&skillType=AGENT`
        logger.debug(url)
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                return response
            })
    }

    makeSubAccountSubscriptionUrl(subAccountAppId: string) {
        return `${this.baseUrl}/${SUBSCRIPTION_PATH}?${SUB_ACCOUNT_KEY}=${subAccountAppId}`
    }
    public createDataSubscription(subAccountAppId: string, createSubscriptionRequest: any) {
        let url = this.makeSubAccountSubscriptionUrl(subAccountAppId)
        logger.debug(`createDataSubscription url = ${url}`)
        let options = this.prepareBaseOptions()
        return axios.post(url, createSubscriptionRequest, options)
            .then((response: any) => response.data as Subscription)
            .catch((error: any) => {
                logger.debug(error.response.status);
                return {}
            })
    }

    public getAllSubscriptions(subAccountAppId: string) {
        let url = this.makeSubAccountSubscriptionUrl(subAccountAppId)
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data as Subscription[])
    }
    public updateDataSubscription(subAccountAppId: string, subscriptionId: any, updateSubscriptionRequest: any) {
        let url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        let options = this.prepareBaseOptions()
        return axios.put(url, updateSubscriptionRequest, options)
            .catch((error: any) => error.response.status)
    }

    public deleteDataSubscription(subAccountAppId: string, subscriptionId: string) {
        let url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        let options = this.prepareDeleteOptions(url)
        return axios(options)
            .then((response: any) => response.data)
    }
    makeSubscriptionUrl(subAccountAppId: string, subscriptionId: string) {
        return `${this.baseUrl}/${SUBSCRIPTION_PATH}/${subscriptionId}?${SUB_ACCOUNT_KEY}=${subAccountAppId}`
    }
    public getDataSubscription(subAccountAppId: string, subscriptionId: string) {
        let url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        logger.debug(url)
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data as Subscription)
            .catch((error: any) => {
                logger.debug(error.response.status);
                return {}
            })
    }

    public printMasterCookieJar(): string {
        return JSON.stringify(this.masterCredential.cookieJar)
    }

}

