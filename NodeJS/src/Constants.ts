/**
 * @hidden
 * @ignore
 * @internal
 */

/**
 * This comment and the above tags will tell typedoc to ignore the whole module.
 */

export const lodash = require('lodash')
export const jwt = require('jsonwebtoken')
export const axios = require('axios').default
export const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support')
  .default
export const tough = require('tough-cookie')
export const log4js = require('@log4js-node/log4js-api')
export const AGENT_FIRST_NAME = 'generated'
export const AGENT_LAST_NAME = 'agent'
export const USER_PATH = 'user'
export const STATION_GROUP_PATH =
  'spokenAbc/v2/sub-accounts/{subAccountAppId}/agentStationGroups'
export const AGENT_JOB_PATH = 'spokenAbc/jobs/agents/v3'
export const SKILLV2_PATH = 'spokenAbc/skillsv2'
export const FETCH_SKILL_ID_PATH = `${SKILLV2_PATH}?subAccountAppId=`
export const EXTENSION_PATH = 'spokenAbc/extensions/next'
export const NUMBER_PATH = 'spokenAbc/numbers/next'
export const REMOVE_AGENT_PATH = 'spokenAbc/agents/removeAgent'
export const FETCH_AGENT_BY_USERNAME_PATH = 'spokenAbc/agents/username'
export const FETCH_AGENT_ID_PATH = 'spokenAbc/agents/loginId'

export const VERSION = '1.0'
export const SUBSCRIPTION_PATH =
  'spokenAbc/subscriptions/v' + VERSION + '/subscriptions'
export const SLASH = '/'
export const SUB_ACCOUNT_KEY = 'subAccountAppId'
export const QUESTION_MARK = '?'

export const ENDPOINT_KEY = 'endpoint'
export const API_KEY = 'api_key'
export const AGENT_USERNAME_KEY = 'agent_username'
export const AGENT_PASSWORD_KEY = 'agent_password'
export const AGENT_SKILL_KEY = 'agent_skill'
export const REPLACE_REGEX = /'/g
export const EMPTY_STRING = ''
// ten seconds
export const INTERVAL_IN_MILLIS = 10000
export const MAX_RETRY = 5

// aux code
export const FETCH_AUXCODE_BASE = 'spokenAbc/clients'
export const FETCH_AUX_CODES = 'auxCodes'
export const FETCH_EFFECTIVE_AUX_CODES = 'auxCodes'
export const FETCH_AUX_CODE_WITH_SUBACCOUNT_APP_ID = 'auxCodes/effective-appId'

// default skill name
export const DEFAULT_SKILL_NAME = 'DEFAULT_SKILL'
export const DEFAULT_SKILL_PRIORITY = 3
export const SKILL_TYPE_AGENT = 'AGENT'
