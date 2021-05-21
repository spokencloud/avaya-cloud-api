//
const baseUrl = 'https://odata-trial.cognigy.ai/Conversations';
const apiKey = '34a52236ed7e30643eb70254adbcb4d0f2b127824a0a3f012d5e2d26c83dfab430e68bc3d0ccdda5eceabbc2152b4d03bae540cb088ca254f567f2ea9f9558d8';
const axios = require('axios').default;

export function getIvrConversation(sessionId,callback) {
    const url = `${baseUrl}/?$filter=sessionId%20eq%20%27${sessionId}%27&$select=source,inputText,timestamp&$orderby=timestamp&apikey=${apiKey}`;
    axios.get(url)
        .then((response) => {
            callback(response.data);
        }).catch ( (error) => {
            console.log(error.response.data);
    }).then( () => {
        console.log("end of execution");
    });
}

// const sessionId = 'CA777c3e320056af1c82e349228beb2bc8';
// getIvrConversation(sessionId,function(data) {
//         const value = data.value;
//         console.log(value);
// });
