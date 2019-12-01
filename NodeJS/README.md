# The Node.js API for the Avaya Public Cloud
you need npm and node.js installed to run this project.
Run 'npm i' in the folder to install node modules

##  Sample calls

### Run sample agent client to get Skill Information
Before creating an agent we need to know the available skills.

node dist/sample/SampleAgentSkill.js 
--endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY 

Sample Result : [ { skillNumber: 359, skillName: 'SkillOne' },
                  { skillNumber: 361, skillName: 'SkillTwo' } ]

### Run sample agent client
An agent can receive or make a phone call.
This sample client creates an agent, reads it back, and deletes it.

node dist/sample/SampleAgentClient.js 
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

node dist/sample/SampleSubscriptionClient.js --endpoint='http://localhost:8081' --api_key=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY
