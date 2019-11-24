import isValidParameter, { skillDecoder, isValidSkillsWithPriorities } from "../src/Utils"
import { Ok, Err } from "ts.data.json";
import SkillPriority from "../src/AgentClient";
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

    test("SkillDecoder could decodePromise", async (done) => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let obj = await skillDecoder.decodePromise(skill1)
        expect(obj).toEqual(skill1)
        done()
    });
    test("SkillDecoder could decode", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let result = skillDecoder.decode(skill1)
        expect(result).toBeInstanceOf(Ok)
        let ok = result as Ok<SkillPriority>
        // Since left is SkillPriority object and right a plain object, use toEqual,not toBe
        expect(ok.value).toEqual(skill1)
    });
    test("isValidSkillsWithPriorities should return true", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let skill2 = { skillNumber: 5, skillPriority: 10 }
        let skills = [ skill1, skill2 ]
        let str = JSON.stringify(skills)
        let isValid = isValidSkillsWithPriorities('notused', str)
        expect(isValid).toBeTruthy()
    })
    test("isValidSkillsWithPriorities should return false", () => {
        let skill1 = { skillNumber: 5, skillPriority: 10 }
        let skill2 = { skillNumber: 5 }
        let skills = [ skill1, skill2 ]
        let str = JSON.stringify(skills)
        let isValid = isValidSkillsWithPriorities('notused', str)
        expect(isValid).toBeFalsy()
    })
})
