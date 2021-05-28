const axios = require('axios').default;

export function getIvrConversation(cloudivr,callback) {
    const url = `${cloudivr.url}/cloud-ivr/v1/session/${cloudivr.connectionUid}`;
    axios.get(url, {
        headers:{
            'x-api-key': cloudivr.apiKey
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
