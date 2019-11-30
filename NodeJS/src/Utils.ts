import { Err, JsonDecoder } from "ts.data.json";
import SkillPriority from "./AgentClient";
import {REPLACE_REGEX, EMPTY_STRING} from "./Constants"

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

export function randomString(length: number): string {
    let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let outString: string = inOptions.charAt(Math.floor(Math.random() * 26));

    for (let i = 1; i < length; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
  }


export function isValidSkillsWithPriorities(key: string, skillPriorities: string): boolean {
    let obj: [SkillPriority] = JSON.parse(skillPriorities);
    for (let skill of obj) {
        if (skillDecoder.decode(skill) instanceof Err) {
            return false;
        }
    }
    return true;
}
/**
 * sleep for millis seconds must be called with await
 * @param ms 
 */
export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}


export function removeSingleQuote(s:string){
    return s.replace(REPLACE_REGEX, EMPTY_STRING);
}

export function getValue(key: string, args: any){
    let value = removeSingleQuote(args[key])
    if(isValidParameter(key, value)){
        return value
    }else {
        throw new Error(`${key} needs to be specified`)
    }
}
