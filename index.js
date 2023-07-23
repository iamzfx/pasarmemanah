const { Wallet, ethers } = require("ethers");
const fetch = require('node-fetch');
const data = require("./input.json");
const { faker } = require("@faker-js/faker");
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');

function createAccountEth() {
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    return {
        privateKey,
        publicKey,
    };
}

const randnumber = length =>
    new Promise((resolve) => {
        var text = "";
        var possible =
            "1234567890";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        resolve(text);
    });

 const params = {
        api_key : data.api_key,
        method : 'userrecaptcha',
        googlekey: '6Lc0SE4eAAAAADEezJlMWli9T1A9EZKuQCr4uAlk',
        pageurl : 'https://www.arrow.markets/waitlist?referralCode='+data.refferal_code
    }
  
    const api_url = `https://2captcha.com/in.php?key=${params.api_key}&method=${params.method}&googlekey=${params.googlekey}&pageurl=${params.pageurl}`;

    function getId (){
    return fetch(api_url)
    .then(response => response.text())
    }


//const numCaptcha = getId();
//const idCaptcha = numCaptcha.substr(3)
//const captchaUrl = `https://2captcha.com/res.php?key=${params.api_key}&action=get&id=`+idCaptcha;

//function getCaptcha (){
  //  return fetch(captchaUrl)
    //.then(response => response.text())
//}

const getCaptcha = (idCaptcha) => new Promise((resolve, reject) => {
    fetch(`https://2captcha.com/res.php?key=${params.api_key}&action=get&id=`+idCaptcha, {
        method: 'GET'
    })
    .then(res => res.text())
    .then(res => resolve(res))
    .catch(err => reject(err))
});



let randomProxy = '';

const registerAcc = (address, refferal_code, token, username, randomProxy) => new Promise((resolve, reject) => {
    fetch('https://fuji-v5-api.arrow.markets/v1/waitlist/register', {
        method: 'POST',
        headers: {
            'authority': 'www.arrow.markets',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.6',
            'content-type': 'application/json',
            'origin': 'https://www.arrow.markets',
            'referer': 'https://www.arrow.markets/', 
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        },
        agent: new HttpsProxyAgent(randomProxy),
        body: JSON.stringify({
            'address': address,
            'referral_code': refferal_code,
            'token': token,
            'username': username
        })
    })
    .then(res => res.json())
    .then(res => resolve(res))
    .catch(err => reject(err))
});

(async () => {
    const readfile = fs.readFileSync('./proxy.txt','utf-8');
    const proxyList = readfile.split('\n');

    
    for(i=0;i<= proxyList.length;i++){
    let bjir = proxyList[Math.floor(Math.random()*proxyList.length)];
    let randomProxy = `http://${bjir}`;
    console.log(randomProxy);

    const createAccountEthResult = createAccountEth();

    const privateKey = createAccountEthResult.privateKey;

    console.log(privateKey)

    const wallet = new Wallet(privateKey);
    const address = wallet.address;

    console.log(address)
    
    const refferal_code = data.refferal_code;

    const captcha = await getId();
    const idCaptcha = captcha.substr(3);
    console.log(idCaptcha);
    const toTransact = await getCaptcha(idCaptcha);
    
    const checkToken = toTransact.substr(3);
    let trx = null;
    if(checkToken == "CHA_NOT_READY"){
        while(true){
        trx = await getCaptcha(idCaptcha);
        console.log(trx);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(trx.substr(0,2) == "OK"){
            break
        }
    }
    }
    const token = trx.substr(3);
    console.log(`Your Captcha : ${token}`);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${await randnumber(4)}`;
    const regis = await registerAcc(address, refferal_code, token, username, randomProxy);
    console.log(regis);

    
}
})();
