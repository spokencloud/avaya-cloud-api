import { CookieJar } from 'tough-cookie'
import {
    AGENT_JOB_PATH, DELETE_STATION_PATH, EXTENSION_PATH, FETCH_AGENT_BY_USERNAME_PATH, FETCH_AGENT_ID_PATH, FETCH_AUX_CODE_WITH_SUBACCOUNT_APP_ID, FETCH_AUX_CODES, FETCH_AUXCODE_BASE,
    FETCH_EFFECTIVE_AUX_CODES, FETCH_SKILL_ID_PATH, lodash, log4js, NUMBER_PATH,
    REMOVE_AGENT_PATH, SKILL_JOB_PATH, STATION_GROUP_PATH, STATION_JOB_PATH, STATION_ONLY_PATH, SUB_ACCOUNT_KEY,
    SUBSCRIPTION_PATH, USER_PATH,
} from './Constants'
import { SkillCreateRequest, Subscription } from './models'
export const STATION_GROUP_ID_NOT_EXISTS = -1

const axios = require('axios').default
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default
const logger = log4js.getLogger('RestClient')

axiosCookieJarSupport(axios)

interface Credential {
    token: string
    cookieJar: CookieJar
}

export class RestClient {
    public masterCredential: Credential
    public credentials: Map<string, Credential>

    private baseUrl: string
    constructor(baseUrl: string, masterToken: string) {
        this.baseUrl = baseUrl
        const masterCookieJar = new CookieJar()
        this.masterCredential = { token: `Bearer ${masterToken}`, cookieJar: masterCookieJar }
        this.credentials = new Map()
    }
    public getUser() {
        const url = `${this.baseUrl}/user`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data)
    }
    public getUserToken(username: string) {
        const url = `${this.baseUrl}/user/${username}/token`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                return response.data
            })
    }
    public storeUserToken(username: string, userToken: string) {
        const credential = { token: userToken, cookieJar: new CookieJar() }
        this.credentials.set(username, credential)
    }
    public async getAndStoreUserStoken(username: string) {
        const userToken = await this.getUserToken(username)
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
        const url = `${this.baseUrl}/${STATION_GROUP_PATH}/${subAccountId}`
        logger.debug(`getAgentStationGroupId url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                let agentStationGroups = response.data
                if (agentStationGroups.length === 0) {
                    return STATION_GROUP_ID_NOT_EXISTS
                }
                // ensure we always get the same subAccount ordering
                agentStationGroups = lodash.sortBy(agentStationGroups, ['id'])
                return agentStationGroups[0].id
            })
            .catch((error: any) => {
                return - error.response.status
            })
    }
    public getSubAccount() {
        const url = `${this.baseUrl}/${USER_PATH}`
        logger.debug(`getSubAccount url is ${url}`)
        console.log(`getSubAccount url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: { [x: string]: any; }; }) => {
                let accessibleSubAccounts = response.data.accessibleClients
                accessibleSubAccounts = lodash.sortBy(accessibleSubAccounts, ['id'])
                const subAccount = accessibleSubAccounts[0]
                return subAccount
            })
    }
    public async getSubAccountId() {
        const id = await this.getSubAccount()
            .then((response: { id: any }) => {
                return response.id
            })
        console.log(`id is ${id}`)
        return id
    }

    public async getSubAccountAppId() {
        const appId = await this.getSubAccount()
            .then((response: any) => {
                return response.appId
            })
        return appId
    }

    public getAgentByUsername(agent_username: string): Promise<any> {
        const url = `${this.baseUrl}/${FETCH_AGENT_BY_USERNAME_PATH}/${agent_username}`
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
        const url = `${this.baseUrl}/${REMOVE_AGENT_PATH}`
        const deleteRequest = { username: agentUsername, loginId: agentLoginId }
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

    public prepareBaseOptions() {
        const cookieJar = this.masterCredential.cookieJar
        return {
            headers: { Authorization: this.masterCredential.token },
            jar: cookieJar,
            withCredentials: true,
        }
    }
    public prepareGetOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'GET' }
    }
    public preparePostOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'POST' }
    }
    public prepareDeleteOptions(url: string) {
        return { ...this.prepareBaseOptions(), url, method: 'DELETE' }
    }

    /**
     * returns true if request submitted successfully
     * returns false otherwise
     * @param stationId
     */
    public requestStationDeletion(stationId: string) {
        const url = `${this.baseUrl}/${DELETE_STATION_PATH}/${stationId}`
        const options = this.prepareDeleteOptions(url)
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
        const url = `${this.baseUrl}/${STATION_ONLY_PATH}${subAccountId}`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((result: { data: any[] }) => {
                return result.data.find((element) => element.username === agentUsername)
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
        const url = `${this.baseUrl}/${FETCH_AGENT_ID_PATH}/${loginId}`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })

    }
    public createAgentJob(agent: any) {
        const url = `${this.baseUrl}/${AGENT_JOB_PATH}`
        const options = this.prepareBaseOptions()
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
        const url = `${this.baseUrl}/${EXTENSION_PATH}/${subAccountId}/type/${type}`
        return this.getByUrl(url)
    }
    public getNextAvailableNumber(subAccountId: string, type: string): Promise<number> {
        const url = `${this.baseUrl}/${NUMBER_PATH}/${subAccountId}/type/${type}`
        return this.getByUrl(url)
    }
    public createStationJob(station: object): Promise<number> {
        const url = `${this.baseUrl}/${STATION_JOB_PATH}`
        const options = this.prepareBaseOptions()
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
    public createSkillJob(skill: SkillCreateRequest): Promise<number> {
        const url = `${this.baseUrl}/${SKILL_JOB_PATH}`
        logger.debug(`createSkillJob url = ${url}`)
        const options = this.prepareBaseOptions()
        return axios.post(url, skill, options)
            .then((result: any) => {
                // logger.debug(result.data)
                return result.status
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return - error.response.status
            })
    }
    public getSubAccountAgentSkills(subAccountId: string): Promise<any> {
        const url = `${this.baseUrl}/${FETCH_SKILL_ID_PATH}${subAccountId}&skillType=AGENT`
        logger.debug(url)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => {
                return response
            })
    }

    public makeSubAccountSubscriptionUrl(subAccountAppId: string) {
        return `${this.baseUrl}/${SUBSCRIPTION_PATH}?${SUB_ACCOUNT_KEY}=${subAccountAppId}`
    }
    /**
     * create data subscription given a valid subAccountAppId and request.  Returns a subscription response on success
     * or empty object on error
     *
     * @param subAccountAppId
     * @param createSubscriptionRequest
     */
    public createDataSubscription(subAccountAppId: string, createSubscriptionRequest: any) {
        const url = this.makeSubAccountSubscriptionUrl(subAccountAppId)
        logger.debug(`createDataSubscription url = ${url}`)
        const options = this.prepareBaseOptions()
        return axios.post(url, createSubscriptionRequest, options)
            .then((response: any) => response.data as Subscription)
            .catch((error: any) => {
                logger.debug(error.response.status)
                return {}
            })
    }

    public getAllSubscriptions(subAccountAppId: string) {
        const url = this.makeSubAccountSubscriptionUrl(subAccountAppId)
        logger.debug(`getAllSubscriptions url = ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data as Subscription[])
    }
    /**
     *
     * @param subAccountAppId
     * @param subscriptionId
     * @param updateSubscriptionRequest
     */
    public updateDataSubscription(subAccountAppId: string, subscriptionId: any, updateSubscriptionRequest: any) {
        const url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        const options = this.prepareBaseOptions()
        return axios.put(url, updateSubscriptionRequest, options)
            .then((response: any) => response.data as Subscription)
            .catch((error: any) => error.response.status)
    }
    /**
     * return status code when success or negative status code in error
     * @param subAccountAppId
     * @param subscriptionId usually it is a uuid
     */
    public deleteDataSubscription(subAccountAppId: string, subscriptionId: string): number {
        const url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        logger.debug(`deleteDataSubscription url = ${url}`)
        const options = this.prepareDeleteOptions(url)
        return axios(options)
            .then((response: any) => response.status)
            .catch((error: any) => {
                logger.error(error)
                return -error.response.status
            })
    }
    public makeSubscriptionUrl(subAccountAppId: string, subscriptionId: string) {
        return `${this.baseUrl}/${SUBSCRIPTION_PATH}/${subscriptionId}?${SUB_ACCOUNT_KEY}=${subAccountAppId}`
    }
    /**
     * get Subscription by id
     * @param subAccountAppId
     * @param subscriptionId
     */
    public getDataSubscription(subAccountAppId: string, subscriptionId: string) {
        const url = this.makeSubscriptionUrl(subAccountAppId, subscriptionId)
        logger.debug(url)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: any) => response.data as Subscription)
            .catch((error: any) => {
                logger.debug(error.response.status)
                return {}
            })
    }

    public printMasterCookieJar(): string {
        return JSON.stringify(this.masterCredential.cookieJar)
    }

    public getAuxCodesBySubaccountId(subAccountId: string): Promise<any> {
        const url = `${this.baseUrl}/${FETCH_AUXCODE_BASE}/${subAccountId}/${FETCH_AUX_CODES}`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
    }

    public getEffectiveAuxCodesBySubaccountId(subAccountId: string): Promise<any> {
        const url = `${this.baseUrl}/${FETCH_AUXCODE_BASE}/${subAccountId}/${FETCH_EFFECTIVE_AUX_CODES}`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
    }

    public async getAUXCodeForEffectiveAppId() {
        const subAccountAppId = await this.getSubAccountAppId()
        const url = `${this.baseUrl}/${FETCH_AUXCODE_BASE}/${subAccountAppId}/${FETCH_AUX_CODE_WITH_SUBACCOUNT_APP_ID}`
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
    }
    protected getByUrl(url: string): Promise<number> {
        logger.debug(`url=${url}`)
        const options = this.preparePostOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
            .catch((error: any) => {
                logger.debug(error.response.status)
                return - error.response.status
            })
    }

}
