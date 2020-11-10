//
// The Subscription type describes an Avaya Cloud data subscription. A subscription is scoped to the
// sub account identified in the session.
//
export enum DataSourceType {
  ECH = 'ECH',
  HAgLog = 'HAGLOG',
  HAgent = 'HAGENT',
  RtAgentState = 'RT_AGENT_STATE',
  RtDidState = 'RT_DID_STATE',
  RtSkillState = 'RT_SKILL_STATE',
  RtVdnState = 'RT_VDN_STATE',
  RealTimeFeed = 'REAL_TIME_FEED'
}

export enum DataDeliveryFormat {
  Csv = 'CSV',
  Json = 'JSON'
}

export enum RetryPolicy {
  Default = 'DEFAULT'
}

export enum EventType {
  Historical = 'HISTORICAL',
  Realtime = 'REALTIME'
}

export interface Subscription {
  // The ID of this subscription. Leave blank for new subscriptions.
  subscriptionId: string

  // The ID of the user account, this will be filled in by the SubscriptionClient
  subAccountAppId: string

  // The name of the data source for the subscription. Valid values are:
  //   ECH, HAGLOG, HAGENT, RT_AGENT_STATE, RT_DID_STATE, RT_SKILL_STATE, RT_VDN_STATE
  //
  // A subscription is for exactly one data source. You can create multiple subscriptions for
  // multiple data sources.
  dataSourceType: DataSourceType

  // The start time of the subscription. When created, the data will be sent starting from
  // StartTime. If StartTime is zero, data is sent from "The Beginning of Time". The beginning
  // of time for the real-time tables is the current time minus 24 hours.
  startTime: string

  // The frequency of how often data is sent. If the value is zero (default) data is sent as
  // quickly as possible.  Other values (ex: 10-mintues) try to batch data for up to Frequency units.
  // Data can always come faster if buffers on the producer side fill up. The guarantee is that
  // the producer will be flushed at least every Frequency units.
  //
  // The data producer can modify the frequency to match the frequency of the data source. When
  // you do a get on a subscription this value will be set to the anticipated actual frequency.
  frequencyInMinutes: number

  // The maximum size (in bytes) of a POST request that the endpoint can accept. The producer will
  // always flush before exceeding this number of bytes. The default (0) is unlimited.
  maxPostSize: number

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
  dataDeliveryFormat: DataDeliveryFormat

  // The endpoint where data will be sent. Data is sent via an HTTP 1.1 POST request in the format described
  // by the Format parameter. The specified protocol must be http or https. If a port is specified it will
  // be used instead of the default port for the protocol.
  //
  // Multiple subscriptions may share the same endpoint. Any given POST request to the endpoint will contain
  // data for exactly one subscription (no mixing).
  //
  // If you do share endpoints you must disambiguate the data in the request on the endpoint side.  Since this
  // might be a challenge using a URL query string or path parameters to disambiguate could be an option.
  endpoint: string

  // If set, any TLS certificates will not be verified when connecting to the endpoint. This is necessary
  // if the endpoint has a self-signed certificate or doesn't not require verification for some other reason.
  disableTLSVerify?: boolean

  // If set, the producer will use the indicated BasicAuth username and password to connect to the
  // endpoint. BasicAuth will only be used if the protocol is https.
  basicAuthUsername?: string
  basicAuthPassword?: string

  // This read-only field, when non zero, gives the oldest time where we dropped data due a failure to
  // send data to an endpoint. There is no information on why the transmission failed or how long
  // the outage lasted.
  //
  // As a consumer you can only know that some data may have been lost at or after this time. The two
  // decisions a consumer can make are to ignore this or modify the subscription to start at or before
  // this time. In the latter case, any missing data will be resent.
  //
  // Whenever a subscription is updated, this field is reset to zero.
  oldestError?: string

  // This read-only field, indicates the number of POST requests that have been lost since OldestError.
  // A POST request is lost when it is dropped because the internal retry-limit has been exceeded (see
  // `RetryPolicy`). This count is reset whenever the subscription is updated. NOT YET IMPLEMENTED.
  LostPostRequests?: number

  // This read-only field, indicates the number of records that have been lost since OldestError.
  // A record is lost when its POST request is dropped because the internal retry-limit has been exceeded
  // (see `RetryPolicy`). This count is reset whenever the subscription is updated. NOT YET IMPLEMENTED.
  LostRecords?: number

  // This read-only field, when non zero, gives the time data was last sent to the endpoint.
  lastDataSent?: string

  // Errors happen as a normal course of events. When a transmission error occurs, the producer uses an
  // exponential backoff policy and retries several times after which it sets OldestError and drops the
  // data being sent.
  //
  // If unspecified, the policy is DEFAULT
  //
  // You can change this policy with these settings:
  //   DEFAULT: Use the default exponential backoff policy.
  retryPolicy: RetryPolicy

  eventType: EventType
}

export type CreateSubscriptionData = Omit<
  Subscription,
  | 'subscriptionId'
  | 'subAccountAppId'
  | 'oldestError'
  | 'LostPostRequests'
  | 'LostRecords'
  | 'lastDataSent'
>
