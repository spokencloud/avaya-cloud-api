import { constants } from "buffer";
import { SkillCreateRequest } from "../src";
import { RestClient, STATION_GROUP_ID_NOT_EXISTS } from "../src/RestClient";

describe("RestClient.ts integration test", () => {

    // yangadmin1
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY";
    let restClient: RestClient;
    beforeEach(() => {
        restClient = new RestClient("http://localhost:8081", token);
    });

    test("getUserToken should retreive token ", async () => {

        const userToken = await restClient.getUserToken("yangadmin1");
        expect(userToken).toEqual(token);
    });
    test("getAndStoreUserStoken should store user token", async () => {
        await restClient.getAndStoreUserStoken("yangadmin1");
        expect(restClient.credentials.has("yangadmin1")).toBeTruthy();
        const { token: userToken } = restClient.credentials.get("yangadmin1") || { token: "" };
        expect(userToken).toEqual(token);
    });
    test("getAgentStationGroupId should return id if station groups exist", async () => {
        const clientIdWithAgentGroups = "2";
        const id = await restClient.getAgentStationGroupId(clientIdWithAgentGroups);
        expect(id).toEqual(1);
    });
    test("getAgentStationGroupId should return STATION_GROUP_ID_NOT_EXISTS if no station groups exist", async () => {
        const clientIdWithoutAgentStationGroups = "3";
        const id = await restClient.getAgentStationGroupId(clientIdWithoutAgentStationGroups);
        expect(id).toEqual(STATION_GROUP_ID_NOT_EXISTS);
    });
    test("getAgentStationGroupId should return id if no station groups exist", async () => {
        const clientIdNotExists = "11111";
        const id = await restClient.getAgentStationGroupId(clientIdNotExists);
        expect(id).toEqual(-403);
    });
    test("getSubAccount should return first subaccount", async () => {
        const subaccount = await restClient.getSubAccount();
        expect(subaccount.id).toEqual(1);
    });
    test("getAgentByUsername should return agent", async () => {
        const username = "super1";
        const agent = await restClient.getAgentByUsername(username);
        console.log(agent);
        expect(agent.username).toEqual(username);
    }, 10000);
    test("requestAgentDeletion should return false if agent1 can not be deleted", async () => {
        const username = "agent1";
        const submitted = await restClient.requestAgentDeletion(username, "7300001102");
        expect(submitted).toBeFalsy();
    });
    test("requestStationDeletion should return false if station id not exist", async () => {
        const stationId = "1";
        const submitted = await restClient.requestStationDeletion(stationId);
        expect(submitted).toBeFalsy();
    });
    test("getStationForAgent return undefined when not found", async () => {
        const subAccountId = "1";
        const username = "super1";
        const submitted = await restClient.getStationForAgent(subAccountId, username);
        expect(submitted).toBeUndefined();
    });
    test("getAgentByLoginId return undefined when not found", async () => {
        const loginId = 1;
        const submitted = await restClient.getAgentByLoginId(loginId).catch((error) => {
            return error.response.status;
        });
        expect(submitted).toEqual(404);
    });
    test("getAgentByLoginId return agent", async () => {
        const loginId = 7300001101;
        const submitted = await restClient.getAgentByLoginId(loginId);
        expect(submitted).toBeDefined();
        expect(submitted.loginId).toEqual(loginId.toString());
    });
    test("getNextAvailableExtension", async () => {
        const submitted = await restClient.getNextAvailableExtension("1", "AGENT");
        console.log(submitted);
        expect(submitted).toBeDefined();
    });
    test("getNextAvailableExtension for skill called correctly.", async () => {
        const submitted = await restClient.getNextAvailableNumber("1", "SKILL");
        console.log(submitted);
        expect(submitted).toBeDefined();
    });
    test("getSubAccountAgentSkills should return skills", async () => {
        // make sure client has some skills defined
        const skills = await restClient.getSubAccountAgentSkills("2");
        expect(skills.data.skillResponses["2"]).toBeDefined();
    });
    test("getSubAccountAgentSkills should return empty skills", async () => {
        // make sure client does not have skills
        const skills = await restClient.getSubAccountAgentSkills("22");
        expect(skills.data.skillResponses["2"]).toBeUndefined();
    });
    xtest("requestAgentDeletion should return false if ddksgy3dnr can not be deleted", async () => {
        const username = "ddksgy3dnr";
        const submitted = await restClient.requestAgentDeletion(username, "7300000100");
        expect(submitted).toBeTruthy();
    });

    test("createSkillJob with unavailable extension number should fail", async () => {
        const jobRequest: SkillCreateRequest = {
            name: "survey",
            number: 1030,
            clientId: 1,
            skillType: "AGENT",
            acwInterval: null,
            slaInSeconds: null,
            slaPercentage: null,
            announcementExtension: null,
        };
        const submitted = await restClient.createSkillJob(jobRequest);
        expect(submitted).toEqual(-500);
    });
    /*
     * Number needs to be in reserved state for this to work. Reserve number via AC or call
     * getNextAvaialbeNumber()
     */
    xtest("createSkillJob with reserved extension should work.", async () => {
        const reservedNumber = 103;
        const jobRequest: SkillCreateRequest = {
            name: "survey",
            /* needs to be reserved before hand */
            number: reservedNumber,
            clientId: 1,
            skillType: "AGENT",
            acwInterval: null,
            slaInSeconds: null,
            slaPercentage: null,
            announcementExtension: null,
        };
        const submitted = await restClient.createSkillJob(jobRequest);
        expect(submitted).toBe(200);
    });
});