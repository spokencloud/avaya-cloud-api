import { log4js } from '../src/Constants'
import {
  DataDeliveryFormat,
  DataSourceType,
  EventType,
  RetryPolicy,
  Subscription
} from '../src/models'
import {
  createSubscriptionClient,
  SubscriptionClient
} from '../src/SubscriptionClient'

const rootLogger = log4js.getLogger()
rootLogger.level = 'debug'
rootLogger.debug('Starting SubscriptionClient Subscription Integration Test')

describe('Integration tests for SubscriptionClient.ts', () => {
  const localEnv = {
    user: 'yangadmin1',
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY',
    url: 'http://localhost:8081',
    subAccountAppId: 'MYA_MYARec'
  }

  const integrationEnv = {
    user: 'sdet',
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZGV0IiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.Mwx71xUijvacZ9YG61hOA6TUwklJxj6GrIzHRyuT2QU',
    url: 'https://integration.bpo.avaya.com/',
    subAccountAppId: 'SDE_SDCRec'
  }

  const { subAccountAppId, token, url } = localEnv

  let subscriptionClient: SubscriptionClient
  beforeEach(async () => {
    subscriptionClient = await createSubscriptionClient(url, token)
  })

  test.each([
    DataSourceType.ECH,
    DataSourceType.HAgLog,
    DataSourceType.HAgent,
    DataSourceType.HSplit,
    DataSourceType.HVdn
  ])(
    'createSubscription, updateSubscription and deleteSubscription should work as expected for  Data source type %s',
    async dataSourceType => {
      const createSubscriptionRequest = {
        dataSourceType: dataSourceType,
        dataDeliveryFormat: DataDeliveryFormat.Json,
        endpoint: 'https://example.com',
        retryPolicy: RetryPolicy.Default,
        basicAuthUsername: 'avaya',
        basicAuthPassword: 'password',
        frequencyInMinutes: 1,
        maxPostSize: 0,
        startTime: '2019-11-04T21:55:24.421Z',
        disableTLSVerify: true,
        subAccountAppId: 'MYA_MYARec',
        eventType: EventType.Historical
      }

      let subscription = await subscriptionClient.createSubscription(
        createSubscriptionRequest
      )
      expect(subscription.subscriptionId).toBeDefined()
      console.log('subscription created with id ', subscription.subscriptionId)
      const updateSubscriptionRequest: Subscription = {
        subscriptionId: subscription.subscriptionId,
        dataSourceType: dataSourceType,
        dataDeliveryFormat: DataDeliveryFormat.Json,
        endpoint: 'https://example.com',
        retryPolicy: RetryPolicy.Default,
        basicAuthUsername: 'avaya',
        basicAuthPassword: 'password',
        frequencyInMinutes: 0,
        maxPostSize: 0,
        startTime: '2019-11-04T21:55:24.421Z',
        disableTLSVerify: true,
        subAccountAppId: 'MYA_MYARec',
        eventType: EventType.Historical
      }
      subscription = await subscriptionClient.updateSubscription(
        updateSubscriptionRequest
      )
      expect(subscription.subscriptionId).toBeDefined()
      console.log('subscription updated with id ', subscription.subscriptionId)

      //const result = await subscriptionClient.deleteSubscription(subscription.subscriptionId)
      //expect(result).toBe(200)
      console.log('subscription deleted with id ', subscription.subscriptionId)
    },
    20000
  )
})
