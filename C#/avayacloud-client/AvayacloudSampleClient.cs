using System;
using System.Threading.Tasks;


namespace AvayaCloudClient
{
    public  class AvayacloudSampleClient
    {
        private static readonly string agent_username = "TestAgent3";
        private static readonly string agent_password = "Spoken@1";
        private static string endpoint = "http://148.147.152.171:8086";
        private static string abcusername = "prov1";
        private static string abcpassword = "Avaya123$";
        static async Task Main(string[] args)
        {
            //avayacloud_client.Session session = new avayacloud_client.Session("https://login.bpo.avaya.com", "StoreAPIProvisioner", "WhHh3xG*us");
            //avayacloud_client.Session session = new avayacloud_client.Session("https://integration.bpo.avaya.com", "PuneDevSystemUser", "Avaya123$");
            if(args.Length == 0)
            {
                Console.WriteLine("No command line arguments. So contiuning with defined values");
            }
            else
            {
                if(args[0] != null)
                {
                    endpoint = args[0];
                }
                if (args[1] != null)
                {
                    abcusername = args[1];
                }
                if (args[2] != null)
                {
                    abcpassword = args[2];
                }
            }
            Console.WriteLine("Endpoint used:- " + endpoint);
            AvayaCloudClient.Session session = new AvayaCloudClient.Session(endpoint, abcusername, abcpassword);
            session.creatSessionParameters();
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
