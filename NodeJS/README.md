# The Node.js API for the Avaya Public Cloud
you need npm and node.js installed to run this project.
Run 'npm i' in the folder to install node modules

##  Sample calls

### Run sample agent client
An agent can receive or make a phone call.
This sample client creates an agent, reads it back, and deletes it.

node sampleAgentClient.js
  --endpoint='https://login.bpo.avaya.com'
  --admin_username='{your_admin_username}'
  --admin_password='{your_admin_password}'
  --agent_username='{your_agent_username}'
  --agent_password='{your_agent_password}'

### Run sample subscription client
Data subscription allows a user to receive call data on their chosen endpoint.
Please look in sampleSubscriptionClient.js for how to create
a data subscription object to pass to the server.
This sample client creates a subscription, reads it back, and deletes it.

node sampleSubscriptionClient.js
  --endpoint='https://login.bpo.avaya.com'
  --admin_username='{your_admin_username}'
  --admin_password='{your_admin_password}'
