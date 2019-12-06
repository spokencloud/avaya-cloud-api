import isValidParameter, { skillDecoder, randomString, isValidSkillsWithPriorities, sleep } from "../src/Utils"
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
})
