using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AvayaCloudClient;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static AvayaCloudClient.Session;

namespace AvayaCloudClient
{
    public class ImplSubscription
    {
        private Session session;
        private readonly static string VERSION = "1.0";
        private readonly static string SUBSCRIPTIONPATH = "/spokenAbc/subscriptions/v" + VERSION + "/subscriptions";
        private readonly static string SLASH = "/";
        private readonly static string SUBACCOUNTKEY = "subAccountAppId=";
        private readonly static string QUESTIONMARK = "?";

        public ImplSubscription(Session session)
        {
            this.session = session;
        }
        //
        // The Subscription type describes an Avaya Cloud data subscription. A subscription is scoped to the
        // sub account identified in the session.
        //
        public class Subscription
        {
            [JsonProperty("subscriptionId")] 
            public string ID;
            // The name of the data source for the subscription. Valid values are:
            //   ECH, HAGLOG, HAGENT, RT_AGENT_STATE, RT_DID_STATE, RT_SKILL_STATE, RT_VDN_STATE
            //
            // A subscription is for exactly one data source. You can create multiple subscriptions for
            // multiple data sources.
            [JsonProperty("dataSourceType")] 
            public string dataSourceType;
            // The start time of the subscription. When created, the data will be sent starting from
            // StartTime. If StartTime is zero, data is sent from "The Beginning of Time". The beginning
            // of time for the real-time tables is the current time minus 24 hours.
            [JsonProperty("startTime")] 
            public string startTime;
            // The frequency of how often data is sent. If the value is zero (default) data is sent as
            // quickly as possible.  Other values (ex: 10-mintues) try to batch data for up to Frequency units.
            // Data can always come faster if buffers on the producer side fill up. The guarantee is that
            // the producer will be flushed at least every Frequency units.
            //
            // The data producer can modify the frequency to match the frequency of the data source. When
            // you do a get on a subscription this value will be set to the anticipated actual frequency.
            //
            [JsonProperty("frequencyInMinutes")] 
            public string frequencyInMinutes;
            // The maximum size (in bytes) of a POST request that the endpoint can accept. The producer will
            // always flush before exceeding this number of bytes. The default (0) is unlimited.
            [JsonProperty("maxPostSize")] 
            public int maxPostSize;
            // Format for encoding the data.  Valid values are "CSV" and "JSON". If unspecified, the format
            // is CSV.
            //
            // CSV data is compatible with RFC-4180 and always contains a header line before the data. The
            // header allows the consumer to adapt to changing data formats over time. CSV data is sent with an
            // text/csv content-type. CSV data is encoded in UTF-8.
            //
            // JSON data is encoded according to http://json.org.  Each line in the request data consists of
            // a single JSON object so a consumer should decode each line individually (see: http://jsonlines.org/).
            // JSON data is sent with an application/x-json-stream content-type. JSON data is encoded in UTF-8.
            //
            // The same data is delivered for any data format.
            //
            [JsonProperty("dataDeliveryFormat")]
            public string dataDeliveryFormat;
            // The endpoint where data will be sent. Data is sent via an HTTP 1.1 POST request in the format described
            // by the Format parameter. The specified protocol must be http or https. If a port is specified it will
            // be used instead of the default port for the protocol.
            //
            // Multiple subscriptions may share the same endpoint. Any given POST request to the endpoint will contain
            // data for exactly one subscription (no mixing).
            //
            // If you do share endpoints you must disambiguate the data in the request on the endpoint side.  Since this
            // might be a challenge using a URL query string or path parameters to disambiguate could be an option.
            //
            [JsonProperty("endpoint")] 
            public string endpoint;
            // If set, the producer will use the indicated BasicAuth username and password to connect to the
            // endpoint. BasicAuth will only be used if the protocol is https.
            [JsonProperty("basicAuthUsername")]
            public string basicAuthUsername;
            // This read-only field, when non zero, gives the oldest time where we dropped data due a failure to
            // send data to an endpoint. There is no information on why the transmission failed or how long
            // the outage lasted.
            //
            // As a consumer you can only know that some data may have been lost at or after this time. The two
            // decisions a consumer can make are to ignore this or modify the subscription to start at or before
            // this time. In the latter case, any missing data will be resent.
            //
            // Whenever a subscription is updated, this field is reset to zero.

            [JsonProperty("basicAuthPassword")]
            public string basicAuthPassword;
            [JsonProperty("oldestError")]
            public string oldestError;
            // This read-only field, when non zero, gives the time data was last sent to the endpoint.
            [JsonProperty("lastDataSent")] 
            public string lastDataSent;
            // Errors happen as a normal course of events. When a transmission error occurs, the producer uses an
            // exponential backoff policy and retries several times after which it sets OldestError and drops the
            // data being sent.
            //
            // If unspecified, the policy is DEFAULT
            //
            //  You can change this policy with these settings:
            //  DEFAULT: Use the default exponential backoff policy.
            //  DROP: Drop data on the first error and set OldestError without any retries.
            //
            [JsonProperty("retryPolicy")] 
            public string RetryPolicy;
            [JsonProperty("subAccountAppId")]
            public string subAccountAppId;

            public Subscription(string dataSourceType, string startTime, 
                string frequencyInMinutes, int maxPostSize, string dataDeliveryFormat, string endpoint,
                string basicAuthUsername, string basicAuthPassword,  string retryPolicy, string subAccountAppId)
            {
                this.dataSourceType = dataSourceType;
                this.startTime = startTime;
                this.frequencyInMinutes = frequencyInMinutes;
                this.maxPostSize = maxPostSize;
                this.dataDeliveryFormat = dataDeliveryFormat;
                this.endpoint = endpoint;
                this.basicAuthUsername = basicAuthUsername;
                this.basicAuthPassword = basicAuthPassword;
                RetryPolicy = retryPolicy;
                this.subAccountAppId = subAccountAppId;
            }
        }
        public async Task<Subscription> createSubscription(string endPoint, string dataDeliveryFormat, string dataSourceType, string frequencyInMinutes, string startTime, 
            string basicAuthUsername, string basicAuthPassword, int maxPostSize, string subAccountAppId)
        {
            await session.login();
            //If subaccountAppId is not provided then search for one assigned.
            if (null == subAccountAppId)
            {
                SubAccount subAccount = await session.getSubAccount();
                subAccountAppId = subAccount.AppID;
            }
            Subscription createdSubscription =   await sendCreateSubscriptionRequest(subAccountAppId, endPoint, dataSourceType, dataDeliveryFormat, frequencyInMinutes,
                basicAuthUsername, basicAuthPassword, maxPostSize, startTime);
            return createdSubscription;
        }
        private async Task<Subscription> sendCreateSubscriptionRequest(string subAccountAppId, string endpoint, string dataSourceType, 
            string dataDeliveryFormat,string frequencyInMinutes, string basicAuthUsername, 
            string basicAuthPassword, int maxPostSize, string startTime)
        {
            Subscription subscription = new Subscription(dataSourceType, startTime, frequencyInMinutes, maxPostSize, dataDeliveryFormat,
                endpoint, basicAuthUsername, basicAuthPassword, "DEFAULT", subAccountAppId);
            HttpResponseMessage httpResponseMessage = await Session.client.PostAsJsonAsync(SUBSCRIPTIONPATH+ QUESTIONMARK + SUBACCOUNTKEY + subscription.subAccountAppId, subscription);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Subscription createdSubscription = JObject.Parse(responseJson).ToObject<Subscription>();
            return createdSubscription;
        }
        public async Task<Subscription> getSubscription(string subscriptionId, string subAccountAppId)
        {
            await session.login();
            //If subaccountAppId is not provided then search for one assigned.
            if (null == subAccountAppId)
            {
                SubAccount subAccount = await session.getSubAccount();
                subAccountAppId = subAccount.AppID;
            }
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync(SUBSCRIPTIONPATH + SLASH + subscriptionId+ QUESTIONMARK + SUBACCOUNTKEY + subAccountAppId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Subscription createdSubscription = JObject.Parse(responseJson).ToObject<Subscription>();
            return createdSubscription;
        }

        public async Task<List<Subscription>> getAllSubscriptions(string subAccountAppId)
        {
            await session.login();
            //If subaccountAppId is not provided then search for one assigned.
            if (null == subAccountAppId)
            {
                SubAccount subAccount = await session.getSubAccount();
                subAccountAppId = subAccount.AppID;
            }
            HttpResponseMessage httpResponseMessage = await Session.client.GetAsync(SUBSCRIPTIONPATH + QUESTIONMARK + SUBACCOUNTKEY + subAccountAppId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            List<Subscription> subscriptions = JsonConvert.DeserializeObject<IEnumerable<Subscription>>(responseJson).ToList();
            return subscriptions;
        }
        public async Task<Subscription> updateSubscription(string endPoint, string dataDeliveryFormat, string dataSourceType, string frequencyInMinutes, string startTime,
            string basicAuthUsername, string basicAuthPassword, int maxPostSize, string subscriptionId, string subAccountAppId)
        {
            await session.login();
            //If subaccountAppId is not provided then search for one assigned.
            if (null == subAccountAppId)
            {
                SubAccount subAccount = await session.getSubAccount();
                subAccountAppId = subAccount.AppID;
            }
            Subscription updateSubscription = await sendUpdateSubscriptionRequest(subAccountAppId, endPoint, dataSourceType, dataDeliveryFormat, frequencyInMinutes,
                basicAuthUsername, basicAuthPassword, maxPostSize, startTime, subscriptionId);
            return updateSubscription;
        }
        private async Task<Subscription> sendUpdateSubscriptionRequest(string subAccountAppId, string endpoint, string dataSourceType,
            string dataDeliveryFormat, string frequencyInMinutes, string basicAuthUsername,
            string basicAuthPassword, int maxPostSize, string startTime, string subscriptionId)
        {
            Subscription updatesubscription = new Subscription(dataSourceType, startTime, frequencyInMinutes, maxPostSize, dataDeliveryFormat,
                endpoint, basicAuthUsername, basicAuthPassword, "DEFAULT", subAccountAppId);
            HttpResponseMessage httpResponseMessage = await Session.client.PutAsJsonAsync(SUBSCRIPTIONPATH + SLASH + subscriptionId + QUESTIONMARK + SUBACCOUNTKEY + subAccountAppId, updatesubscription);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            Subscription createdSubscription = JObject.Parse(responseJson).ToObject<Subscription>();
            return createdSubscription;
        }
        public async Task<bool> deleteSubscription(string subscriptionId, string subAccountAppId)
        {
            await session.login();
            //If subaccountAppId is not provided then search for one assigned.
            if (null == subAccountAppId)
            {
                SubAccount subAccount = await session.getSubAccount();
                subAccountAppId = subAccount.AppID;
            }
            HttpResponseMessage httpResponseMessage = await Session.client.DeleteAsync(SUBSCRIPTIONPATH + SLASH + subscriptionId + QUESTIONMARK + SUBACCOUNTKEY + subAccountAppId);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            if (httpResponseMessage.StatusCode.Equals(HttpStatusCode.OK))
            {
                return true;
            }
            return false;
        }
    }
}
