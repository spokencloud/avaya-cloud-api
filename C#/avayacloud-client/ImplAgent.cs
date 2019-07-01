﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AvayaCloudClient
{
    public class ImplAgent
    {
        public Session session;

        public ImplAgent(Session session)
        {
            this.session = session;
        }
        private class AgentStationGroup
        {
            public int ID;
            public string Name;
            public string Active;
        }
        private class Skill
        {
            public int ID;
            public string name;
        }
        public class Agent
        {
            [JsonProperty("username")]
            public string Username;
            [JsonProperty("firstName")]
            public string Firstname;
            [JsonProperty("lastName")]
            public string Lastname;
            [JsonProperty("password")]
            public string Password;
            [JsonProperty("avayaPassword")]
            public string AvayaPassword;
            [JsonProperty("loginId")]
            public string LoginID;
            [JsonProperty("clientId")]
            public int ClientID; // Subaccount ID
            [JsonProperty("agentStationGroupId")]
            public int AgentStationGroupID;
            [JsonProperty("securityCode")]
            public string SecurityCode;
            [JsonProperty("startDate")]
            public string StartDate;
            [JsonProperty("endDate")]
            public string EndDate;
            [JsonProperty("skillIds")]
            public List<int> SkillIds;
            [JsonProperty("supervisorId")]
            public long? supervisorId;

            public Agent(string username, string firstname, string lastname, string password,
                string avayaPassword, string loginID, int clientID, int agentStationGroupID,
                string securityCode, string startDate, string endDate, List<int> skillIds, long? supervisorId)
            {
                Username = username;
                Firstname = firstname;
                Lastname = lastname;
                Password = password;
                AvayaPassword = avayaPassword;
                LoginID = loginID;
                ClientID = clientID;
                AgentStationGroupID = agentStationGroupID;
                SecurityCode = securityCode;
                StartDate = startDate;
                EndDate = endDate;
                SkillIds = skillIds;
                this.supervisorId = supervisorId;
            }
        }
        private class Station
        {
            [JsonProperty("Id")]
            public int stationId;
            [JsonProperty("agentStationGroupId")]
            public int agentStationGroupId;
            [JsonProperty("clientId")]
            public int subAccountId;
            [JsonProperty("extension")]
            public string extension;
            [JsonProperty("name")]
            public string stationName;
            [JsonProperty("securityCode")]
            public string securityCode;
            [JsonProperty("username")]
            public string agentUsername;

            public Station(int agentStationGroupId, int subAccountId, string extension, string stationName, string securityCode, string agentUsername)
            {
                this.agentStationGroupId = agentStationGroupId;
                this.subAccountId = subAccountId;
                this.extension = extension;
                this.stationName = stationName;
                this.securityCode = securityCode;
                this.agentUsername = agentUsername;
            }
        }
        private class AgentDeleteRequest
        {
            [JsonProperty("username")]
            private string username;
            [JsonProperty("loginId")]
            private string loginId;

            public AgentDeleteRequest(string username, string loginId)
            {
                this.username = username;
                this.loginId = loginId;
            }
        }
        public async Task<Agent> createAgent(string agent_username, string agent_password)
        {
            await session.creatLoginRequest();
            List<string> questions = await session.createQuestionRequest();
            await session.createQuestionAnswerRequest(questions);
            int subAccountId = await session.getSubAccountId();
            int agentStationGroupId = await this.getAgentStationGroupId(subAccountId);
            string agentLoginId = await this.generateExtension(subAccountId, "AGENT");
            List<int> skillIds = await this.getSkillIds(subAccountId);
            await sendCreateAgentRequest(subAccountId, agent_username, agent_password, agentStationGroupId, agentLoginId, skillIds);
            Console.WriteLine("Waiting for Agent creation to complete");
            bool agentCreated = await waitForAgentCreation(agent_username);
            Console.WriteLine(agentCreated ? "Agent creation " + agent_username + " successfull" : "Agent creation failed");
            string nextExtension = await generateExtension(subAccountId, "STATION");
            await sendCreateStationRequest(agentStationGroupId, subAccountId, nextExtension, agent_username);
            Console.WriteLine("Waiting for Station creation to complete");
            bool stationCreated = await waitForStationCreation(subAccountId, agent_username);
            await Task.Delay(2000);
            Agent createdAgent = null;
            if (agentCreated && stationCreated)
                createdAgent = await this.getAgent(agent_username);
            return createdAgent;
        }
        private async Task<int> getAgentStationGroupId(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync("/spokenAbc/agentStationGroups/client/" + subAccountId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
            List<AgentStationGroup> agentStationGroups = JsonConvert.DeserializeObject<IEnumerable<AgentStationGroup>>(responseJson).ToList();
            //List<AgentStationGroup> agentStationGroups = JObject.Parse(responseJson).ToObject<List<AgentStationGroup>>();
            var sortedAgentStationGroups = agentStationGroups.OrderBy(a => a.ID).ToList();
            return sortedAgentStationGroups[0].ID;
        }

        private async Task<string> generateExtension(int subAccountId, string type)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.PostAsync("/spokenAbc/extensions/next/" + subAccountId + "/type/" + type, null);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Console.Write("Selected extension for type " + type + ":" + responseJson + "\n");
            return responseJson;
        }
        private async Task<List<int>> getSkillIds(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync("/spokenAbc/skills/multiClientSkills?clientIds=" + subAccountId + "&skillType=AGENT");
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Dictionary<string, List<Skill>> subAccountSkills = JObject.Parse(responseJson).SelectToken("skillResponses").ToObject<Dictionary<string, List<Skill>>>();
            List<Skill> skills = subAccountSkills.Values.SelectMany(s => s).ToList();
            List<int> skillIds = skills.Select(s => s.ID).ToList();
            return skillIds;
        }
        private async Task sendCreateAgentRequest(int subAccountId, string agent_username, string agent_password,
            int agentStationGroupId,
            string agentLoginId, List<int> skillIds)
        {
            string securityCode = session.generateSecurityCode(agentLoginId);
            string avayaPassword = session.generateAvayaPassword(agentLoginId);
            //DateTime startDate = DateTime.ParseExact("2019/03/21", "yyyy/MM/dd", CultureInfo.InvariantCulture);
            //DateTime endDate = DateTime.ParseExact("2038/01/01", "yyyy/MM/dd", CultureInfo.InvariantCulture);
            Agent agent = new Agent(agent_username, "generated", "agent", agent_password, avayaPassword, agentLoginId, subAccountId,
                agentStationGroupId, securityCode, "2019-06-21", "2038-01-01", skillIds, 0);
            HttpResponseMessage httpResponseMessage = await Session.client.PostAsJsonAsync("/spokenAbc/jobs/agents", agent);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
        }
        private async Task<bool> waitForAgentCreation(string agent_username)
        {

            for (int i = 0; i < Session.MAX_RETRY; i++)
            {
                HttpResponseMessage httpResponseMessage = await getAgentOnly(agent_username);
                if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.OK))
                {
                    return true;
                }
                else
                {
                    await Task.Delay(Session.INTERVAL_IN_MILLIS);
                }
            }
            return false;

        }
        private async Task<HttpResponseMessage> getAgentOnly(string agent_username)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync("/spokenAbc/agents/username/" + agent_username);
            return httpResponseMessage;
        }
        private async Task sendCreateStationRequest(int agentStationGroupId, int subAccountId, string stationExtension, string agent_username)
        {
            string extensionSecurityCode = session.generateSecurityCode(stationExtension);
            Station station = new Station(agentStationGroupId, subAccountId, stationExtension, "generated_station", extensionSecurityCode, agent_username);
            HttpResponseMessage httpResponseMessage = await Session.client.PostAsJsonAsync("/spokenAbc/jobs/stations", station);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
        }
        private async Task<bool> waitForStationCreation(int subAccountId, string agent_username)
        {
            for (int i = 0; i < Session.MAX_RETRY; i++)
            {
                try
                {
                    HttpResponseMessage httpResponseMessage = await getStationOnly(subAccountId);
                    var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                    List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
                    Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
                    if (createdStation != null)
                    {
                        Console.WriteLine("Station for Agent " + agent_username + "has been created");
                        return true;
                    }
                }
                catch (Exception e)
                {
                    //Console.Write(e);
                    await Task.Delay(Session.INTERVAL_IN_MILLIS);
                }

            }
            return false;

        }
        private async Task<HttpResponseMessage> getStationOnly(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync("/spokenAbc/stations?clientId=" + subAccountId);
            return httpResponseMessage;
        }
        public async Task<Agent> getAgent(string agent_username)
        {
            await session.creatLoginRequest();
            List<string> questions = await session.createQuestionRequest();
            await session.createQuestionAnswerRequest(questions);
            Agent createdAgent = null;
            HttpResponseMessage httpResponseMessage = null; ;
            try
            {
                httpResponseMessage = await this.getAgentOnly(agent_username);
                var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                createdAgent = JObject.Parse(responseJson).ToObject<Agent>();
            }
            catch (Exception e)
            {
                if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.NotFound))
                {
                    Console.WriteLine("Agent " + agent_username + "Not found");
                }
                else
                {
                    throw e;
                }
            }
            int subAccountId = await session.getSubAccountId();
            Station createdStation = null;
            try
            {
                httpResponseMessage = await this.getStationOnly(subAccountId);
                var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
                createdStation = agentStations.Single(a => a.agentUsername == agent_username);

            }
            catch (Exception e)
            {
                if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.NotFound))
                {
                    Console.WriteLine("Station for agent  " + agent_username + "Not found");
                }
                else
                {
                    throw e;
                }
            }
            if (createdStation != null) Console.WriteLine("Agent exist with username " + agent_username + " and station " + createdStation.stationName);
            return createdAgent;
        }
        public async Task deleteAgent(string agent_username)
        {
            await session.creatLoginRequest();
            List<string> questions = await session.createQuestionRequest();
            await session.createQuestionAnswerRequest(questions);
            int subAccountId = await session.getSubAccountId();
            HttpResponseMessage httpResponseMessage = await getStationOnly(subAccountId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
            Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
            if (createdStation != null)
            {
                await this.deleteStationOnly(createdStation.stationId);
                Console.WriteLine("Waiting for Station deletion to complete");
                bool deleted = await this.waitForStationDeletion(subAccountId, agent_username);
                Console.WriteLine(deleted ? "Station with agent username " + agent_username + " has been deleted" : "Station with username " + agent_username + " has not been deleted");
            }
            else
            {
                Console.WriteLine("Station associated with " + agent_username + " has already been deleted");
            }
            try
            {
                httpResponseMessage = await this.getAgentOnly(agent_username);
                responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                Agent existingAgent = JObject.Parse(responseJson).ToObject<Agent>();
                await this.deleteAgentOnly(existingAgent.Username, existingAgent.LoginID);
                Console.WriteLine("Waiting for Agent deletion to complete");
                bool agentDeleted = await this.waitForAgentDeletion(existingAgent.Username);
                Console.WriteLine(agentDeleted ? "Agent with username " + agent_username + " has been deleted" : "Agent with username " + agent_username + " has not been deleted");
            }
            catch (Exception e)
            {
                //Console.Write(e);
                Console.WriteLine("Agent with username " + agent_username + " has been deleted already");
            }
        }
        private async Task deleteStationOnly(int stationId)
        {
            HttpResponseMessage httpResponseMessage = await Session.client.DeleteAsync("/spokenAbc/jobs/stations/" + stationId);

        }
        private async Task deleteAgentOnly(string agent_username, string agentLoginId)
        {
            AgentDeleteRequest agentDeleteRequest = new AgentDeleteRequest(agent_username, agentLoginId);
            HttpResponseMessage httpResponseMessage = await Session.client.PostAsJsonAsync("/spokenAbc/agents/removeAgent", agentDeleteRequest);

        }
        private async Task<bool> waitForStationDeletion(int subAccountId, string agent_username)
        {
            HttpResponseMessage httpResponseMessage = null;
            for (int i = 0; i < Session.MAX_RETRY; i++)
            {
                try
                {
                    httpResponseMessage = await getStationOnly(subAccountId);
                    var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                    List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
                    Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
                    if (createdStation != null)
                    {
                        await Task.Delay(Session.INTERVAL_IN_MILLIS);
                    }
                }
                catch (Exception e)
                {
                    if (e.Message == "Sequence contains no matching element")
                    {
                        return true;
                    }
                }

            }
            return false;

        }
        private async Task<bool> waitForAgentDeletion(string agent_username)
        {

            HttpResponseMessage httpResponseMessage = null;
            for (int i = 0; i < Session.MAX_RETRY; i++)
            {
                try
                {
                    httpResponseMessage = await getAgentOnly(agent_username);
                    if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.OK))
                    {
                        await Task.Delay(Session.INTERVAL_IN_MILLIS);
                    }
                    else if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.NotFound))
                    {
                        return true;
                    }
                }
                catch
                {
                    if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.NotFound))
                    {
                        Console.WriteLine("Agent with username " + agent_username + " has been deleted");
                        return true;
                    }
                }
            }
            Console.WriteLine("Agent with username " + agent_username + "  couldn't be deleted");
            return false;

        }

    }
}
