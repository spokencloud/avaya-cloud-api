import * as Constants from "./Constants";

export class Session {

    axios_instance: any;
    admin_username: string;
    admin_password: string;
    constructor(axios_instance: any, admin_username: string, admin_password: string) {
        this.axios_instance = axios_instance;
        this.admin_username = admin_username;
        this.admin_password = admin_password;
    }

    async createLoginRequest() {
        return this.axios_instance.post(
            '/login?username=' + this.admin_username
            + '&password=' + this.admin_password)
            .then((result: any) => {
                // console.log(result)
                return result
            })
    }

    async createQuestionRequest() {
        return this.axios_instance.get('/question/answer')
            .then((result: any) => {
                // console.log(result)
                return result
            })
    }

    getAnswer(rawQuestion: string) {
        let words = rawQuestion.split(' ')
        let answer = words[words.length - 1].split('?')[0]
        return answer
    }

    async createQuestionAnswerRequest(questionContainer: { [x: string]: any; }) {
        let questions = questionContainer['questions']

        let answers = []

        answers[0] = this.getAnswer(questions[0])
        answers[1] = this.getAnswer(questions[1])
        answers[2] = this.getAnswer(questions[2])

        let questionAnswer =
        {
            "username": this.admin_username,
            "questionAnswerPairs":
                [{ "question": questions[0], "answer": answers[0] },
                { "question": questions[1], "answer": answers[1] },
                { "question": questions[2], "answer": answers[2] }]
        }

        return this.axios_instance.post(Constants.USER_QUESTION_ANSWER_PATH, questionAnswer)
            .then((result: any) => {
                return result
            })
    }

    async login() {
        await this.createLoginRequest();
        let questionResponse = await this.createQuestionRequest();
        await this.createQuestionAnswerRequest(questionResponse.data)
    }

    async get(path: any) {
        return this.axios_instance.get(path)
    }

    async post(path: any, body?: any) {
        return this.axios_instance.post(path, body)
    }

    async delete(path: any) {
        return this.axios_instance.delete(path)
    }

    async put(path: any, body: any) {
        return this.axios_instance.put(path, body)
    }

    async getSubAccount() {
        return this.axios_instance.get('/user')
            .then((response: { data: { [x: string]: any; }; }) => {
                //console.log(response);
                let accessibleSubAccounts = response.data['accessibleClients'];
                // console.log(accessibleSubAccounts);
                // ensure we always get the same subAccount ordering
                accessibleSubAccounts = Constants.lodash.sortBy(accessibleSubAccounts, ['id'])
                let subAccount = accessibleSubAccounts[0]
                return subAccount
            })
    }
}

Constants.axiosCookieJarSupport(Constants.axios);
function createAxiosInstance(endpoint: string) {
    const cookieJar = new Constants.tough.CookieJar();
    const instance = Constants.axios.create({
        baseURL: endpoint,
        withCredentials: true,
        jar: cookieJar,
    });
    return instance
}

export function createSession(endpoint: string, admin_username: string, admin_password: string) {
    let axiosInstance = createAxiosInstance(endpoint);
    let session: Session = new Session(axiosInstance, admin_username, admin_password);
    return session
}

