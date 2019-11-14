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
var lodash = require('lodash');
var STATION_NAME = 'generated station';
var AGENT_FIRST_NAME = 'generated';
var AGENT_LAST_NAME = 'agent';
// ten seconds
var INTERVAL_IN_MILLIS = 10 * 1000;
var MAX_RETRY = 5;
var AgentClient = /** @class */ (function () {
    function AgentClient(session) {
        this.session = session;
    }
    AgentClient.prototype.createAgent = function (agent_username, agent_password, skillsWithPriority) {
        return __awaiter(this, void 0, void 0, function () {
            var subAccountId, agentStationGroupId, agentLoginId, skillIds, stationExtension;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.session.login()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getSubAccountId()];
                    case 2:
                        subAccountId = _a.sent();
                        return [4 /*yield*/, this.getAgentStationGroupId(subAccountId)];
                    case 3:
                        agentStationGroupId = _a.sent();
                        return [4 /*yield*/, this.generateExtension(subAccountId, 'AGENT')];
                    case 4:
                        agentLoginId = _a.sent();
                        return [4 /*yield*/, this.getSkillIds(subAccountId)];
                    case 5:
                        skillIds = _a.sent();
                        return [4 /*yield*/, this.sendCreateAgentRequest(subAccountId, agent_username, agent_password, agentStationGroupId, agentLoginId, skillIds, skillsWithPriority)];
                    case 6:
                        _a.sent();
                        // wait until agent is created
                        return [4 /*yield*/, this.waitForAgentCreation(agentLoginId)];
                    case 7:
                        // wait until agent is created
                        _a.sent();
                        return [4 /*yield*/, this.generateExtension(subAccountId, 'STATION')];
                    case 8:
                        stationExtension = _a.sent();
                        return [4 /*yield*/, this.sendCreateStationRequest(agentStationGroupId, subAccountId, stationExtension, agent_username)];
                    case 9:
                        _a.sent();
                        // wait until station is created
                        return [4 /*yield*/, this.waitForStationCreation(subAccountId, agent_username)];
                    case 10:
                        // wait until station is created
                        _a.sent();
                        return [2 /*return*/, this.getAgent(agent_username)];
                }
            });
        });
    };
    AgentClient.prototype.getAgentStationGroupId = function (subAccountId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.get('/spokenAbc/agentStationGroups/client/' + subAccountId)
                        .then(function (response) {
                        var agentStationGroups = response.data;
                        // ensure we always get the same subAccount ordering
                        agentStationGroups = lodash.sortBy(agentStationGroups, ['id']);
                        return agentStationGroups[0].id;
                    })];
            });
        });
    };
    AgentClient.prototype.sendCreateAgentRequest = function (subAccountId, agent_username, agent_password, agentStationGroupId, agentLoginId, skillIds, skillsWithPriority) {
        return __awaiter(this, void 0, void 0, function () {
            var securityCode, avayaPassword, agent;
            return __generator(this, function (_a) {
                securityCode = this.generateSecurityCode(agentLoginId);
                avayaPassword = this.generateAvayaPassword(agentLoginId);
                agent = {
                    "username": agent_username,
                    "firstName": AGENT_FIRST_NAME,
                    "lastName": AGENT_LAST_NAME,
                    "password": agent_password,
                    "loginId": agentLoginId,
                    "agentStationGroupId": agentStationGroupId,
                    "securityCode": securityCode,
                    "startDate": "2019-03-21",
                    "endDate": "2038-01-01",
                    "avayaPassword": avayaPassword,
                    "clientId": subAccountId,
                    "skillIds": skillIds,
                    "agentSkills": skillsWithPriority,
                    // no supervisors
                    "supervisorId": 0,
                    // channel 1 is voice
                    "channelIds": [1]
                };
                return [2 /*return*/, this.session.post('/spokenAbc/jobs/agents', agent)
                        .then(function (result) {
                        return result;
                    })];
            });
        });
    };
    AgentClient.prototype.generateAvayaPassword = function (agentLoginId) {
        var agentLoginIdString = agentLoginId.toString();
        var length = agentLoginIdString.length;
        return agentLoginIdString.substring(length - 6, length);
    };
    AgentClient.prototype.generateSecurityCode = function (agentLoginId) {
        var agentLoginIdString = agentLoginId.toString();
        var length = agentLoginIdString.length;
        return agentLoginIdString.substring(length - 4, length);
    };
    AgentClient.prototype.generateExtension = function (subAccountId, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.post('spokenAbc/extensions/next/' + subAccountId + '/type/' + type)
                        .then(function (response) {
                        return response.data;
                    })];
            });
        });
    };
    AgentClient.prototype.getSkillIds = function (subAccountId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.get('spokenAbc/skills/multiClientSkills?clientIds=' + subAccountId + '&skillType=AGENT')
                        .then(function (response) {
                        // console.log(response)
                        var skillResponses = response.data['skillResponses'][subAccountId];
                        return skillResponses.map(function (skillResponse) { return skillResponse.id; });
                    })];
            });
        });
    };
    AgentClient.prototype.getSkillNumbers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subAccountId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.session.login()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.session.getSubAccount()
                                .then(function (response) {
                                return response.id;
                            })];
                    case 2:
                        subAccountId = _a.sent();
                        return [2 /*return*/, this.session.get('spokenAbc/skills/multiClientSkills?clientIds=' + subAccountId + '&skillType=AGENT')
                                .then(function (response) {
                                var skillResponses = response.data['skillResponses'][subAccountId];
                                var availableSkills = [];
                                for (var _i = 0, skillResponses_1 = skillResponses; _i < skillResponses_1.length; _i++) {
                                    var skill = skillResponses_1[_i];
                                    var skillInfo = {
                                        "skillNumber": skill.number,
                                        "skillName": skill.name,
                                    };
                                    availableSkills.push(skillInfo);
                                }
                                console.log(availableSkills);
                                return availableSkills;
                            })];
                }
            });
        });
    };
    AgentClient.prototype.sendCreateStationRequest = function (agentStationGroupId, subAccountId, stationExtension, agentUsername) {
        return __awaiter(this, void 0, void 0, function () {
            var securityCode, station;
            return __generator(this, function (_a) {
                securityCode = this.generateSecurityCode(stationExtension);
                station = {
                    "agentStationGroupId": agentStationGroupId,
                    "clientId": subAccountId,
                    "extension": stationExtension,
                    "name": STATION_NAME,
                    "securityCode": securityCode,
                    "username": agentUsername
                };
                return [2 /*return*/, this.session.post('/spokenAbc/jobs/stations', station)
                        .then(function (result) {
                        // console.log(result.data)
                        return result;
                    })];
            });
        });
    };
    AgentClient.prototype.getAgent = function (agentUsername) {
        return __awaiter(this, void 0, void 0, function () {
            var agent, e_1, subAccountId, station, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.session.login()];
                    case 1:
                        _a.sent();
                        agent = {};
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.getAgentByUsername(agentUsername)];
                    case 3:
                        agent = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        if (e_1.response.status === 404) {
                            console.log('agent ' + agentUsername + ' not found');
                        }
                        else {
                            throw e_1;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, this.getSubAccountId()];
                    case 6:
                        subAccountId = _a.sent();
                        station = {};
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.getStationOnly(subAccountId, agentUsername)];
                    case 8:
                        station = _a.sent();
                        if (!station) {
                            console.log('station associated with ' + agentUsername + ' not found');
                            station = {};
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        e_2 = _a.sent();
                        if (e_2.response.status === 404) {
                            console.log('station associated with ' + agentUsername + ' not found');
                        }
                        else {
                            throw e_2;
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, { 'agent': agent, 'station': station }];
                }
            });
        });
    };
    AgentClient.prototype.getSubAccountId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.getSubAccount()
                        .then(function (response) {
                        return response.id;
                    })];
            });
        });
    };
    AgentClient.prototype.getAgentByUsername = function (agent_username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.get('/spokenAbc/agents/username/' + agent_username)
                        .then(function (response) {
                        // console.log(response.data)
                        return response.data;
                    })];
            });
        });
    };
    AgentClient.prototype.getAgentByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.get('/spokenAbc/agents/loginId/' + loginId)
                        .then(function (response) {
                        // console.log(response.data)
                        return response.data;
                    })];
            });
        });
    };
    AgentClient.prototype.waitForAgentCreation = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        process.stdout.write("Creating agent.");
                        var counter = 0;
                        var intervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getAgentByLoginId(loginId)];
                                    case 1:
                                        _a.sent();
                                        console.log('agent created');
                                        clearInterval(intervalId);
                                        resolve();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_3 = _a.sent();
                                        if (e_3.response.status === 404) {
                                            process.stdout.write('.');
                                            counter++;
                                            if (counter > MAX_RETRY) {
                                                console.log();
                                                clearInterval(intervalId);
                                                reject(Error('agent creation failed'));
                                            }
                                        }
                                        else {
                                            console.log(e_3);
                                            throw e_3;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, INTERVAL_IN_MILLIS);
                        return intervalId;
                    })];
            });
        });
    };
    AgentClient.prototype.waitForAgentDeletion = function (agent_username) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        process.stdout.write("Deleting agent.");
                        var counter = 0;
                        var intervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getAgentByUsername(agent_username)];
                                    case 1:
                                        _a.sent();
                                        process.stdout.write('.');
                                        counter++;
                                        if (counter > MAX_RETRY) {
                                            console.log();
                                            clearInterval(intervalId);
                                            reject(Error('agent deletion failed'));
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_4 = _a.sent();
                                        if (e_4.response.status === 404) {
                                            console.log('agent deleted');
                                            clearInterval(intervalId);
                                            resolve();
                                        }
                                        else {
                                            console.log(e_4);
                                            throw e_4;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, INTERVAL_IN_MILLIS);
                        return intervalId;
                    })];
            });
        });
    };
    AgentClient.prototype.waitForStationCreation = function (subAccountId, agent_username) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        process.stdout.write("Creating station.");
                        var counter = 0;
                        var intervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var station, e_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getStationOnly(subAccountId, agent_username)];
                                    case 1:
                                        station = _a.sent();
                                        if (station) {
                                            console.log('station created');
                                            clearInterval(intervalId);
                                            resolve();
                                        }
                                        else {
                                            process.stdout.write('.');
                                            counter++;
                                            if (counter > MAX_RETRY) {
                                                console.log();
                                                clearInterval(intervalId);
                                                reject(Error('station creation failed'));
                                            }
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_5 = _a.sent();
                                        if (e_5.response.status === 404) {
                                            process.stdout.write('.');
                                            counter++;
                                            if (counter > MAX_RETRY) {
                                                console.log();
                                                clearInterval(intervalId);
                                                reject(Error('station creation failed'));
                                            }
                                        }
                                        else {
                                            console.log(e_5);
                                            throw e_5;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, INTERVAL_IN_MILLIS);
                        return intervalId;
                    })];
            });
        });
    };
    AgentClient.prototype.waitForStationDeletion = function (subAccountId, agent_username) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        process.stdout.write("Deleting station.");
                        var counter = 0;
                        var intervalId = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var station, e_6;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.getStationOnly(subAccountId, agent_username)];
                                    case 1:
                                        station = _a.sent();
                                        if (station) {
                                            process.stdout.write('.');
                                            counter++;
                                            if (counter > MAX_RETRY) {
                                                console.log();
                                                clearInterval(intervalId);
                                                reject(Error('station deletion failed'));
                                            }
                                        }
                                        else {
                                            console.log('station deleted');
                                            clearInterval(intervalId);
                                            resolve();
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_6 = _a.sent();
                                        if (e_6.response.status === 404) {
                                            console.log('station deleted');
                                            clearInterval(intervalId);
                                            resolve();
                                        }
                                        else {
                                            console.log(e_6);
                                            throw e_6;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, INTERVAL_IN_MILLIS);
                        return intervalId;
                    })];
            });
        });
    };
    AgentClient.prototype.getStationOnly = function (subAccountId, agent_username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.get('/spokenAbc/stations?clientId=' + subAccountId)
                        .then(function (result) {
                        return result.data.find(function (element) { return element.username === agent_username; });
                    })];
            });
        });
    };
    AgentClient.prototype.deleteAgent = function (agentUsername) {
        return __awaiter(this, void 0, void 0, function () {
            var subAccountId, station, agent, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.session.login()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getSubAccountId()];
                    case 2:
                        subAccountId = _a.sent();
                        return [4 /*yield*/, this.getStationOnly(subAccountId, agentUsername)];
                    case 3:
                        station = _a.sent();
                        if (!station) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.deleteStationOnly(station.id)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.waitForStationDeletion(subAccountId, agentUsername)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        console.log('station associated with ' + agentUsername + ' has already been deleted');
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 11, , 12]);
                        return [4 /*yield*/, this.getAgentByUsername(agentUsername)];
                    case 8:
                        agent = _a.sent();
                        return [4 /*yield*/, this.deleteAgentOnly(agentUsername, agent.loginId)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.waitForAgentDeletion(agentUsername)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        e_7 = _a.sent();
                        if (e_7.response.status === 404) {
                            console.log('agent ' + agentUsername + ' has already been deleted');
                        }
                        else {
                            throw e_7;
                        }
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    AgentClient.prototype.deleteStationOnly = function (stationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.session.delete('/spokenAbc/jobs/stations/' + stationId)];
            });
        });
    };
    AgentClient.prototype.deleteAgentOnly = function (agentUsername, agentLoginId) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteRequest;
            return __generator(this, function (_a) {
                deleteRequest = { 'username': agentUsername, 'loginId': agentLoginId };
                return [2 /*return*/, this.session.post('/spokenAbc/agents/removeAgent', deleteRequest)];
            });
        });
    };
    return AgentClient;
}());
function createAgentClient(session) {
    return new AgentClient(session);
}
exports.createAgentClient = createAgentClient;
