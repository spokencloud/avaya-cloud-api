# The Node.js API for the Avaya Public Cloud
Before using the API, please contact Avaya for API key and endpoint information.

## Build the project
To build the API, you need npm and node.js installed. 
*  `npm install` 
*  `npm run compile`
*  `npm run unit` to run all unit tests

## Using the API in your project
To import API into your project:
    `npm install avaya-cloud-api`
    
The API is published with type declaration files, once imported, VSCode would assist code completion automatically. To import from the API, do like below:

    import { createAgentClient, createSubscriptionClient} from "avaya-cloud-api"


# API
## AgentClient
The API provides AgentClient class that could be used to create and delete agents in Avaya system.  AgentClient also has method to retrieve a user token for an agent, which is needed to login to Avaya Webphone

    // create an instance of AgentClient
    let agentClient = await createAgentClient(endpoint, apiKey);
    // retrieve agent skills
    let skillWithPriorities = await agentClient.getSkillNumbers();
    // create Agent and Station
    let response = await agentClient.createAgentAndStation(agentUsername, agentPassword, skillWithPriorities);
    // retrieve token for agent
    let token = agentClient.getUserToken(agentUsername)

## SubscriptionClient
The API also provides SubscriptionClient to subscribe to sub-account data.  Please see sample source code for examples on how to use the API.

    // create an instance of SubscriptionClient
    let subscriptionClient = await createSubscriptionClient(endpoint, apiKey);
    // an create subscription request payload
    let createSubscriptionRequest = {
        "dataSourceType": DataSourceType.HAgent,
        "dataDeliveryFormat": DataDeliveryFormat.Csv,
        "endpoint": "https://example.com",
        "retryPolicy": RetryPolicy.Default,
        "basicAuthUsername": "avaya",
        "basicAuthPassword": "password",
        "frequencyInMinutes": 0,
        "maxPostSize": 0,
        "startTime": "2019-11-04T21:55:24.421Z",
        "disableTLSVerify": true,
        "subAccountAppId": "ALL",
        "eventType": EventType.Historical
    };
    // fire subscription create request
    let response = await subscriptionClient.createSubscription(createSubscriptionRequest);
    // save subscription id
    let subscriptionId = response.subscriptionId
    // delete a subscription
    await subscriptionClient.deleteSubscription(subscriptionId);

## AUXCodeClient
The AUXCodeClient retrieves sub account aux codes, effective aux code given sub account app id
    // create an instance of AUXCodeClient
    let auxCodeClient = await createAUXCodeClient(endpoint, apiKey);
    // get subaccount aux codes
    let auxCodes = await auxCodeClient.getAuxCodes();
    // get subaccount effective aux code via sub account app id
    let appIdAuxCodes = await auxCodeClient.getAUXCodesForEffectiveAppId();

#  Samples
## Run SampleAgentclient to get Skill Information
Before creating an agent we need to know the available skills.

node lib/sample/SampleAgentSkill.js 
--endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY 

Sample Result : [ { skillNumber: 359, skillName: 'SkillOne' },
                  { skillNumber: 361, skillName: 'SkillTwo' } ]

## Run SampleAgentclient to create and/or delete Agent and Station
An agent can receive or make a phone call.
This sample client creates an agent, reads it back, and deletes it.
The sample will also retrieve a token for an agent and print it out in the console.

node lib/sample/SampleAgentClient.js 
--endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY 
--agent_username=tenfoldagent1 
--agent_password=Passw0rd@1 
--agent_skill='[{"skillNumber":100, "skillPriority":5}]'

Sample Agent Skills: --agent_skill='[{"skillNumber":359,"skillPriority":1}]'
skillPriority ranges from 1-16

## Run SampleSubscriptionClient
Data subscription allows a user to receive call data on their chosen endpoint.
Please look in sampleSubscriptionClient.js for how to create
a data subscription object to pass to the server.
This sample client creates a subscription, reads it back, and deletes it.

node lib/sample/SampleSubscriptionClient.js --endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY


## Run SampleAUXCodeClient
AUX Codes (or Auxiliary Codes) are used to track the time an agent has deliberately chosen to not accept calls. This sample client fetches the list of configured AUX Codes.

`node lib/sample/SampleAUXCodeClient.js --endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTaGVybG9jayIsImlzcyI6IkFCQ19TRUNVUklUWV9HQVRFV0FZIn0.rBbxKSScgqI6tJy-vdehBqdncMIVjMzoNFKsb8Zzuyc`
