const Session = require('./session')
const SubscriptionClient = require('./SubscriptionClient')
const args = require('minimist')(process.argv.slice(2))

ENDPOINT_KEY = 'endpoint'
ADMIN_USERNAME_KEY = 'admin_username'
ADMIN_PASSWORD_KEY = 'admin_password'

REPLACE_REGEX = /'/g
EMPTY_STRING = ""

let endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
let adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);

function isValidParameter(key, parameter) {
  if (parameter === undefined) {
    console.log(key + ' was undefined')
    return false
  } else {
    return true
  }
}

let isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint)
let isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername)
let isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword)

if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid
) {
  process.exit()
}

let session = Session.createSession(endpoint, adminUsername, adminPassword)
let subscriptionClient = SubscriptionClient.createSubscriptionClient(session)

async function createSubscription() {
  try {
    let createSubscriptionRequest = {
      "dataSourceType": "HAGENT",
      "dataDeliveryFormat": "CSV",
      "endpoint": "https://example.com",
      "retryPolicy": "DEFAULT",
      "basicAuthUsername": "avaya",
      "basicAuthPassword": "password",
      "frequencyInMinutes": 0,
      "maxPostSize": 0,
      "startTime": "2019-07-04T21:55:24.421Z",
      "disableTLSVerify": true
    }
    let returnedSubscriptionRequest = await subscriptionClient.createSubscription(createSubscriptionRequest)
    console.log('subscriptionObject from createSubscription')
    console.log(returnedSubscriptionRequest)
    return returnedSubscriptionRequest
  } catch (e) {
    console.error(e)
  }
}

async function deleteSubscription(subscriptionId) {
  try {
    await subscriptionClient.deleteSubscription(subscriptionId)
    console.log('subscription with ' + subscriptionId + ' deleted')
  } catch (e) {
    console.error(e)
  }
}

async function getAllSubscriptions() {
  try {
    let allSubscriptions = await subscriptionClient.getAllSubscriptions()
    console.log('all subscriptions:')
    console.log(allSubscriptions)
  } catch (e) {
    console.error(e)
  }
}

async function getSubscription(subscriptionId) {
  try {
    let subscriptionObject = await subscriptionClient.getSubscription(subscriptionId)
      .then(result => result.data)
    console.log('subscriptionObject from getSubscription')
    console.log(subscriptionObject)
  } catch (e) {
    console.error(e)
  }
}

async function updateSubscription(subscription) {
  try {
    subscription.dataDeliveryFormat = 'JSON'
    let returnedSubscriptionRequest = await subscriptionClient.updateSubscription(subscription)
    console.log('subscriptionObject from updateSubscription')
    console.log(returnedSubscriptionRequest)
    return returnedSubscriptionRequest
  } catch (e) {
    console.error(e)
  }
}

async function main() {
  await getAllSubscriptions()
  let subscription = await createSubscription()
  await updateSubscription(subscription)
  await getSubscription(subscription.subscriptionId)
  await deleteSubscription(subscription.subscriptionId)
}

main()

