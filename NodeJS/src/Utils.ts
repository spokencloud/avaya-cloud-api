/**
 * @hidden
 * @ignore
 * @internal
 */

/**
 * This comment and the above tags will tell typedoc to ignore the whole module.
 */

import { Err, JsonDecoder } from 'ts.data.json'
import { EMPTY_STRING, jwt, log4js, REPLACE_REGEX } from './Constants'
import { SkillPriority } from './models'
const logger = log4js.getLogger('Utils')
const URL = require('url').URL
// Username in mpact.user and ac_station.user is 50 chars long; Bulk upload uses 49, so does here.
const MAX_USERNAME_LENGTH = 49

export default function isValidParameter(key: string, parameter: any): boolean {
  if (parameter === undefined) {
    logger.error(key + ' was undefined')
    return false
  }
  return true
}

export const skillDecoder = JsonDecoder.object<SkillPriority>(
  {
    skillNumber: JsonDecoder.number,
    skillPriority: JsonDecoder.number
  },
  'SkillPriority'
)

export function randomString(length: number): string {
  const inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let outString: string = inOptions.charAt(Math.floor(Math.random() * 26))

  for (let i = 1; i < length; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length))
  }

  return outString
}

export function isValidSkillsWithPriorities(
  key: string,
  skillPriorities: string
): boolean {
  const obj: SkillPriority[] = JSON.parse(skillPriorities)
  for (const skill of obj) {
    if (skillDecoder.decode(skill) instanceof Err) {
      return false
    }
  }
  return true
}
/**
 * sleep for millis seconds must be called with await
 * @param ms
 */
export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function removeSingleQuote(s: string) {
  return s.replace(REPLACE_REGEX, EMPTY_STRING)
}

export function getValue(key: string, args: any) {
  const value = args[key]
  if (isValidParameter(key, value)) {
    return removeSingleQuote(value)
  } else {
    throw new Error(`${key} needs to be specified`)
  }
}

/**
 * check if password is valid
 * @param password, min length 8, max length 32, must have a uppercase character, must have at least one lowercase char, no whitespace, must contains a number, must contain one of ~!@?#$%^&*_
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 32) {
    return false
  }
  if (!hasLowerCase(password)) {
    return false
  }
  if (!hasUpperCase(password)) {
    return false
  }
  if (!hasSpecialCharacter(password)) {
    return false
  }
  if (hasWhiteSpace(password)) {
    return false
  }
  return true
}
export function hasLowerCase(str: string) {
  return /[a-z]/.test(str)
}
export function hasUpperCase(str: string) {
  return /[A-Z]/.test(str)
}

export function hasSpecialCharacter(str: string) {
  return /[~!@?#$%^&*_]/.test(str)
}

export function hasWhiteSpace(str: string) {
  return /\s/g.test(str)
}

export function hasAllowableCharacters(str: string) {
  return /^[-.@\w]+$/g.test(str)
}
/**
 * check if a username is valid
 * @param username min length 2, max length 49, must pass ^[-.@\w]+$
 */
export function isValidUsername(username: string): boolean {
  if (username.length < 2 || username.length > MAX_USERNAME_LENGTH) {
    return false
  }
  return hasAllowableCharacters(username)
}

export function isEmpty(data: any): boolean {
  if (typeof data === 'object') {
    if (JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]') {
      return true
    } else if (!data) {
      return true
    }
    return false
  } else if (typeof data === 'string') {
    if (!data.trim()) {
      return true
    }
    return false
  } else if (typeof data === 'undefined') {
    return true
  } else {
    return false
  }
}

export function isTokenWellFormed(token: string): boolean {
  if (isEmpty(token)) {
    return false
  }
  try {
    const payload = jwt.decode(token)
    return !isEmpty(payload)
  } catch (error) {
    logger.warn(error)
    return false
  }
}

export function isValidLocalUrl(url: string): boolean {
  const regex = /^https?:\/\/localhost:\d{2,5}$/
  return regex.test(url)
}

export function isValidUrl(url: string): boolean {
  if (isEmpty(url)) {
    return false
  }
  if (url.includes('localhost')) {
    return isValidLocalUrl(url)
  }
  try {
    new URL(url)
    return true
  } catch (error) {
    logger.warn(error)
    return false
  }
}
