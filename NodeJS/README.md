# The Node.js API for the Avaya Public Cloud

Before using the API, please contact Avaya for API key and endpoint information.

## Build the project

To build the API, you need npm and node.js installed.

- `npm install`
- `npm run compile`
- `npm run unit` to run all unit tests

To ensure code quality, you could install VSCode plugins including

- Coverage Gutters 2.4.2, see coverage in editor
- Jest, run tests in watch mode
- Prettier - Code formatter, to format code on save
- TSLint, fix Typescript on save

Git Hooks: The project also uses husky, lint-staged, and prettier to make sure code is formatted and tested before being committed to Git repository. Make sure latest version of npm is used for this work. e.g. nvm use 13.5

- pre-commit, compile and format code
- pre-push, run unit tests

## Using the API in your project

To import API into your project:
`npm install avaya-cloud-api`

The API is published with type declaration files, once imported, VSCode would assist code completion automatically. To import from the API, do like below:

    import { createAgentClient, createSubscriptionClient} from "avaya-cloud-api"

# API

## AgentClient

The API provides AgentClient class that could be used to create and delete agents in Avaya system. AgentClient also has method to retrieve a user token for an agent, which is needed to login to Avaya Webphone

    // create an instance of AgentClient
    let agentClient = await createAgentClient(endpoint, apiKey);

    // create Agent and Station
    let response = await agentClient.createAgentAndStation(agentUsername, agentPassword);

    // create Agent and Station with first name and last name
    const response = await agentClient.createAgentAndStation(agentUsername, agentPassword, firstName, lastName);

    // retrieve token for agent
    let token = agentClient.getUserToken(agentUsername)

    // get sub account app id
    const subAccountAppId = agentClient.SubAccountAppId

## SubscriptionClient

The API also provides SubscriptionClient to subscribe to sub-account data. Please see sample source code for examples on how to use the API.

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

The AUXCodeClient retrieves sub account aux codes, effective aux code given sub account app id.

    // create an instance of AUXCodeClient
    let auxCodeClient = await createAUXCodeClient(endpoint, apiKey);
    // get subaccount aux codes
    let auxCodes = await auxCodeClient.getAuxCodes();
    // get subaccount effective aux code via sub account app id
    let appIdAuxCodes = await auxCodeClient.getAUXCodesForEffectiveAppId();

## AddressBookClient

The AddressBookClient could be used to get sub-account Address Book with all active contacts.
With search endpoint contacts could be fetched by multiple optional params: type (one or many of Agent/Supervisor/Outbound/ACO/VDN separated by comma); partial name/destination; full virtualExtension.
The search request could contain pagination (pageSize; page number) and sorting (by name/type/virtualExtension/destination; direction ASC/DESC) params.

    // create an instance of AddressBookClient
    const addressBookClient = createAddressBookClient(endpoint, apiKey)
    // get Address Book
    const addressBookResponse = await addressBookClient.getAddressBook()
    // search contacts w/o query params
    const addressBookSearchResponse = await addressBookClient.searchContacts()
    // search contacts by type
    const searchRequest = { type: 'ACO' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(searchRequest)
    // search contacts by partial name or destination
    const searchRequest = { query: 'partial_name_or_destination' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(searchRequest)
    // search contacts with pagination params
    const searchRequest = { page: 2, pageSize: 10 }
    const addressBookSearchResponse = await addressBookClient.searchContacts(searchRequest)
    // search contacts with sort params
    const searchRequest = { orderBy: 'type', orderDirection: 'DESC' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(searchRequest)
    // search contacts with all params
    const searchRequest = { type: 'Agent,Supervisor,ACO',  query: 'partial_name_or_destination', page: 0, pageSize: 5, orderBy: 'type', orderDirection: 'ASC' }
    const addressBookSearchResponse = await addressBookClient.searchContacts(searchRequest)

# Samples

## Run SampleAgentclient to create Agent and Station

An agent can receive or make a phone call.
This sample client creates an agent, reads it back, and deletes it.
The sample will also retrieve a token for an agent and print it out in the console.

`node lib/sample/SampleAgentClient.js --endpoint='http://localhost:8081' --api_key=YOUR-API-KEY --agent_username=tenfoldagent1 --agent_password=Passw0rd@1`

With Agent first and last name

`node lib/sample/SampleAgentClient.js --endpoint='http://localhost:8081' --api_key=YOUR-API-KEY --agent_username=tenfoldagent2 --agent_password=Passw0rd@2 --agent_firstname=FirstName --agent_lastname=LastName`

## Run SampleSubscriptionClient

Data subscription allows a user to receive call data on their chosen endpoint.
Please look in sampleSubscriptionClient.js for how to create
a data subscription object to pass to the server.
This sample client creates a subscription, reads it back, and deletes it.

`node lib/sample/SampleSubscriptionClient.js --endpoint='http://localhost:8081' --api_key=YOUR-API-KEY`

## Run SampleAUXCodeClient

AUX Codes (or Auxiliary Codes) are used to track the time an agent has deliberately chosen to not accept calls. This sample client fetches the list of configured AUX Codes.

`node lib/sample/SampleAUXCodeClient.js --endpoint='http://localhost:8081' --api_key=YOUR-API-KEY`

## Run SampleAddressBookClient

An Address Book contains contacts of the following types:
Agent | Supervisor | Outbound | ACO | VDN

This sample client can fetch a full Address Book or execute queries on an AddressBook.

`node lib/sample/SampleAddressBookClient.js --endpoint='http://localhost:8081' --api_key=YOUR-API-KEY`

## Notable Changes:

### Starting at version 0.1.0, Agent will be created with default skill. If default skill is not present, it will be created first.

## [Link to API docs](http://htmlpreview.github.io/?https://github.com/spokencloud/avaya-cloud-api/blob/develop/NodeJS/docs/index.html)
