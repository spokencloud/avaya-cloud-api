const spokenUrl = 'https://mars-omni.bpo.avaya.com/callback/v1/call';
import axios from 'axios';

export default {
     notifySpoken(callDetails, userName) {
        console.log("notify spoken");
        setConnected(callDetails, userName);
    }
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

function setConnected(callDetails, userName) {
    let callerId = "+1" + callDetails.callerId;
    let payload =
        {
            "from": callerId,
            "callStatus": "connected",
            "agentId": userName
        };
    return post(spokenUrl, payload);
}

function post(url, payload, config = {}) {
    return httpRequest('post', url, payload, config)
}
