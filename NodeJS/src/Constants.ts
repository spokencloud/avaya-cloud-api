export const lodash = require('lodash');
export const axios = require('axios').default;
export const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default;
export const tough = require('tough-cookie');

export const STATION_NAME = 'generated station';
export const AGENT_FIRST_NAME = 'generated';
export const AGENT_LAST_NAME = 'agent';
export const USER_PATH = 'user';
export const STATION_GROUP_PATH = 'spokenAbc/agentStationGroups/client';
export const AGENT_JOB_PATH = 'spokenAbc/jobs/agents';
export const FETCH_SKILL_ID_PATH = 'spokenAbc/skills/multiClientSkills?clientIds=';
export const STATION_JOB_PATH = 'spokenAbc/jobs/stations';
export const EXTENSION_PATH = 'spokenAbc/extensions/next';
export const STATION_ONLY_PATH = 'spokenAbc/stations?clientId=';
export const REMOVE_AGENT_PATH = 'spokenAbc/agents/removeAgent';
export const DELETE_STATION_PATH = 'spokenAbc/jobs/stations';
export const FETCH_AGENT_BY_USERNAME_PATH = 'spokenAbc/agents/username';
export const FETCH_AGENT_ID_PATH = 'spokenAbc/agents/loginId';
export const USER_QUESTION_ANSWER_PATH = '/user/question/answer';

export const VERSION = '1.0';
export const SUBSCRIPTION_PATH = 'spokenAbc/subscriptions/v' + VERSION + '/subscriptions';
export const SLASH = '/';
export const SUB_ACCOUNT_KEY = 'subAccountAppId=';
export const QUESTION_MARK = '?';

export const ENDPOINT_KEY = 'endpoint';
export const API_KEY = 'api_key';
export const AGENT_USERNAME_KEY = 'agent_username';
export const AGENT_PASSWORD_KEY = 'agent_password';
export const AGENT_SKILL_KEY = 'agent_skill';
export const REPLACE_REGEX = /'/g;
export const EMPTY_STRING = "";
// ten seconds
export const INTERVAL_IN_MILLIS = 10000;
export const MAX_RETRY = 5;
