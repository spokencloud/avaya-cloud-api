using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using static AvayaCloudClient.ImplAgent;
using static AvayaCloudClient.ImplSubscription;

namespace AvayaCloudClient
{
    public class Session
    {
        public static int INTERVAL_IN_MILLIS = 10000;
        public static int MAX_RETRY = 5;
        public static HttpClient client;
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
        public class SubAccount
        {
            public int ID;
            public string Name;
            public string Code;
            public string AccountSize;
            public string AccountID;
            public string AppID;
            public string[] Regions;

            
        }
        public Session(string endpoint, string username, string password)
        {
            this.endpoint = endpoint;
            this.admin_username = username;
            this.admin_password = password;
        }
        public void createSessionParameters()
        {
            CookieContainer cookieContainer = new CookieContainer();
            HttpClientHandler handler = new HttpClientHandler();
            handler.CookieContainer = cookieContainer;
            handler.UseCookies = true;
            client = new HttpClient(handler);
            client.BaseAddress = new Uri(endpoint);
        }
        public async Task login()
        {
            await createLoginRequest();
            List<string> questions =  await createQuestionRequest();
            await createQuestionAnswerRequest(questions);

        }
        private async Task createLoginRequest()
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
        }
        public async Task<SubAccount> getSubAccount()
        {
            HttpResponseMessage httpResponseMessage = await client.GetAsync("/user");
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            List<SubAccount> subAccounts = JObject.Parse(responseJson).SelectToken("accessibleClients").ToObject<List<SubAccount>>();
            var sortedSubAccount = subAccounts.OrderBy(s => s.ID).ToList();
            Console.WriteLine("Selected SubAccount " + sortedSubAccount[0].Name);
            return sortedSubAccount[0];
        }
    }
}

