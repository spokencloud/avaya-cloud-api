const axios = require('axios').default;

export function getIvrConversation(cognigy,callback) {
    const url = `${cognigy.url}/v2.0/conversations/${cognigy.sessionId}`;
    axios.get(url, {
        headers:{
            'x-api-key': cognigy.apiKey
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
