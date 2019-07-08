using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CommandLine;
using static AvayaCloudClient.ImplAgent;

namespace AvayaCloudClient
{
    public  class AgentSampleClient
    {
        public class Options
        {
            [Option('e', "endpoint", Required = true, HelpText = "EndPoint for Avaya cloud.")]
            public string endpoint { get; set; }
            [Option('u', "abcusername", Required = true, HelpText = "User for Avaya cloud.")]
            public string abcusername { get; set; }
            [Option('p', "abcpassword", Required = true, HelpText = "Password for Avaya cloud.")]
            public string abcpassword { get; set; }
            [Option('a', "agent_username", Required = true, HelpText = "Agent name.")]
            public string agent_username { get; set; }
            [Option('b', "agent_password", Required = true, HelpText = "Agent password .")]
            public string agent_password { get; set; }
        }
                
        static async Task Main(string[] args)
        {
            Options options = null;
            Parser.Default.ParseArguments<Options>(args)
                   .WithParsed<Options>(o =>
                   {
                       options = o;
                   });
            AvayaCloudClient.Session session = new AvayaCloudClient.Session(options.endpoint, options.abcusername, options.abcpassword);
            session.createSessionParameters();
            await doAgentOperations(session, options.agent_username, options.agent_password);
            Console.WriteLine("Press Any key to exit");
            Console.ReadLine();
            return;


        }
        private async static Task<Agent> createAgent(Session session, string agent_username, string agent_password)
        {
            ImplAgent implAgent = new ImplAgent(session);
            Agent agent = null; ;
            try
            {
                agent = await implAgent.createAgent(agent_username, agent_password);
                Console.Write("Created Agent : " + agent.Username + "\n");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return agent;
        }
        private async static Task<Agent>  getAgent(Session session, String agent_username)
        {
            ImplAgent implAgent = new ImplAgent(session);
            Agent agent = null; ;
            try
            {
                agent = await implAgent.getAgent(agent_username);
                Console.Write("Returned Agent : " + agent.Username + "\n");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return agent;
        }
        private async static Task<bool> deleteAgent(Session session, string agent_username)
        {
            ImplAgent implAgent = new ImplAgent(session);
            try
            {
                await implAgent.deleteAgent(agent_username);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
      private static async Task doAgentOperations(Session session, String agent_username, string agent_password)
        {
            Console.WriteLine("************Creation of Agent*****************");
            await createAgent(session, agent_username, agent_password);
            Console.WriteLine("************Retrieving of Agent*****************");
            await getAgent(session, agent_username);
            Console.WriteLine("************Deletion of Agent*****************");
            await deleteAgent(session, agent_username);
        }
    }
}
