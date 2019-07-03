using System;
using System.Threading.Tasks;


namespace AvayaCloudClient
{
    public  class AvayacloudSampleClient
    {
        private static string agent_username;
        private static string agent_password;
        private static string endpoint;
        private static string abcusername;
        private static string abcpassword;
        static async Task Main(string[] args)
        {
            Console.WriteLine("Enter the Avaya cloud URL");
            endpoint = Console.ReadLine();
            Console.WriteLine("Enter the Avaya cloud login username");
            abcusername = Console.ReadLine();
            Console.WriteLine("Enter the Avaya cloud login password");
            abcpassword =  Console.ReadLine();
            Console.WriteLine("Please enter the action\n1 for Agent operations");
            string input = Console.ReadLine();
            if(input == "1")
            {
                Console.WriteLine("Enter the agent username");
                agent_username = Console.ReadLine();
                Console.WriteLine("Enter the agent password");
                agent_password = Console.ReadLine();
            }
            Console.WriteLine("Endpoint used:- " + endpoint);
            AvayaCloudClient.Session session = new AvayaCloudClient.Session(endpoint, abcusername, abcpassword);
            session.createSessionParameters();
            Console.WriteLine("************Creation of Agent*****************");
            await createAgent(session);
            Console.WriteLine("************Retrieving of Agent*****************");
            await getAgent(session);
            Console.WriteLine("************Deletion of Agent*****************");
            await deleteAgent(session);
            Console.WriteLine("Press Any key to exit");
            Console.ReadLine();
            return;
        }
        private async static Task<bool> createAgent(Session session)
        {
            try
            {
                var Agent = await session.createAgent(agent_username, agent_password);
                Console.Write("Created Agent : " + Agent.Username + "\n");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool>  getAgent(Session session)
        {
            try
            {
                var Agent = await session.getAgent(agent_username);
                Console.Write("Returned Agent : " + Agent.Username + "\n");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool> deleteAgent(Session session)
        {
            try
            {
                await session.deleteAgent(agent_username);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }

    }
}
