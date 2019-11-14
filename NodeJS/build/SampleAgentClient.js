"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("ts.data.json/dist/result");
var args = require('minimist')(process.argv.slice(2));
var ENDPOINT_KEY = 'endpoint';
var ADMIN_USERNAME_KEY = 'admin_username';
var ADMIN_PASSWORD_KEY = 'admin_password';
var AGENT_USERNAME_KEY = 'agent_username';
var AGENT_PASSWORD_KEY = 'agent_password';
var AGENT_SKILL_KEY = 'agent_skill';
var REPLACE_REGEX = /'/g;
var EMPTY_STRING = "";
var endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var agentUsername = args[AGENT_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var agentPassword = args[AGENT_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var agentSkill = args[AGENT_SKILL_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
function isValidParameter(key, parameter) {
    if (parameter === undefined) {
        console.log(key + ' was undefined');
        return false;
    }
    return true;
}
var ts_data_json_1 = require("ts.data.json");
var skillDecoder = ts_data_json_1.JsonDecoder.object({
    skillNumber: ts_data_json_1.JsonDecoder.number,
    skillPriority: ts_data_json_1.JsonDecoder.number
}, 'Skill Priority Combination');
function isValidSkillsWithPriorities(key, skillPriorities) {
    var obj = JSON.parse(skillPriorities);
    for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
        var skill = obj_1[_i];
        if (skillDecoder.decode(skill) instanceof result_1.Err) {
            return false;
        }
    }
    return true;
}
var isSkillValid = isValidSkillsWithPriorities(AGENT_SKILL_KEY, agentSkill);
var isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint);
var isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername);
var isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword);
var isAgentUsernameValid = isValidParameter(AGENT_USERNAME_KEY, agentUsername);
var isAgentPasswordValid = isValidParameter(AGENT_PASSWORD_KEY, agentPassword);
if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid ||
    !isAgentUsernameValid ||
    !isAgentPasswordValid || !isSkillValid) {
    console.log("Invalid input provided..!!");
    process.exit();
}
var session_1 = require("./session");
var AgentClient_1 = require("./AgentClient");
var session = session_1.createSession(endpoint, adminUsername, adminPassword);
var agentClient = AgentClient_1.createAgentClient(session);
var skillWithPriorities = JSON.parse(agentSkill);
function createAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var agentObject, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, agentClient.createAgent(agentUsername, agentPassword, skillWithPriorities)];
                case 1:
                    agentObject = _a.sent();
                    console.log('agentObject from createAgent');
                    console.log(agentObject);
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var agentObject, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, agentClient.getAgent(agentUsername)];
                case 1:
                    agentObject = _a.sent();
                    console.log('agentObject from getAgent');
                    console.log(agentObject);
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, agentClient.deleteAgent(agentUsername)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    console.error(e_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function agentSkillNumbers() {
    return __awaiter(this, void 0, void 0, function () {
        var e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, agentClient.getSkillNumbers()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_4 = _a.sent();
                    console.error(e_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createAgent()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getAgent()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, deleteAgent()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
