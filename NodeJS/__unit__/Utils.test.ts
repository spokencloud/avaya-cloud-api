import isValidParameter, { skillDecoder, randomString, isValidSkillsWithPriorities, sleep, hasAllowableCharacters, hasWhiteSpace, hasSpecialCharacter, hasLowerCase, hasUpperCase, isValidPassword, isValidUsername } from "../src/Utils"
import { Ok } from "ts.data.json";
import { SkillPriority } from "../src/models";
describe("Utils.ts", () => {

    test("isValidParameter should return false when param is undefined", () => {
        let param
        expect(isValidParameter("key", param)).toBe(false);
    });
    test("isValidParameter should return true when param is false", () => {
        let param = false;
        expect(isValidParameter("key", param)).toBe(true);
    });
    test("isValidParameter should return true when param is number", () => {
        let param = 5;
        expect(isValidParameter("key", param)).toBe(true);
    });

    test("SkillDecoder could decodePromise", async () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let obj = await skillDecoder.decodePromise(skill1)
        expect(obj).toEqual(skill1)
    });
    test("SkillDecoder could decode", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let result = skillDecoder.decode(skill1)
        expect(result).toBeInstanceOf(Ok)
        let ok = result as Ok<SkillPriority>
        // use toEqual to compare a SkillPriority object and a plain object
        expect(ok.value).toEqual(skill1)
    });
    test("isValidSkillsWithPriorities should return true", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let skill2 = { skillNumber: 5, skillPriority: 10 }
        let skills = [skill1, skill2]
        let str = JSON.stringify(skills)
        let isValid = isValidSkillsWithPriorities('notused', str)
        expect(isValid).toBeTruthy()
    })
    test("isValidSkillsWithPriorities should return false", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let skill2 = { skillNumber: 5 }
        let skills = [skill1, skill2]
        let str = JSON.stringify(skills)
        let isValid = isValidSkillsWithPriorities('notused', str)
        expect(isValid).toBeFalsy()
    })
    test("sleep should sleep", async () => {
        let d1 = new Date();
        let start = d1.getTime();
        const milliseconds = 50
        await sleep(milliseconds)
        let d2 = new Date();
        let end = d2.getTime();
        // console.log(`end=${end}, start=${start}, differenece=${end - start}`)
        expect((end - start) >= milliseconds).toBeTruthy()
    })
    test("randomString should return string of correct length", () => {
        let actual = randomString(10)
        expect(actual.length).toEqual(10)
    })
    test("hasWhiteSpace should return true", () => {
        expect(hasWhiteSpace(" ")).toBeTruthy()
        expect(hasWhiteSpace("a b")).toBeTruthy()
    })
    test("hasSpecialCharacter should return true", () => {
        expect(hasSpecialCharacter("@")).toBeTruthy()
    })
    test("hasSpecialCharacter should return false", () => {
        expect(hasSpecialCharacter("abc")).toBeFalsy()
        expect(hasSpecialCharacter("123")).toBeFalsy()
        expect(hasSpecialCharacter("")).toBeFalsy()
    })
    test("hasLowerCase should return true", () => {
        expect(hasLowerCase("abcABC")).toBeTruthy()
        expect(hasLowerCase("a123232")).toBeTruthy()
    })
    test("hasLowerCase should return false", () => {
        expect(hasLowerCase("A123232")).toBeFalsy()
        expect(hasLowerCase("@#@$ 22492")).toBeFalsy()
        expect(hasLowerCase("")).toBeFalsy()
        expect(hasLowerCase(" ")).toBeFalsy()
    })
    test("hasUpperCase should return true", () => {
        expect(hasUpperCase("abcABC")).toBeTruthy()
        expect(hasUpperCase("abcA")).toBeTruthy()
        expect(hasUpperCase("A21323")).toBeTruthy()
    })
    test("hasUpperCase should return false", () => {
        expect(hasUpperCase("abc")).toBeFalsy()
        expect(hasUpperCase("")).toBeFalsy()
        expect(hasUpperCase(" ")).toBeFalsy()
    })
    test("isValidPassword should return true", () => {
        expect(isValidPassword("Passw0rd@")).toBeTruthy()
        expect(isValidPassword("Passw0rd@kklwerwer")).toBeTruthy()
    })
    test("isValidPassword should return false", () => {
        expect(isValidPassword("Passw0rd")).toBeFalsy()
        expect(isValidPassword("@kklwerwer")).toBeFalsy()
        expect(isValidPassword("@ABCDEF")).toBeFalsy()
        expect(isValidPassword("12Aa@@")).toBeFalsy() // to short
        expect(isValidPassword("Passw0rdPassw0rdPassw0rdPassw@@@@@@@")).toBeFalsy()
    })
    test("hasAllowableCharacters should return false", () => {
        expect(hasAllowableCharacters(";")).toBeFalsy()
        expect(hasAllowableCharacters(",")).toBeFalsy()
    })
    test("isValidUsername should return true", () => {
        expect(isValidUsername("johnsmith")).toBeTruthy()
        expect(isValidUsername("john-smith")).toBeTruthy()
        expect(isValidUsername("john_smith")).toBeTruthy()
        expect(isValidUsername("john-smith")).toBeTruthy()
        expect(isValidUsername("john.smith")).toBeTruthy()
    })
    test("isValidUsername should return false", () => {
        expect(isValidUsername("j")).toBeFalsy()
        expect(isValidUsername("12345678901234567890abcdef")).toBeFalsy()
    })
})
