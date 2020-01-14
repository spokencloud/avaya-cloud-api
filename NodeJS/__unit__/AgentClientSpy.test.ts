import { AgentClient } from "../src/AgentClient";
import { RestClient } from "../src/RestClient";
import { mock, when, anyString, reset, instance, verify, spy } from "ts-mockito";


describe("AgentClient.ts tests with spied internal methods", () => {
    let agentClient: AgentClient;
    let restClientMock: RestClient = mock(RestClient)
    let restClientInstance: RestClient

    beforeEach(() => {
        reset(restClientMock)
        restClientInstance = instance(restClientMock)

    });
    test("setDefaultSkillNumberIfNotExists should return true when default skill exists", async () => {
        agentClient = new AgentClient("1", restClientInstance)
        let agentClientSpy = spy(agentClient)
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(100)

        let result = await agentClient.setDefaultSkillNumberIfNotExists()
        expect(result).toBeTruthy()
        expect(agentClient.getDefaultSkillNumber()).toEqual(100)
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(1)
    })

    test("setDefaultSkillNumberIfNotExists should return true when create default skill succeeds", async () => {
        agentClient = new AgentClient("1", restClientInstance)
        let agentClientSpy = spy(agentClient)
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(undefined).thenResolve(100)
        when(agentClientSpy.createDefaultSkill()).thenResolve(true)

        let result = await agentClient.setDefaultSkillNumberIfNotExists()
        expect(result).toBeTruthy()
        expect(agentClient.getDefaultSkillNumber()).toEqual(100)
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(2)
    })

    test("setDefaultSkillNumberIfNotExists should return false when create default skill fails", async () => {
        agentClient = new AgentClient("1", restClientInstance)
        let agentClientSpy = spy(agentClient)
        // set up spy
        when(agentClientSpy.fetchDefaultSkillNumber()).thenResolve(undefined)
        when(agentClientSpy.createDefaultSkill()).thenResolve(false)

        let result = await agentClient.setDefaultSkillNumberIfNotExists()

        expect(result).toBeFalsy()
        expect(agentClient.getDefaultSkillNumber()).toEqual(-1)
        verify(agentClientSpy.fetchDefaultSkillNumber()).times(1)
    })
})