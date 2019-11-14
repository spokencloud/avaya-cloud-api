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
var args = require('minimist')(process.argv.slice(2));
var ENDPOINT_KEY = 'endpoint';
var ADMIN_USERNAME_KEY = 'admin_username';
var ADMIN_PASSWORD_KEY = 'admin_password';
var REPLACE_REGEX = /'/g;
var EMPTY_STRING = "";
var endpoint = args[ENDPOINT_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var adminUsername = args[ADMIN_USERNAME_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
var adminPassword = args[ADMIN_PASSWORD_KEY].replace(REPLACE_REGEX, EMPTY_STRING);
function isValidParameter(key, parameter) {
    if (parameter === undefined) {
        console.log(key + ' was undefined');
        return false;
    }
    else {
        return true;
    }
}
var isEndpointValid = isValidParameter(ENDPOINT_KEY, endpoint);
var isAdminUsernameValid = isValidParameter(ADMIN_USERNAME_KEY, adminUsername);
var isAdminPasswordValid = isValidParameter(ADMIN_PASSWORD_KEY, adminPassword);
if (!isEndpointValid ||
    !isAdminUsernameValid ||
    !isAdminPasswordValid) {
    process.exit();
}
var session_1 = require("./session");
var SubscriptionClient_1 = require("./SubscriptionClient");
var session = session_1.createSession(endpoint, adminUsername, adminPassword);
var subscriptionClient = SubscriptionClient_1.createSubscriptionClient(session);
function createSubscription() {
    return __awaiter(this, void 0, void 0, function () {
        var createSubscriptionRequest, returnedSubscriptionRequest, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    createSubscriptionRequest = {
                        "dataSourceType": "HAGENT",
                        "dataDeliveryFormat": "CSV",
                        "endpoint": "https://example.com",
                        "retryPolicy": "DEFAULT",
                        "basicAuthUsername": "avaya",
                        "basicAuthPassword": "password",
                        "frequencyInMinutes": 0,
                        "maxPostSize": 0,
                        "startTime": "2019-11-04T21:55:24.421Z",
                        "disableTLSVerify": true,
                        "subAccountAppId": "ALL"
                    };
                    return [4 /*yield*/, subscriptionClient.createSubscription(createSubscriptionRequest)];
                case 1:
                    returnedSubscriptionRequest = _a.sent();
                    console.log('subscriptionObject from createSubscription');
                    console.log(returnedSubscriptionRequest);
                    return [2 /*return*/, returnedSubscriptionRequest];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteSubscription(subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, subscriptionClient.deleteSubscription(subscriptionId)];
                case 1:
                    _a.sent();
                    console.log('subscription with ' + subscriptionId + ' deleted');
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
function getAllSubscriptions() {
    return __awaiter(this, void 0, void 0, function () {
        var allSubscriptions, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, subscriptionClient.getAllSubscriptions()];
                case 1:
                    allSubscriptions = _a.sent();
                    console.log('all subscriptions:');
                    console.log(allSubscriptions);
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
function getSubscription(subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionObject, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, subscriptionClient.getSubscription(subscriptionId)
                            .then(function (result) { return result.data; })];
                case 1:
                    subscriptionObject = _a.sent();
                    console.log('subscriptionObject from getSubscription');
                    console.log(subscriptionObject);
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
function updateSubscription(subscription) {
    return __awaiter(this, void 0, void 0, function () {
        var returnedSubscriptionRequest, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    subscription.dataDeliveryFormat = 'JSON';
                    return [4 /*yield*/, subscriptionClient.updateSubscription(subscription)];
                case 1:
                    returnedSubscriptionRequest = _a.sent();
                    console.log('subscriptionObject from updateSubscription');
                    console.log(returnedSubscriptionRequest);
                    return [2 /*return*/, returnedSubscriptionRequest];
                case 2:
                    e_5 = _a.sent();
                    console.error(e_5);
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
                case 0: return [4 /*yield*/, getAllSubscriptions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
