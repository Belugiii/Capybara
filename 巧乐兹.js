// cron: 0 8 * * *
const $ = new Env('巧乐兹');
const ckName = "qlz"; // 抓取 https://msmarket.msx.digitalyili.com 请求头中的 access-token
var Notify = 0; // 0为关闭通知，1为打开通知,默认为1
const debugging = 0; // 0为关闭调试，1为打开调试,默认为0
// 无需更改下方变量
let ck = process.env[ckName]; // 所有账号字符串
let variables = []; // 所有账号数据数组
let data = ''; // 当前执行的账号数据
let msg = ''; // 通知的内容

!(async () => {

    if (!(await Envs()))
        return;
    else {
        log(`🏷️   ==>   共找到 ${variables.length} 个账号`)
        for (let index = 0; index < variables.length; index++) {
            log(`========= 开始【第 ${index + 1} 个账号】=========`)
            data = variables[index];
            debug(`【data】${data}`)
            await signIn();
            await $.wait(2 * 1000);
        }
    }

})()
    .catch((e) => log(e))
    .finally(() => $.done())


/**
 * 签到
 */
async function signIn(timeout = 3 * 1000) {
    log('🔰   ==>   开始签到');
    let axios = require('axios');

    let option = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://msmarket.msx.digitalyili.com/gateway/api/member/daily/sign',
        headers: {
            'Host': 'msmarket.msx.digitalyili.com',
            'Connection': 'keep-alive',
            'Content-Length': '2',
            'content-type': 'application/json',
            'scene': '1089',
            'register-source': '',
            'access-token': `${data}`,
            'forward-appid': '',
            'tenant-id': '1630760548505825282',
            'atv-page': '',
            'source-type': '',
            'Accept-Encoding': 'gzip,compress,br,deflate',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.44(0x18002c2f) NetType/4G Language/zh_CN',
            'Referer': 'https://servicewechat.com/wxa206b57027b01b51/220/page-frame.html'
        },
        data: {}
    }
    debug(`【option】${JSON.stringify(option)}`)
    await axios.request(option)
        .then((response) => {
            let result = response.data
            debug(`【result】${JSON.stringify(result)}`)
            if (result.status == true) {
                log(`✔️   <==   签到成功`)
            } else {
                Notify = 1;
                log(`❌   <==   签到失败，原因是${result.error.msg} `)
            }
        })
        .catch((error) => {
            log(error);
        });

}

// ===================================================固定代码===================================================
// 调试输出
function debug(msg) {
    if (debugging) log(`🕷️:${msg}`)
}

// 日志输出和记录
function log(s) {
    console.log(s + "\n")
    msg += s + "\n"
}

async function Envs() {
    if (ck) {
        if (ck.indexOf("@") != -1) {
            ck.split("@").forEach((item) => {
                variables.push(item);
            });
        } else if (ck.indexOf("\n") != -1) {
            ck.split("\n").forEach((item) => {
                variables.push(item);
            });
        } else {
            variables.push(ck);
        }
    } else {
        log(`❌【${$.name}】：未填写变量 ck`)
        return;
    }

    return true;
}

// 配合sendNotify发送消息
async function SendMsg(message) {
    if (!message)
        return;
    if (Notify > 0) {
        let notify = require('./sendNotify');
        await notify.sendNotify($.name, message);
    } else {
    }
}

// 获取当前时间
function getCurrentDateTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0');
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function Env(t, e) {

    return new class {
        // 脚本开始
        constructor(t, e) {
            this.name = t, console.log(`🔔   ==>   ${this.name}, 开始!\n⏰️   ==>   ${getCurrentDateTime()}`)
        }

        // 同步延时
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        // 脚本结束
        done(t = {}) {
            SendMsg(msg);
            console.log(`🔔   ==>   ${this.name}, 结束!\n⏰️   ==>   ${getCurrentDateTime()}`)
        }
    }(t, e)
}
