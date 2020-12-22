import axios from 'axios'
import { browser } from 'webextension-polyfill-ts'
import CommandManager from './managers/CommandManager'
import qs from 'querystring'
import { DanmuSettings } from './types/DanmuSettings'
import { VideoInfo } from './types/VideoInfo'
import { NotifyMessage } from './types/NotifyMessage'

console.log('background is working...')

sendNotify({
    title: 'hello',
    message: 'hello world!!!'
}).then(() => console.log('hello world!!'))

browser.browserAction.onClicked.addListener((tab, clickData) => {
    browser.tabs.create({
        url: browser.runtime.getURL('webpage.html')
    })
})


let csrfToken: string = undefined

async function sendNotify(data: NotifyMessage){
    console.log('sending notification')
    return browser.notifications.create({
        type: 'basic',
        ...data,
        iconUrl: browser.runtime.getURL('icons/icon.png')
    }).catch(console.error)
}

async function webFetch(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.statusText}(${res.status})`)
    const json = await res.json()
    return json
}

function toPayload(video: VideoInfo, data: DanmuSettings){
    if (!csrfToken) throw new Error('未知 CSRFToken，请确保已经取得用户讯息。')
    let mode;
    switch(data.position ?? 'bottom'){
        case "normal":
            mode = 1;
            break;
        case "top":
            mode = 5;
            break;
        case "botom":
            mode = 4;
            break;    
    }
    const msg = encodeURI(data.msg)
    let size;
    switch(data.fontSize ?? 'normal'){
        case "normal":
            size = 25;
            break;
        case "large":
            size = 36;
            break;
        case "small":
            size = 18;
            break;
    }
    const pool = 0 //data.isSub ? 1 : 0
    return {
        type: 1,
        oid: video.oid,
        msg,
        bvid: video.bid,
        progress: data.nano,
        color: data.color,
        fontsize: size,
        pool,
        mode,
        rnd: Date.now() * 1000,
        plat: 1,
        csrf: csrfToken
    }
}

async function sendDanmu({video, data}: {video: VideoInfo, data: DanmuSettings}){
    return await axios.post('https://api.bilibili.com/x/v2/dm/post', qs.stringify(toPayload(video, data)), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}


async function fetchUser(){
    const tab = await browser.tabs.create({
        url: 'https://space.bilibili.com',
        active: false,
    })
    const result = await browser.tabs.executeScript(tab.id, {
        code: `
           /bili_jct=(.+?)[;$]/.exec(document.cookie)?.pop()
           document.getElementById('h-name').innerText
        `
    })
    console.log(result)
    const [ token, username ] = result
    if (!token) throw new Error('尚未登入!')
    csrfToken = token
    return username
}


async function fetchVideoInfo(bvid: string, p: number): Promise<VideoInfo>{
    if (!bvid) throw new Error('请输入视频bid')
    if (!p) throw new Error('请输入分P数')
    const res = await webFetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`)
    const data = res?.data
    if (!data) throw new Error('视频资讯请求失败')
    if (p > data.length) {
        throw new Error('你所输入的分P数超出视频本身P数范围')
    }
    const { cid, page, part, duration } = data[p - 1]
    return {
        oid: cid,
        page,
        title: part,
        duration,
        bid: bvid
    }
}

CommandManager.addCommand('notify', (data, sender) => sendNotify(data))
CommandManager.addCommand('fetch', (data, sender) => webFetch(data.url))
CommandManager.addCommand('get-local-data', (data, sender) => browser.storage.local.get())
CommandManager.addCommand('send-danmu', (data, sender) => sendDanmu(data))
CommandManager.addCommand('fetch-user', (data, sender) => fetchUser())
CommandManager.addCommand('fetch-video', (data, sender) => fetchVideoInfo(data.bvid, data.p))

browser.runtime.onMessage.addListener(CommandManager.handleMessage)

