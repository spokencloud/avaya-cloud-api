import tough, { CookieJar } from "tough-cookie";

export const axios = require('axios').default;
export const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;

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
        const cookieJar = this.masterCredential.cookieJar
        const options = {
            method: 'GET',
            headers: { 'Authorization': this.masterCredential.token },
            url,
            jar: cookieJar,
            withCredentials: true
        };
        return axios(options)
            .then((response: any) => response.data)
    }
    getUserToken(username: string) {
        let url = `${this.baseUrl}/user/${username}/token`
        const cookieJar = this.masterCredential.cookieJar
        const options = {
            method: 'GET',
            headers: { 'Authorization': this.masterCredential.token },
            url,
            jar: cookieJar,
            withCredentials: true
        };
        return axios(options)
            .then((response: any) => {
                return response.data
            })
    }
    storeUserToken(username: string, userToken: string) {
        let credential = {token:userToken, cookieJar: new CookieJar()}
        this.credentials.set(username, credential)
    }
    public async getAndStoreUserStoken(username:string){
        if(this.credentials.has(username)){
            return;
        }
        try {
            let userToken = await this.getUserToken(username)
            if(!!userToken){
                console.log(`storing token for ${username}`)
                this.storeUserToken(username, userToken)
            } else {
                throw new Error("token does not exists")
            }
        } catch (error) {
            throw error
        }
    }
    public printMasterCookieJar(): string {
        return JSON.stringify(this.masterCredential.cookieJar)
    }

}

