import { CookieJar } from "tough-cookie";
import { STATION_GROUP_PATH, USER_PATH, REMOVE_AGENT_PATH, FETCH_AGENT_BY_USERNAME_PATH,FETCH_AGENT_ID_PATH, DELETE_STATION_PATH, STATION_ONLY_PATH, lodash } from "./Constants";
export const axios = require('axios').default;
export const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
export const STATION_GROUP_ID_NOT_EXISTS = -1
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
    getUserToken(username: string) {
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
        console.log(`storing token for ${username}`)
        this.storeUserToken(username, userToken)

    }

    /**
     * Caller should await for the method to finish. When call is successful, a number greater than 0 will be returned.
     * When subAccountId has no station group defined, -1 will be returned;
     * For other errors, a negative value of http status code will be returned;
     * @param subAccountId 
     */
    public async getAgentStationGroupId(subAccountId: string) {
        let url = `${this.baseUrl}/${STATION_GROUP_PATH}/${subAccountId}`
        console.log(`getAgentStationGroupId url is ${url}`)
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
    public async getSubAccount() {
        let url = `${this.baseUrl}/${USER_PATH}`
        console.log(`getSubAccount url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: { [x: string]: any; }; }) => {
                //console.log(response);
                let accessibleSubAccounts = response.data['accessibleClients'];
                // console.log(accessibleSubAccounts);
                accessibleSubAccounts = lodash.sortBy(accessibleSubAccounts, ['id'])
                let subAccount = accessibleSubAccounts[0]
                return subAccount
            })
    }
    public async getAgentByUsername(agent_username: string) {
        let url = `${this.baseUrl}/${FETCH_AGENT_BY_USERNAME_PATH}/${agent_username}`
        console.log(`getAgentByUsername url is ${url}`)
        const options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                // console.log(response.data)
                return response.data
            })
    }
    /**
     * return true if agent deletion is requested successfully
     * return fasle otherwise
     * @param agentUsername 
     * @param agentLoginId 
     */
    public async requestAgentDeletion(agentUsername: string, agentLoginId: any) {
        let url = `${this.baseUrl}/${REMOVE_AGENT_PATH}`
        let deleteRequest = { 'username': agentUsername, 'loginId': agentLoginId };
        const options = this.prepareBaseOptions()
        return axios.post(url, deleteRequest, options).then((response: { data: any }) => {
            return true
        })
            .catch((error: any) => {
                console.log(error.response.status)
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

    prepareDeleteOptions(url: string ){
        return { ...this.prepareBaseOptions(), url, method: 'DELETE' }
    }

    /**
     * returns true if request submitted successfully
     * returns false otherwise
     * @param stationId
     */
    public async requestStationDeletion(stationId: string) {
        let url = `${this.baseUrl}/${DELETE_STATION_PATH}/${stationId}`
        let options = this.prepareDeleteOptions(url)
        return axios(options)
            .then((response: any) => {
                return true
            })
            .catch((error: any) => {
                console.log(error.response.status)
                return false
            })
    }
    /**
     * return station or undefined
     * @param subAccountId
     * @param agentUsername 
     */
    public async getStationForAgent(subAccountId: string, agentUsername: string) {
        let url = `${this.baseUrl}/${STATION_ONLY_PATH}${subAccountId}`
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((result: { data: any[] }) => {
                return result.data.find(element => element.username === agentUsername);
            })
            .catch((error: any) => {
                console.log(error.response.status)
            })
    }
    /**
     * return agent or undefined
     * @param loginId 
     */
    public async getAgentByLoginId(loginId: string) {
        let url = `${this.baseUrl}/${FETCH_AGENT_ID_PATH}/${loginId}`
        let options = this.prepareGetOptions(url)
        return axios(options)
            .then((response: { data: any }) => {
                return response.data
            })
            .catch((error: any) => {
                console.log(error.response.status)
            })
    }
    public printMasterCookieJar(): string {
        return JSON.stringify(this.masterCredential.cookieJar)
    }

}

