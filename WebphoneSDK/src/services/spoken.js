// const spokenUrl = 'https://mars-omni.bpo.avaya.com/callback/v1/call';
import axios from 'axios';

export default {
     notifySpoken(callDetails, userName, cburl) {
        console.log("notify spoken");
        setConnected(callDetails, userName, cburl);
    }
}

function addHeader(request) {
    let authorizationHeader = {
        'Content-Type': "application/x-www-form-urlencoded"
    }
    Object.assign(request, {headers: authorizationHeader})
}

function httpRequest (method, url, request, config) {
    return axios[method](url, request, config)
        .then(response => {
            return Promise.resolve(response.data)
        })
        .catch(error => {
            return Promise.reject(error)
        })
}

function setConnected(callDetails, userName, cburl) {
    let callerId = callDetails.callerId;
    let payload =
        {
            "from": callerId,
            "callStatus": "connected",
            "agentId": userName
        };
    console.log("cb url : ", cburl);
    return post(cburl, payload);
}

function post(url, payload, config = {}) {
    addHeader(config);
    return httpRequest('post', url, payload, config)
}
