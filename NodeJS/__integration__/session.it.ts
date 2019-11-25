import { Session, createSession } from "../src/session";
import { axios, axiosCookieJarSupport, tough } from "../src/Constants";

describe("session.ts", () => {
    xtest("createSession ", async () => {
        axiosCookieJarSupport(axios)

        const cookieJar = new tough.CookieJar();
        // must retrun promise for jest to wait for it to finish
        await axios
            .post('http://localhost:8081/login?username=yangprovisioner'
            + '&password=' + 'Passw0rd!!', {
                jar: cookieJar,
                withCredentials: true, // IMPORTANT!
            })
            .then((response: any) => {
                //console.log(response);
                console.log(cookieJar)  
            })
            .catch((err: any) => {
                console.error(err.stack || err);
            })

    }),
    xtest("create session", () => {
        axiosCookieJarSupport(axios)
        const cookieJar = new tough.CookieJar();
        const instance = axios.create({
            baseURL: "http://localhost:8081",
            withCredentials: true,
            jar: cookieJar,
        });
        return instance.post(
            '/login?username=yangprovisioner'
            + '&password=' + 'Passw0rd!!')
            .then((result: any) => {
                // console.log(result)
                console.log(cookieJar)
                return result
            })
    }),
    xtest("google test", async () =>{
        axiosCookieJarSupport(axios);

        const cookieJar = new tough.CookieJar();
        
        await axios
          .get('https://google.com', {
            jar: cookieJar,
            withCredentials: true,
          })
          .then((response:any) => {
            const config = response.config;
            console.log(config.jar.toJSON());
          })

    }),
    test("token test", async () =>{
        axiosCookieJarSupport(axios);
        const cookieJar = new tough.CookieJar();
        let url = 'http://localhost:8081/user'
        const options = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ5YW5nYWRtaW4xIiwiaXNzIjoiQUJDX1NFQ1VSSVRZX0dBVEVXQVkifQ.4kf1hrPV6C30PZu3tx48dgsaev9UowvG7pVszXKhghY' },
            url,
            jar: cookieJar,
            withCredentials: true
          };
        await axios(options)
          .then((response:any) => {
            console.log(response.headers['set-cookie']);
            console.log(cookieJar)
          })

    })


    

})