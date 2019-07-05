using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static AvayaCloudClient.ImplSubscription;

namespace AvayaCloudClient
{
    public  class AvayacloudSampleClient
    {
        //Login Details
        private static string endpoint;
        private static string abcusername;
        private static string abcpassword;
        //Agent  details
        private static string agent_username;
        private static string agent_password;
        //Data subscription Details
        private static string subscriptionId = "";
        private static string basicAuthUsername = "";
        private static string basicAuthPassword = "";
        private static int maxPostSize = 0;
        private static string subscriptionEndPoint;
        private static string dataDeliveryFormat;
        private static string dataSourceType;
        private static string frequencyInMinutes;
        private static string startTime;
        static async Task Main(string[] args)
        {
            Console.WriteLine("Enter the Avaya cloud URL");
            endpoint = Console.ReadLine();
            Console.WriteLine("Enter the Avaya cloud login username");
            abcusername = Console.ReadLine();
            Console.WriteLine("Enter the Avaya cloud login password");
            abcpassword =  Console.ReadLine();
            Console.WriteLine("Endpoint used:- " + endpoint);
            AvayaCloudClient.Session session = new AvayaCloudClient.Session(endpoint, abcusername, abcpassword);
            session.createSessionParameters();
            Console.WriteLine("Please enter the action\n1 for Agent operations");
            Console.WriteLine("2 for Subscription operations");
            string input = Console.ReadLine();
            switch (input)
            {
                case "1":
                    getInputForAgentOperations();
                    await doAgentOperations(session);
                    break;
                case "2":
                    getInputForDataSubscriptions();
                    await doSubscriptionOperations(session);
                    break;
                default:
                    Console.WriteLine("Invalid Option");
                    break;

            }
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
        private async static Task<bool> createSubscription(Session session)
        {
            try
            {
                Subscription subscription =  await session.createSubscription(subscriptionEndPoint, dataDeliveryFormat, dataSourceType, frequencyInMinutes, startTime,
                    basicAuthUsername, basicAuthPassword, maxPostSize);
                subscriptionId = subscription.ID;
                Console.WriteLine("Subscription created with Id " + subscriptionId + " and datasource type " + subscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool> getSubscription(Session session)
        {
            try
            {
                Subscription subscription = await session.getSubscription(subscriptionId);
                Console.WriteLine("Fetched subscription datasource " + subscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool> getAllSubscriptions(Session session)
        {
            try
            {
                List<Subscription> subscriptions = await session.getAllSubscriptions();
                Console.WriteLine("Fetched subscription datasources " );
                foreach(ImplSubscription.Subscription s in subscriptions)
                {
                    Console.WriteLine("DataSourceType Type " + s.dataSourceType);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool> deleteSubscription(Session session)
        {
            try
            {
                bool deleted = await session.deleteSubscription(subscriptionId);
                Console.WriteLine(deleted ? "Subscription with Id "+subscriptionId+" Deletion successful" : "Subscription with Id "+subscriptionId+" Deletion Failed");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private async static Task<bool> updateSubscription(Session session)
        {
            try
            {
                Subscription updatedSubscription = await session.updateSubscription(subscriptionEndPoint,
                    dataDeliveryFormat, dataSourceType, frequencyInMinutes, startTime,
                    basicAuthUsername, basicAuthPassword, maxPostSize,subscriptionId);
                Console.WriteLine("Subscription updated with Id " + subscriptionId + " and datasource type " + updatedSubscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return true;
        }
        private static void getInputForAgentOperations()
        {
            Console.WriteLine("Enter the agent username");
            agent_username = Console.ReadLine();
            Console.WriteLine("Enter the agent password");
            agent_password = Console.ReadLine();
        }
        private static void getInputForDataSubscriptions()
        {
            Console.WriteLine("Enter the endpoint for the data to be sent ");
            subscriptionEndPoint = Console.ReadLine();
            Console.WriteLine("Enter the expected data format CSV/JSON");
            dataDeliveryFormat = Console.ReadLine();
            Console.WriteLine("Enter one data source type e.g. ECH/HAGENT");
            dataSourceType = Console.ReadLine();
            Console.WriteLine("Enter the date from which the data needs to be sent e.g. 2019-07-04");
            startTime = Console.ReadLine();
            Console.WriteLine("Enter the  frequency (mins) in which the data to be sent e.g. 5");
            frequencyInMinutes = Console.ReadLine();
        }
        private static async Task doAgentOperations(Session session)
        {
            Console.WriteLine("************Creation of Agent*****************");
            await createAgent(session);
            Console.WriteLine("************Retrieving of Agent*****************");
            await getAgent(session);
            Console.WriteLine("************Deletion of Agent*****************");
            await deleteAgent(session);
        }
        private static async Task doSubscriptionOperations(Session session)
        {
            Console.WriteLine("************Creation of Subscription*****************");
            await createSubscription(session);
            Console.WriteLine("************Fetching of Subscription*****************");
            await getSubscription(session);
            Console.WriteLine("************Fetching of All Subscriptions*****************");
            await getAllSubscriptions(session);
            //Just testing by changing something
            maxPostSize = 5;
            Console.WriteLine("************Updation of  Subscription*****************");
            await updateSubscription(session);
            Console.WriteLine("************Deletion of Subscription*****************");
            await deleteSubscription(session);
        }
    }
}
