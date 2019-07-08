using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CommandLine;
using static AvayaCloudClient.ImplSubscription;

namespace AvayaCloudClient
{
    public  class SubscriptionSampleClient
    {
        public class Options
        {
            [Option('e', "endpoint", Required = true, HelpText = "EndPoint for Avaya cloud.")]
            public string endpoint { get; set; }
            [Option('u', "abcusername", Required = true, HelpText = "User for Avaya cloud.")]
            public string abcusername { get; set; }
            [Option('p', "abcpassword", Required = true, HelpText = "Password for Avaya cloud.")]
            public string abcpassword { get; set; }
            [Option('s', "subscriptionEndPoint", Required = true, HelpText = "Endpoint for the data to be sent.")]
            public string subscriptionEndPoint { get; set; }
            [Option('d', "dataDeliveryFormat", Required = false, HelpText = "Expected data format CSV/JSON .")]
            public string dataDeliveryFormat { get; set; }
            [Option('t', "dataSourceType", Required = false, HelpText = "Data source type e.g. ECH/HAGENT .")]
            public string dataSourceType { get; set; }
            [Option('a', "startTime", Required = false, HelpText = "Date from which the data needs to be sent e.g. 2019-07-04.")]
            public string startTime { get; set; }
            [Option('f', "frequencyInMinutes", Required = false, HelpText = "Frequency (mins) in which the data to be sent e.g. 5.")]
            public string frequencyInMinutes { get; set; }
        }
        private static string subscriptionId = "";
        private static string basicAuthUsername = "";
        private static string basicAuthPassword = "";
        private static int maxPostSize = 0;
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
            await doSubscriptionOperations(session, options.subscriptionEndPoint, options.dataDeliveryFormat, options.dataSourceType, options.startTime, options.frequencyInMinutes);
            Console.WriteLine("Press Any key to exit");
            Console.ReadLine();
            return;
        }
       private async static Task<Subscription> createSubscription(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription createdSubscription = null;
            try
            {
                createdSubscription = await implSubscription.createSubscription(endpoint, dataDeliveryFormat, dataSourceType,
                    frequencyInMinutes, startTime, basicAuthUsername, basicAuthPassword, maxPostSize);
                subscriptionId = createdSubscription.ID;
                Console.WriteLine("Created subscription with data source type " + createdSubscription.dataSourceType);
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return createdSubscription;
        }
        private async static Task<Subscription> getSubscription(Session session)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription subscription = null;
            try
            {
                subscription = await implSubscription.getSubscription(subscriptionId);
                Console.WriteLine("Fetched subscription datasource " + subscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return subscription;
        }
        private async static Task<List<Subscription>> getAllSubscriptions(Session session)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            List<Subscription> subscriptions = null; 
            try
            {
                subscriptions = await implSubscription.getAllSubscriptions();
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
            return subscriptions;
        }
        private async static Task<bool> deleteSubscription(Session session)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            bool deleted = false;
            try
            {
                deleted = await implSubscription.deleteSubscription(subscriptionId);
                Console.WriteLine(deleted ? "Subscription with Id "+subscriptionId+" Deletion successful" : "Subscription with Id "+subscriptionId+" Deletion Failed");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return deleted;
        }
        private async static Task<Subscription> updateSubscription(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription updatedSubscription = null;
            try
            {
                updatedSubscription = await implSubscription.updateSubscription(endpoint, dataDeliveryFormat, dataSourceType,
                    frequencyInMinutes, startTime, basicAuthUsername, basicAuthPassword, maxPostSize, subscriptionId);
                
                Console.WriteLine("Subscription updated with Id " + subscriptionId + " and datasource type " + updatedSubscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return updatedSubscription;
        }
       private static async Task doSubscriptionOperations(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes)
        {
            Console.WriteLine("************Creation of Subscription*****************");
            await createSubscription(session, endpoint, dataDeliveryFormat, dataSourceType, startTime, frequencyInMinutes);
            Console.WriteLine("************Fetching of Subscription*****************");
            await getSubscription(session);
            Console.WriteLine("************Fetching of All Subscriptions*****************");
            await getAllSubscriptions(session);
            //Just testing by changing something
            maxPostSize = 5;
            Console.WriteLine("************Updation of  Subscription*****************");
            await updateSubscription(session, endpoint, dataDeliveryFormat, dataSourceType, startTime, frequencyInMinutes);
            Console.WriteLine("************Deletion of Subscription*****************");
            await deleteSubscription(session);
        }
    }
}
