# The Node.js API for the Avaya Public Cloud
The API provides AgentClient class that could be used to create and delete agents in Avaya system. AgentClient also has method to retrieve a user token for an agent.  With this token, the agent could login to Avaya Webphone. The API also provides SubscriptionClient to subscribe to sub-account data.  Please see sample source code for examples on how to use the API.

Before using the API, please contact Avaya for api key and endpoint information.

To build the API, you need npm and node.js installed to run this project.  
Run 'npm i' in the folder to install node modules
Run 'npm run compile' to compile and create declaration files
Run 'npm run unit' to run all unit tests

##  Sample calls

### Run sample agent client to get Skill Information
Before creating an agent we need to know the available skills.

node lib/sample/SampleAgentSkill.js 
--endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY 

Sample Result : [ { skillNumber: 359, skillName: 'SkillOne' },
                  { skillNumber: 361, skillName: 'SkillTwo' } ]

### Run sample agent client
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

### Run sample subscription client
Data subscription allows a user to receive call data on their chosen endpoint.
Please look in sampleSubscriptionClient.js for how to create
a data subscription object to pass to the server.
This sample client creates a subscription, reads it back, and deletes it.

node lib/sample/SampleSubscriptionClient.js --endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY
