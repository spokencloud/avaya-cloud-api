//
// obsolete // const baseUrl = 'https://odata-trial.cognigy.ai/Conversations';
//
// Cognigy trial env
const baseUrl = 'https://api-trial.cognigy.ai/new/v2.0/conversations';
const apiKey = '34a52236ed7e30643eb70254adbcb4d0f2b127824a0a3f012d5e2d26c83dfab430e68bc3d0ccdda5eceabbc2152b4d03bae540cb088ca254f567f2ea9f9558d8';
// Cognigy prod east1
// const baseUrl = 'https://us-east1.api.aiflow.avayacloud.com/new/v2.0/conversations';
// const apiKey = '3a735b1d4d5716a62973d2fd948a03d4c19235fd07be806b7fce7e082cf0862a0cc05db69c68832544f9bca7dbfddb6478ad800f7efc2e6f3234422b63a003c6';
const axios = require('axios').default;

export function getIvrConversation(sessionId,callback) {
    const url = `${baseUrl}/${sessionId}`;
    axios.get(url, {
        headers:{
            'x-api-key': apiKey
        }
    })
        .then((response) => {
            callback(response.data);
        }).catch ( (error) => {
            console.log(error.response.data);
    }).then( () => {
        console.log("end of execution");
    });
}
