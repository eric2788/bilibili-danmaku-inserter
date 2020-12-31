import { browser } from 'webextension-polyfill-ts'
import CommandManager from './managers/CommandManager'
import qs from 'querystring'
import { VideoInfo } from './types/infos/VideoInfo'
import { NotifyMessage } from './types/NotifyMessage'
import { DanmuSendInfo } from './types/danmu/DanmuSendInfo'
import { ajax } from 'jquery'
import { canUseButton, isFirefox, throwError } from './utils/misc'
import UpdateManager, { currentVersion, extName } from './managers/UpdateManager'

console.log('background is working...')

browser.browserAction.onClicked.addListener(async (tab, clickData) => {
    try {
        const tab = await browser.tabs.create({
            url: browser.runtime.getURL('index.html')
        })
        await browser.tabs.update(tab.id, {
            autoDiscardable: false // 防止浏览器自动刷新tab
        })
    }catch(err){
        if (err?.message?.includes('autoDiscardable')){
            await sendNotify({
                title: '你的浏览器不支援由插件禁止自动刷新Tab',
                message: '请点击「如何禁止自动刷新Tab」按钮以查看如何禁止自动刷新'
            })
        }else{
            await sendNotify({
                title: '打开界面时出现错误',
                message: err?.message ?? err
            })
        }
    }
})


let csrfToken: string = undefined

async function sendNotify(data: NotifyMessage){
    console.log('sending notification')
    return browser.notifications.create({
        type: 'basic',
        ...data,
        iconUrl: browser.runtime.getURL('icons/icon.png')
    })
}

async function sendNotifyId(id: string, data: NotifyMessage){
    console.log('sending notification with id')
    return browser.notifications.create(id, {
        type: 'basic',
        ...data,
        iconUrl: browser.runtime.getURL('icons/icon.png')
    })
}

async function webFetch(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.statusText}(${res.status})`)
    const json = await res.json()
    return json
}

const posConvert: {[key: string]: number} = {
    'normal': 1,
    'top': 5,
    'bottom': 4
}

const sizeConvert: {[key: string]: number} = {
    'normal': 25,
    'large': 36,
    'small': 18
}

function toPayload(data: DanmuSendInfo){
    if (!csrfToken) throw new Error('未知 CSRFToken，请确保已经取得用户讯息。')
    const style = data.payload.style
    const video = data.payload.video
    let mode = posConvert[style.position] ?? 1
    let size = sizeConvert[style.fontSize] ?? 25
    const pool = 0 //data.isSub ? 1 : 0
    return {
        type: 1,
        oid: video.oid,
        msg: data.msg,
        bvid: video.bid,
        progress: data.nano,
        color: style.color,
        fontsize: size,
        pool,
        mode,
        rnd: data.datetime ?? (Date.now() * 1000),
        plat: 1,
        csrf: csrfToken
    }
}

async function sendDanmu(data: DanmuSendInfo){
    const api = 'https://api.bilibili.com/x/v2/dm/post'
    const payload = qs.stringify(toPayload(data))
    console.debug(`prepare to send danmu: ${data.msg}`)
    console.debug(`payload: ${payload}`)
    return await ajax({
        type: "POST",
        url: api,
        data: payload,
        dataType: 'json'
    });
}


async function fetchUser(): Promise<{username: string, lvl: number}>{
    try {
        const tab = await browser.tabs.create({
            url: 'https://space.bilibili.com',
            active: false,
        })
        const csrfResult = await browser.tabs.executeScript(tab.id, {
            code: `/bili_jct=(.+?)[;$]/.exec(document.cookie)?.pop()`
        })
        const usernameResult = await browser.tabs.executeScript(tab.id, {
            code: `document.getElementById('h-name')?.innerText`
        })
        const lvlResult = await browser.tabs.executeScript(tab.id, {
            code: `parseInt(document.getElementsByClassName('h-level')[0]?.getAttribute('lvl'))`
        })
        await browser.tabs.remove(tab.id)
        const result = [...csrfResult, ...usernameResult, ...lvlResult]
        const [ token, username, lvl ] = result
        if (!token || !username || !lvl) throwError('獲取資訊失敗，請稍候再嘗試。')
        console.log(`csrfToken: ${token}, username: ${username}. level: ${lvl}`)
        csrfToken = token
        return {username, lvl}
    }catch(err){
        console.error(err)
        if (err?.message?.includes('passport.bilibili.com/login')){
            throwError('尚未登入!')
        }
        throw err
    }
}

async function loadHtml(locate: string): Promise<string>{
    const res = await fetch(browser.runtime.getURL(locate))
    if (!res.ok) if (!res.ok) throw new Error(`${res.statusText}(${res.status})`)
    return await res.text()
}


async function fetchVideoInfo(bvid: string, p: number): Promise<VideoInfo>{
    if (!bvid) throw new Error('请输入视频bid')
    if (!p) throw new Error('请输入分P数')
    const res = await webFetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`)
    const data = res?.data
    if (!data) {
        throw new Error(`视频获取失败: ${res.message}`)
    }
    if (p > data.length) {
        throw new Error('你所输入的分P数超出视频本身P数范围')
    }
    const { cid, page, part, duration } = data[p - 1]
    return {
        oid: cid,
        page,
        title: part,
        duration: duration - 1,
        bid: bvid
    }
}

const updateManager = new UpdateManager(webFetch)

CommandManager.addCommand('notify', (data, sender) => sendNotify(data))
CommandManager.addCommand('notify-id', (data, sender) => sendNotifyId(data.id, data.data))
CommandManager.addCommand('fetch', (data, sender) => webFetch(data.url))
CommandManager.addCommand('get-local-data', (data, sender) => browser.storage.local.get())
CommandManager.addCommand('send-danmu', (data, sender) => sendDanmu(data))
CommandManager.addCommand('fetch-user', (data, sender) => fetchUser())
CommandManager.addCommand('fetch-video', (data, sender) => fetchVideoInfo(data.bvid, data.p))
CommandManager.addCommand('load-html', (data, sender) => loadHtml(data.locate))

CommandManager.addCommand('check-update', async (data, sender) => {
    const msg = await updateManager.checkUpdate(true)
    if (msg?.buttons) {
        await sendNotifyId('bdi:update', msg)
    }else if (msg){
        await sendNotify(msg)
    }
})

browser.runtime.onMessage.addListener(CommandManager.handleMessage)

browser.runtime.onInstalled.addListener(async data => {
    if (data.reason !== 'update') return
    const msg: NotifyMessage = {
        title: `${extName} 已更新`,
        message: `已更新到版本 v${currentVersion}`
    }
    if (canUseButton){
        msg.buttons = [
            {
                title: '查看更新日志'
            }
        ]
    }
    await sendNotifyId('bdi:updated', msg)
})



//火狐可以自动更新
if (!isFirefox){
    updateManager.checkUpdate().then(msg => {
        if (msg?.buttons) {
            return sendNotifyId('bdi:update', msg)
        }else if (msg){
            return sendNotify(msg)
        }
    }).catch(console.error)
}

browser.notifications.onButtonClicked.addListener(async (nid, bi) => {
    const latest = updateManager.latestVersion
    if (nid === 'bdi:update') {
        if (latest === undefined) {
            await sendNotify({
                title: '索取新版本信息失败。',
                message: '请稍后再尝试。'
            })
            return
        }
        switch (bi) {
            case 0:
                //下载更新
                await browser.tabs.create({ url: updateManager.latestLink })
                break;
            case 1:
                //查看更新日志
                await browser.tabs.create({ url: logLink(latest.version) })
                break;
        }
    } else if (nid === 'bdi:updated'){
        await browser.tabs.create({url: logLink(currentVersion)})
    }

})

function logLink(version: string): string{
    return `https://github.com/eric2788/bilibili-danmaku-inserter/releases/tag/${version}`
}