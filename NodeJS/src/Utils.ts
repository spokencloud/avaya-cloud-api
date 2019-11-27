import { Err, JsonDecoder } from "ts.data.json";
import SkillPriority from "./AgentClient";

export default function isValidParameter(key: string, parameter: any): boolean {
    if (parameter === undefined) {
        console.error(key + ' was undefined');
        return false;
    }
    return true;
}


export const skillDecoder = JsonDecoder.object<SkillPriority>(
    {
        skillNumber: JsonDecoder.number,
        skillPriority: JsonDecoder.number
    },
    'SkillPriority'
);

export function isValidSkillsWithPriorities(key: string, skillPriorities: string): boolean {
    let obj: [SkillPriority] = JSON.parse(skillPriorities);
    for (let skill of obj) {
        if (skillDecoder.decode(skill) instanceof Err) {
            return false;
        }
    }
    return true;
}
export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
