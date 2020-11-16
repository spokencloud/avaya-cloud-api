import { Ok } from 'ts.data.json'
import { SkillPriority } from '../src/models'
import isValidParameter, {
  hasAllowableCharacters,
  hasLowerCase,
  hasSpecialCharacter,
  hasUpperCase,
  hasWhiteSpace,
  isEmpty,
  isTokenWellFormed,
  isValidLocalUrl,
  isValidPassword,
  isValidSkillsWithPriorities,
  isValidUrl,
  isValidUsername,
  randomString,
  skillDecoder,
  sleep
} from '../src/Utils'
describe('Utils.ts', () => {
  test('isValidParameter should return false when param is undefined', () => {
    const param = undefined
    expect(isValidParameter('key', param)).toBe(false)
  })
  test('isValidParameter should return true when param is false', () => {
    const param = false
    expect(isValidParameter('key', param)).toBe(true)
  })
  test('isValidParameter should return true when param is number', () => {
    const param = 5
    expect(isValidParameter('key', param)).toBe(true)
  })

  test('SkillDecoder could decodePromise', async () => {
    const skill1 = { skillNumber: 5, skillPriority: 10 }
    const obj = await skillDecoder.decodePromise(skill1)
    expect(obj).toEqual(skill1)
  })
  test('SkillDecoder could decode', () => {
    const skill1 = { skillNumber: 5, skillPriority: 10 }
    const result = skillDecoder.decode(skill1)
    expect(result).toBeInstanceOf(Ok)
    const ok = result as Ok<SkillPriority>
    // use toEqual to compare a SkillPriority object and a plain object
    expect(ok.value).toEqual(skill1)
  })
  test('isValidSkillsWithPriorities should return true', () => {
    const skill1 = { skillNumber: 5, skillPriority: 10 }
    const skill2 = { skillNumber: 5, skillPriority: 10 }
    const skills = [skill1, skill2]
    const str = JSON.stringify(skills)
    const isValid = isValidSkillsWithPriorities('notused', str)
    expect(isValid).toBeTruthy()
  })
  test('isValidSkillsWithPriorities should return false', () => {
    const skill1 = { skillNumber: 5, skillPriority: 10 }
    const skill2 = { skillNumber: 5 }
    const skills = [skill1, skill2]
    const str = JSON.stringify(skills)
    const isValid = isValidSkillsWithPriorities('notused', str)
    expect(isValid).toBeFalsy()
  })
  test('sleep should sleep', async () => {
    const d1 = new Date()
    const start = d1.getTime()
    const milliseconds = 50
    await sleep(milliseconds)
    const d2 = new Date()
    const end = d2.getTime()
    // console.log(`end=${end}, start=${start}, differenece=${end - start}`)
    expect(end - start >= milliseconds).toBeTruthy()
  })
  test('randomString should return string of correct length', () => {
    const actual = randomString(10)
    expect(actual.length).toEqual(10)
  })
  test('hasWhiteSpace should return true', () => {
    expect(hasWhiteSpace(' ')).toBeTruthy()
    expect(hasWhiteSpace('a b')).toBeTruthy()
  })
  test('hasSpecialCharacter should return true', () => {
    expect(hasSpecialCharacter('@')).toBeTruthy()
  })
  test('hasSpecialCharacter should return false', () => {
    expect(hasSpecialCharacter('abc')).toBeFalsy()
    expect(hasSpecialCharacter('123')).toBeFalsy()
    expect(hasSpecialCharacter('')).toBeFalsy()
  })
  test('hasLowerCase should return true', () => {
    expect(hasLowerCase('abcABC')).toBeTruthy()
    expect(hasLowerCase('a123232')).toBeTruthy()
  })
  test('hasLowerCase should return false', () => {
    expect(hasLowerCase('A123232')).toBeFalsy()
    expect(hasLowerCase('@#@$ 22492')).toBeFalsy()
    expect(hasLowerCase('')).toBeFalsy()
    expect(hasLowerCase(' ')).toBeFalsy()
  })
  test('hasUpperCase should return true', () => {
    expect(hasUpperCase('abcABC')).toBeTruthy()
    expect(hasUpperCase('abcA')).toBeTruthy()
    expect(hasUpperCase('A21323')).toBeTruthy()
  })
  test('hasUpperCase should return false', () => {
    expect(hasUpperCase('abc')).toBeFalsy()
    expect(hasUpperCase('')).toBeFalsy()
    expect(hasUpperCase(' ')).toBeFalsy()
  })
  test('isValidPassword should return true', () => {
    expect(isValidPassword('Passw0rd@')).toBeTruthy()
    expect(isValidPassword('Passw0rd@kklwerwer')).toBeTruthy()
  })
  test('isValidPassword should return false', () => {
    expect(isValidPassword('Passw0rd')).toBeFalsy()
    expect(isValidPassword('@kklwerwer')).toBeFalsy()
    expect(isValidPassword('@ABCDEF')).toBeFalsy()
    expect(isValidPassword('12Aa@@')).toBeFalsy() // to short
    expect(isValidPassword('Passw0rdPassw0rdPassw0rdPassw@@@@@@@')).toBeFalsy()
  })
  test('hasAllowableCharacters should return false', () => {
    expect(hasAllowableCharacters(';')).toBeFalsy()
    expect(hasAllowableCharacters(',')).toBeFalsy()
  })
  test('isValidUsername should return true', () => {
    expect(isValidUsername('johnsmith')).toBeTruthy()
    expect(isValidUsername('john-smith')).toBeTruthy()
    expect(isValidUsername('john_smith')).toBeTruthy()
    expect(isValidUsername('john-smith')).toBeTruthy()
    expect(isValidUsername('john.smith')).toBeTruthy()
    expect(
      isValidUsername('1234567890123456789012345678901234567890123456789')
    ).toBeTruthy()
  })
  test('isValidUsername should return false', () => {
    expect(isValidUsername('j')).toBeFalsy()
    expect(
      isValidUsername('12345678901234567890123456789012345678901234567890')
    ).toBeFalsy()
  })
  test('isEmpty should return true', () => {
    expect(isEmpty('')).toBeTruthy()
    expect(isEmpty(undefined)).toBeTruthy()
    expect(isEmpty(null)).toBeTruthy()
    expect(isEmpty('')).toBeTruthy()
    expect(isEmpty('  ')).toBeTruthy()
    expect(isEmpty({})).toBeTruthy()
    expect(isEmpty([])).toBeTruthy()
  })
  test('isEmpty should return false', () => {
    expect(isEmpty(0)).toBeFalsy()
    expect(isEmpty('hi')).toBeFalsy()
  })
  test('isTokenWellFormed should return true for valid token', () => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY'
    expect(isTokenWellFormed(token)).toBeTruthy()
  })
  test('isTokenWellFormed should return false for invalid token', () => {
    const token = 'header.payload.signature'
    expect(isTokenWellFormed(token)).toBeFalsy()
  })
  test('isValidUrl should return true with valid url string', () => {
    expect(isValidUrl('http://localhost:8080')).toBeTruthy()
    expect(isValidUrl('http://www.google.com')).toBeTruthy()
    expect(isValidUrl('https://integration.bpo.avaya.com')).toBeTruthy()
    expect(isValidUrl('https://login.bpo.avaya.com')).toBeTruthy()
  })
  test('isValidUrl should return false with invalid url string', () => {
    expect(isValidUrl('http://localhost:123456')).toBeFalsy()
    expect(isValidUrl('')).toBeFalsy()
    expect(isValidUrl(' ')).toBeFalsy()
    expect(isValidUrl('example')).toBeFalsy()
  })
  test('isValidLocalUrl should return true', () => {
    expect(isValidLocalUrl('http://localhost:8080')).toBeTruthy()
    expect(isValidLocalUrl('http://localhost:80')).toBeTruthy()
  })
  test('isValidLocalUrl should return false', () => {
    // too many digits in port number
    expect(isValidLocalUrl('http://localhost:987654')).toBeFalsy()
    // too few digits in port number
    expect(isValidLocalUrl('http://localhost:9')).toBeFalsy()
    // no port number specified
    expect(isValidLocalUrl('http://localhost:')).toBeFalsy()
  })
})
