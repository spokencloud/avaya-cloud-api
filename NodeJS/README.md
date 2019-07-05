# The Node.js API for the Avaya Public Cloud
you need npm and node.js installed to run this project
run 'npm i' in the folder to install node modules
then run 'node sampleAgentClient.js' to see the code in action

##  Sample calls

### Run sample agent client
A call to endpoint login.bpo.avaya.com with admin user avaya
and desired agent name Avaya_Agent_1

node sampleAgentClient.js
  --endpoint='https://login.bpo.avaya.com'
  --admin_username='{your_admin_username}'
  --admin_password='{your_admin_password}'
  --agent_username='{your_agent_username}'
  --agent_password='{your_agent_password}'

### Run sample subscription client
node sampleAgentClient.js
  --endpoint='https://login.bpo.avaya.com'
  --admin_username='{your_admin_username}'
  --admin_password='{your_admin_password}'
