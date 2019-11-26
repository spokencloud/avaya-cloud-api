import { CookieJar } from "tough-cookie";
import { STATION_GROUP_PATH, USER_PATH, FETCH_AGENT_BY_USERNAME_PATH, lodash } from "./Constants";
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
    prepareGetOptions(url: string) {
        const cookieJar = this.masterCredential.cookieJar
        const options = {
            method: 'GET',
            headers: { 'Authorization': this.masterCredential.token },
            url,
            jar: cookieJar,
            withCredentials: true
        };
        return options
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
                // ensure we always get the same subAccount ordering
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
    public printMasterCookieJar(): string {
        return JSON.stringify(this.masterCredential.cookieJar)
    }

}

