using System;
using System.Collections;
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
            [Option('d', "dataDeliveryFormat", Required = true, HelpText = "Expected data format CSV/JSON .")]
            public string dataDeliveryFormat { get; set; }
            [Option('t', "dataSourceType", Required = true, HelpText = "Data source type e.g. ECH/HAGENT .")]
            public string dataSourceType { get; set; }
            [Option('a', "startTime", Required = true, HelpText = "Date from which the data needs to be sent e.g. 2019-07-04.")]
            public string startTime { get; set; }
            [Option('f', "frequencyInMinutes", Required = true, HelpText = "Frequency (mins) in which the data to be sent e.g. 5.")]
            public string frequencyInMinutes { get; set; }
            [Option('i', "subAccountAppId", Required = false, HelpText = "SubAccountAppId for which the subscription data to be fecthed")]
            public string subAccountAppId { get; set; }
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
                   })
                   .WithNotParsed((errs) => {
                       Console.WriteLine("Command Line parameters invalid");
                       Console.WriteLine("Press Any key to exit");
                       Console.ReadLine();
                       Environment.Exit(0);
                   });
            AvayaCloudClient.Session session = new AvayaCloudClient.Session(options.endpoint, options.abcusername, options.abcpassword);
            session.createSessionParameters();
            await doSubscriptionOperations(session, options.subscriptionEndPoint, options.dataDeliveryFormat, options.dataSourceType, options.startTime, options.frequencyInMinutes, options.subAccountAppId);
            Console.WriteLine("Press Any key to exit");
            Console.ReadLine();
            return;
        }
       private async static Task<Subscription> createSubscription(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes, string SubAccountAppId)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription createdSubscription = null;
            try
            {
                createdSubscription = await implSubscription.createSubscription(endpoint, dataDeliveryFormat, dataSourceType,
                    frequencyInMinutes, startTime, basicAuthUsername, basicAuthPassword, maxPostSize, SubAccountAppId);
                subscriptionId = createdSubscription.ID;
                Console.WriteLine("Created subscription with data source type " + createdSubscription.dataSourceType);
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return createdSubscription;
        }
        private async static Task<Subscription> getSubscription(Session session, string subAccountAppId)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription subscription = null;
            try
            {
                subscription = await implSubscription.getSubscription(subscriptionId, subAccountAppId);
                Console.WriteLine("Fetched subscription datasource " + subscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return subscription;
        }
        private async static Task<List<Subscription>> getAllSubscriptions(Session session, string subAccountAppId)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            List<Subscription> subscriptions = null; 
            try
            {
                subscriptions = await implSubscription.getAllSubscriptions(subAccountAppId);
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
        private async static Task<bool> deleteSubscription(Session session, string subAccountAppId)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            bool deleted = false;
            try
            {
                deleted = await implSubscription.deleteSubscription(subscriptionId, subAccountAppId);
                Console.WriteLine(deleted ? "Subscription with Id "+subscriptionId+" Deletion successful" : "Subscription with Id "+subscriptionId+" Deletion Failed");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return deleted;
        }
        private async static Task<Subscription> updateSubscription(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes, string subAccountAppId)
        {
            ImplSubscription implSubscription = new ImplSubscription(session);
            Subscription updatedSubscription = null;
            try
            {
                updatedSubscription = await implSubscription.updateSubscription(endpoint, dataDeliveryFormat, dataSourceType,
                    frequencyInMinutes, startTime, basicAuthUsername, basicAuthPassword, maxPostSize, subscriptionId, subAccountAppId);
                
                Console.WriteLine("Subscription updated with Id " + subscriptionId + " and datasource type " + updatedSubscription.dataSourceType);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return updatedSubscription;
        }
       private static async Task doSubscriptionOperations(Session session, String endpoint, string dataDeliveryFormat, string dataSourceType,
           string startTime, string frequencyInMinutes, string subAccountAppId)
        {
            Console.WriteLine("************Creation of Subscription*****************");
            await createSubscription(session, endpoint, dataDeliveryFormat, dataSourceType, startTime, frequencyInMinutes, subAccountAppId);
            Console.WriteLine("************Fetching of Subscription*****************");
            await getSubscription(session, subAccountAppId);
            Console.WriteLine("************Fetching of All Subscriptions*****************");
            await getAllSubscriptions(session, subAccountAppId);
            //Just testing by changing something
            maxPostSize = 5;
            Console.WriteLine("************Updation of  Subscription*****************");
            await updateSubscription(session, endpoint, dataDeliveryFormat, dataSourceType, startTime, frequencyInMinutes, subAccountAppId);
            Console.WriteLine("************Deletion of Subscription*****************");
            await deleteSubscription(session, subAccountAppId);
        }
    }
}
