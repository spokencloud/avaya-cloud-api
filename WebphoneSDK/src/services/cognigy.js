
const cognigyUrl = 'https://api-trial.cognigy.ai/new/v2.0/profiles';
const apiKey = '3082be54832725ce49156dea1bc888dc338382849833b88e864bf78d4bcd25f1b178643a1ec71123f5347639f798528c106436922033561af9e4e0d73569219b';
import axios from 'axios';

function getProfile(callDetails) {
    console.log ("callDetails: ", callDetails);

    let caller = callDetails.callerId.replace("+", "");
    console.log("caller: ", caller);

    const newUrl = cognigyUrl + '?filter=' + caller;
    console.log ("new url: ", newUrl);
    return get(newUrl)
        .then(normalizeProfileResponse)

}
function normalizeProfileResponse(response) {
    return response;
}
function SearchContactId(profiles, callDetails) {
    let caller = callDetails.callerId;
    let connectedProfileId = "";
    for (let i = 0; i < profiles.items.length; i++) {
        for (let j = 0; j < profiles.items[i].contactIds.length; j++) {
            if (profiles.items[i].contactIds[j] === caller) {
                connectedProfileId = profiles.items[i]._id;
            }
        }
    }
    return connectedProfileId;
}
function get(url, config = {}) {
    addAuthorizationHeaderByKey(config);
    return httpRequest('get', url, config)
}

function addAuthorizationHeaderByKey(request) {
    let authorizationHeader = {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    Object.assign(request, {headers: authorizationHeader})
}
function httpRequest(method, url, request, config) {
    return axios[method](url, request, config)
        .then(response => {
            return Promise.resolve(response.data)
        })
        .catch(error => {
            return Promise.reject(error)
        })
}

function setCallConnected(profileId) {
    console.log('setcallconnected');
    let payload =
        {
            "profile": {
                "flowSync": {
                    "callconnected": true
                }
            }
        };
    let url = cognigyUrl + '/' + profileId;
    console.log('url ', url);
    return patch(url, payload);

}

function patch(url, payload, config = {}) {
    addAuthorizationHeaderByKey(config);
    return httpRequest('patch', url, payload, config)
}
export default {
    notifyCognigy(callDetails) {
        console.log("notify cognigy");
        let connectedProfileId = "";
        getProfile(callDetails)
            .then(profiles => {
                console.log('SearchContactId called');
                console.log('profiles: ', profiles);
                connectedProfileId = SearchContactId(profiles, callDetails);
                console.log('SearchContactId result', connectedProfileId);
                setCallConnected(connectedProfileId);
            })
    }
}
