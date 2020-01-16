import { anyString, instance, mock, reset, spy, verify, when } from "ts-mockito";
import { AgentClient } from "../src/AgentClient";
import { RestClient } from "../src/RestClient";

describe("AgentClient.ts tests with spied internal methods", () => {
    let agentClient: AgentClient;
    const restClientMock: RestClient = mock(RestClient);
    let restClientInstance: RestClient;

    beforeEach(() => {
        reset(restClientMock);
        restClientInstance = instance(restClientMock);
    });
    test("setDefaultSkillNumberIfNotExists should return true when default skill exists", async () => {
        agentClient = new AgentClient("1", restClientInstance);
        const agentClientSpy = spy(agentClient);
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(100);

        const result = await agentClient.setDefaultSkillNumberIfNotExists();
        expect(result).toBeTruthy();
        expect(agentClient.getDefaultSkillNumber()).toEqual(100);
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(1);
    });

    test("setDefaultSkillNumberIfNotExists should return true when create default skill succeeds", async () => {
        agentClient = new AgentClient("1", restClientInstance);
        const agentClientSpy = spy(agentClient);
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(undefined).thenResolve(100);
        when(agentClientSpy.createDefaultSkill()).thenResolve(true);

        const result = await agentClient.setDefaultSkillNumberIfNotExists();
        expect(result).toBeTruthy();
        expect(agentClient.getDefaultSkillNumber()).toEqual(100);
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(2);
    });

    test("setDefaultSkillNumberIfNotExists should return false when create default skill fails", async () => {
        agentClient = new AgentClient("1", restClientInstance);
        const agentClientSpy = spy(agentClient);
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(undefined);
        when(agentClientSpy.createDefaultSkill()).thenResolve(false);

        const result = await agentClient.setDefaultSkillNumberIfNotExists();

        expect(result).toBeFalsy();
        expect(agentClient.getDefaultSkillNumber()).toEqual(-1);
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(1);
    });
});