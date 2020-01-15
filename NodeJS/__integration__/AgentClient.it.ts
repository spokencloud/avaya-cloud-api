import { AgentClient, createAgentClient } from "../src/AgentClient";

import { log4js } from "../src/Constants";

const rootLogger = log4js.getLogger();
rootLogger.level = "debug";
rootLogger.debug("Starting AgentClient Integration Test");

describe("AgentClient", () => {
   // yangadmin1
   const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY";
   let agentClient: AgentClient;

   beforeEach(async () => {
      agentClient = await createAgentClient("http://localhost:8081", token);
   });
   test("waitForStationDeletion should return true", async () => {
      const result = await agentClient.waitForStationDeletion("agentNotExists");
      expect(result).toBeTruthy();
   });
   test("waitForAgentDeletion should return true", async () => {
      const result = await agentClient.waitForAgentDeletion("agentNotExists");
      expect(result).toBeTruthy();
   });
   test("getSkillIds should return skillIds", async () => {
      const skillIds = await agentClient.getSkillIds();
      console.log(skillIds);
      expect(skillIds.length).toBeGreaterThan(0);
   });
   test("getSkillNumbers should return skillNumbers", async () => {
      const skillNumbers = await agentClient.getSkillNumbers();
      expect(skillNumbers.length).toBeGreaterThan(0);
   });
   xtest("existsAgentByLoginId should return true when agent exists", async () => {
      const exists = await agentClient.existsAgentByLoginId(7300000100);
      expect(exists).toBeTruthy();
   });
   xtest("waitForAgentCreation should return true when agent exists", async () => {
      const exists = await agentClient.waitForAgentCreation(7300000100);
      expect(exists).toBeTruthy();
   });
   test.only("waitForDefaultSkillCreation should return true", async () => {
      const exists = await agentClient.waitForDefaultSkillCreation();
      expect(exists).toBeTruthy();
      expect(agentClient.getDefaultSkillNumber()).toBeGreaterThan(0);
   });
   xtest("waitForAgentCreation should return false when agent does not exists", async () => {
      const exists = await agentClient.waitForAgentCreation(3337300000100);
      expect(exists).toBeFalsy();
   });
   xtest("existsAgentByUsername returns when agent exists by username", async () => {
      const exists = await agentClient.existsAgentByUsername("ddksgy3dnr");
      expect(exists).toBeTruthy();
   });
   xtest("existsStationForAgent should return false when agent has no station", async () => {
      const exists = await agentClient.existsStationForAgent("ddksgy3dnr");
      expect(exists).toBeFalsy();
   });
   xtest("getAgent should return agent and station", async () => {
      const agentAndStation = await agentClient.getAgent("ddksgy3dnr");
      expect(agentAndStation.agent).toBeDefined();
      expect(agentAndStation.station).toEqual({});
   });
   xtest("createStationIfNotExists should return true", async () => {
      const result = await agentClient.createStationIfNotExists("ddksgy3dnr", "2");
      expect(result).toBeTruthy();
   });
   test("getUserToken should return token", async () => {
      const result = await agentClient.getUserToken("yangadmin1");
      expect(result).toEqual(token);
   });
   test("createDefaultSkill should return true.", async () => {
      const result = await agentClient.createDefaultSkill();
      expect(result).toBeTruthy();
   });
   test("getDefaultSkill should return skillId", async () => {
      const result = await agentClient.fetchDefaultSkillNumber();
      console.log(`skillNumber of default skill = ${result}`);
      expect(result).toBeGreaterThan(100);
   });
});