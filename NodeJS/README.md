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
  --admin_username='avaya'
  --admin_password='password'
  --agent_username='Avaya_Agent_1'
  --agent_password='EnterYourP@ssword123'

### Run sample subscription client
node sampleAgentClient.js
  --endpoint='https://login.bpo.avaya.com'
  --admin_username='avaya'
  --admin_password='password'
