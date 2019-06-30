using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AvayaCloudClient
{
    public class Session
    {
        private static int INTERVAL_IN_MILLIS = 10000;
        private static int MAX_RETRY = 5;
        static HttpClient client;
        public string endpoint;
        public string admin_username;
        public string admin_password;
        private class QApair
        {
            public string question;
            public string answer;

            public QApair(string question, string answer)
            {
                this.question = question;
                this.answer = answer;
            }
        }
        private class QArequest
        {
            public string username;
            public QApair[] questionAnswerPairs;

        }
        private class SubAccount
        {
            public int ID;
            public string Name;
            public string Code;
            public string AccountSize;
            public string AccountID;
            public string AppID;
            public string[] Regions;

            
        }
        private class Skill
        {
            public int ID;
            public string name;
        }
        private class AgentStationGroup
        {
            public int ID;
            public string Name;
            public string Active;
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
        public Session(string endpoint, string username, string password)
        {
            this.endpoint = endpoint;
            this.admin_username = username;
            this.admin_password = password;
        }
        public void creatSessionParameters()
        {
            CookieContainer cookieContainer = new CookieContainer();
            HttpClientHandler handler = new HttpClientHandler();
            handler.CookieContainer = cookieContainer;
            handler.UseCookies = true;
            client = new HttpClient(handler);
            client.BaseAddress = new Uri(endpoint);
        }
        private async Task creatLoginRequest()
        {

            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("User-Agent", "avayacloud-client");
            var formContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "password"),
                new KeyValuePair<string, string>("username", this.admin_username),
                new KeyValuePair<string, string>("password", admin_password),
            });
            HttpResponseMessage httpResponseMessage = await client.PostAsync("/login", formContent);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Console.Write("Login to Avaya cloud\n");
            //Console.Write(responseJson);


        }
        private async Task<List<string>> createQuestionRequest()
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/question/answer");
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Console.Write("Agent security questions\n" + "----------------------\n" + responseJson + "\n-------------------\n");
            List<string> questions = JObject.Parse(responseJson).SelectToken("questions").ToObject<List<string>>();
            return questions;
        }
        private string getAnswer(string question)
        {
            string[] words = question.Split(' ');
            string answer = words[words.Length - 1].Trim('?');
            return answer;
        }
        private async Task createQuestionAnswerRequest(List<string> questions)
        {
            string[] answers = new string[] { getAnswer(questions[0]), getAnswer(questions[1]), getAnswer(questions[2]) };
            QArequest qarequest = new QArequest();
            qarequest.username = this.admin_username;
            QApair[] qapairs = new QApair[3];
            qapairs[0] = new QApair(questions[0], answers[0]);
            qapairs[1] = new QApair(questions[1], answers[1]);
            qapairs[2] = new QApair(questions[2], answers[2]);
            qarequest.questionAnswerPairs = qapairs; 
            HttpResponseMessage httpResponseMessage = await client.PostAsJsonAsync("/user/question/answer", qarequest);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Console.Write("Security questions answered correctly? " +responseJson + "\n");
        }
        public async Task<Agent> createAgent(string agent_username, string agent_password)
        {
            await this.creatLoginRequest();
            List<string> questions = await this.createQuestionRequest();
            await this.createQuestionAnswerRequest(questions);
            int subAccountId = await this.getSubAccountId();
            int agentStationGroupId = await this.getAgentStationGroupId(subAccountId);
            string agentLoginId = await this.generateExtension(subAccountId, "AGENT");
            List<int> skillIds =  await this.getSkillIds(subAccountId);
            await sendCreateAgentRequest(subAccountId, agent_username, agent_password, agentStationGroupId, agentLoginId, skillIds);
            Console.WriteLine("Waiting for Agent creation to complete");
            bool agentCreated = await waitForAgentCreation(agent_username);
            Console.WriteLine(agentCreated ? "Agent creation " +agent_username+" successfull" : "Agent creation failed");
            string nextExtension = await generateExtension(subAccountId, "STATION");
            await sendCreateStationRequest(agentStationGroupId, subAccountId, nextExtension, agent_username);
            Console.WriteLine("Waiting for Station creation to complete");
            bool stationCreated = await waitForStationCreation(subAccountId, agent_username);
            await Task.Delay(2000);
            Agent createdAgent = null;
            if (agentCreated && stationCreated)
            createdAgent=  await this.getAgent(agent_username);
            return createdAgent;
        }
        private async Task<int> getSubAccountId()
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/user");
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
            List<SubAccount> subAccounts =  JObject.Parse(responseJson).SelectToken("accessibleClients").ToObject<List<SubAccount>>();
            var sortedSubAccount = subAccounts.OrderBy(s => s.ID).ToList();
            Console.WriteLine("Selected SubAccount " + sortedSubAccount[0].Name);
            return sortedSubAccount[0].ID;
        }
        private async Task<int> getAgentStationGroupId(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/spokenAbc/agentStationGroups/client/"+subAccountId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
            List<AgentStationGroup> agentStationGroups = JsonConvert.DeserializeObject<IEnumerable<AgentStationGroup>>(responseJson).ToList();
            //List<AgentStationGroup> agentStationGroups = JObject.Parse(responseJson).ToObject<List<AgentStationGroup>>();
            var sortedAgentStationGroups = agentStationGroups.OrderBy(a => a.ID).ToList();
            return sortedAgentStationGroups[0].ID;
        }

        private async Task<string> generateExtension(int subAccountId, string type)
        {
            HttpResponseMessage httpResponseMessage = await client.PostAsync("/spokenAbc/extensions/next/" + subAccountId + "/type/" + type, null );
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Console.Write("Selected extension for type "+type + ":"+ responseJson + "\n" );
            return responseJson;
        }
        
        private async Task<List<int>> getSkillIds(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/spokenAbc/skills/multiClientSkills?clientIds=" + subAccountId + "&skillType=AGENT" );
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
            string securityCode = generateSecurityCode(agentLoginId);
            string avayaPassword = generateAvayaPassword(agentLoginId);
            //DateTime startDate = DateTime.ParseExact("2019/03/21", "yyyy/MM/dd", CultureInfo.InvariantCulture);
            //DateTime endDate = DateTime.ParseExact("2038/01/01", "yyyy/MM/dd", CultureInfo.InvariantCulture);
            Agent agent = new Agent(agent_username, "generated", "agent", agent_password, avayaPassword, agentLoginId, subAccountId,
                agentStationGroupId, securityCode, "2019-06-21", "2038-01-01", skillIds, 0);
            HttpResponseMessage httpResponseMessage = await client.PostAsJsonAsync("/spokenAbc/jobs/agents", agent);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
        }
        private string generateSecurityCode(string agentLoginId)
        {
            int length = agentLoginId.Length;
            return agentLoginId.Substring(length-4, 4);
        }
        private string generateAvayaPassword(string agentLoginId)
        {
            int length = agentLoginId.Length;
            return agentLoginId.Substring(length - 6, 6);
        }
        private async Task<bool> waitForAgentCreation(string agent_username)
        {
            
            for(int i =0; i<MAX_RETRY; i++)
            {
                HttpResponseMessage httpResponseMessage = await getAgentOnly(agent_username);
                if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.OK))
                {
                    return true;
                }
                else
                {
                    await Task.Delay(INTERVAL_IN_MILLIS);
                }
            }
            return false;
            
        }
        private async Task<bool> waitForStationCreation(int subAccountId, string agent_username)
        {
            for (int i = 0; i < MAX_RETRY; i++)
            {
                try
                {
                    HttpResponseMessage httpResponseMessage = await getStationOnly(subAccountId);
                    var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                    List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
                    Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
                    if(createdStation != null)
                    {
                        Console.WriteLine("Station for Agent " + agent_username + "has been created");
                        return true;
                    }
                }
                catch(Exception e)
                {
                    //Console.Write(e);
                    await Task.Delay(INTERVAL_IN_MILLIS);
                }
                
            }
            return false;

        }
        private async Task<HttpResponseMessage> getAgentOnly(string agent_username)
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/spokenAbc/agents/username/"+ agent_username);
            return httpResponseMessage;
        }
        private async Task<HttpResponseMessage> getStationOnly(int subAccountId)
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/spokenAbc/stations?clientId=" + subAccountId);
            return httpResponseMessage;
        }
        private async Task sendCreateStationRequest(int agentStationGroupId, int subAccountId, string stationExtension, string agent_username)
        {
            string extensionSecurityCode = generateSecurityCode(stationExtension);
            Station station = new Station(agentStationGroupId, subAccountId, stationExtension, "generated_station",extensionSecurityCode, agent_username);
            HttpResponseMessage httpResponseMessage = await client.PostAsJsonAsync("/spokenAbc/jobs/stations", station);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            //Console.Write(responseJson);
        }
        public async Task<Agent> getAgent(string agent_username)
        {
            await this.creatLoginRequest();
            List<string> questions = await this.createQuestionRequest();
            await this.createQuestionAnswerRequest(questions);
            Agent createdAgent = null;  
            HttpResponseMessage httpResponseMessage = null; ;
            try
            {
                httpResponseMessage = await this.getAgentOnly(agent_username);
                var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                createdAgent = JObject.Parse(responseJson).ToObject<Agent>();
            }
            catch(Exception e)
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
            int subAccountId = await this.getSubAccountId();
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
            if(createdStation!= null)Console.WriteLine("Agent exist with username " + agent_username + " and station " + createdStation.stationName);
            return createdAgent;
        }
        public async Task deleteAgent(string agent_username)
        {
            await this.creatLoginRequest();
            List<string> questions = await this.createQuestionRequest();
            await this.createQuestionAnswerRequest(questions);
            int subAccountId = await this.getSubAccountId();
            HttpResponseMessage httpResponseMessage =  await getStationOnly(subAccountId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
            Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
            if(createdStation != null)
            {
                await this.deleteStationOnly(createdStation.stationId);
                Console.WriteLine("Waiting for Station deletion to complete");
                bool deleted = await this.waitForStationDeletion(subAccountId, agent_username);
                Console.WriteLine(deleted ? "Station with agent username " + agent_username + " has been deleted" : "Station with username " + agent_username + " has not been deleted");
            }
            else
            {
                Console.WriteLine("Station associated with "+agent_username+ " has already been deleted");
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
            catch(Exception e)
            {
                //Console.Write(e);
                Console.WriteLine("Agent with username " + agent_username + " has been deleted already");
            }
        }
        private async Task deleteStationOnly(int stationId)
        {
            HttpResponseMessage httpResponseMessage = await client.DeleteAsync("/spokenAbc/jobs/stations/" + stationId);
            
        }
        private async Task deleteAgentOnly(string agent_username,  string agentLoginId)
        {
            AgentDeleteRequest agentDeleteRequest = new AgentDeleteRequest(agent_username, agentLoginId);
            HttpResponseMessage httpResponseMessage = await client.PostAsJsonAsync("/spokenAbc/agents/removeAgent" , agentDeleteRequest);

        }
        private async Task<bool> waitForStationDeletion(int subAccountId, string agent_username )
        {
            HttpResponseMessage httpResponseMessage = null;
            for (int i = 0; i < MAX_RETRY; i++)
            {
                try
                {
                    httpResponseMessage = await getStationOnly(subAccountId);
                    var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
                    List<Station> agentStations = JsonConvert.DeserializeObject<IEnumerable<Station>>(responseJson).ToList();
                    Station createdStation = agentStations.Single(a => a.agentUsername == agent_username);
                    if (createdStation != null)
                    {
                        await Task.Delay(INTERVAL_IN_MILLIS);
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
            for (int i = 0; i < MAX_RETRY; i++)
            {
                try
                {
                    httpResponseMessage = await getAgentOnly(agent_username);
                    if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.OK))
                    {
                        await Task.Delay(INTERVAL_IN_MILLIS);
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

