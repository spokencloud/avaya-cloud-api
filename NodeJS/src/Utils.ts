import {Err, JsonDecoder} from "ts.data.json";
import SkillPriority from "./AgentClient";

export default function isValidParameter(key: string, parameter: undefined): boolean {
    if (!parameter) {
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
    'Skill Priority Combination'
);

export function isValidSkillsWithPriorities(key: string, skillPriorities: string): boolean {
    let obj: [SkillPriority]  = JSON.parse(skillPriorities);
    for(let skill of obj){
        if(skillDecoder.decode(skill) instanceof Err){
            return false;
        }
    }
    return true;
}