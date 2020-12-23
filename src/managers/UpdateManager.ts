import { browser } from "webextension-polyfill-ts"
import { NotifyMessage } from "../types/NotifyMessage"
import { sendNotify, sendNotifyId, webFetch } from "../utils/messaging"
import { canUseButton, isFirefox, newerThan } from "../utils/misc"

export const extName = browser.runtime.getManifest().name
export const currentVersion = browser.runtime.getManifest().version
const updateApi = browser.runtime.getManifest().applications.gecko.update_url
const eid = browser.runtime.getManifest().applications.gecko.id



let latest: VersionInfo = undefined


interface VersionInfo {
    version: string,
    update_info_link: string,
    update_link: string
}

async function checkUpdate(notify = false) {
    try {
        const addons = (await webFetch(updateApi)).addons
        if (addons) {
            const verList = addons[eid]?.updates
            if (verList){
                for (const update of verList) {
                    if (update.version.newerThan(latest?.version ?? "")){
                        latest = update
                    }
                }
            }
        }
        if (!latest) {
            if (notify){
                    await sendNotify({
                        title: '检查版本失败',
                        message: '无法索取最新版本讯息。'
                    })
            }
            return
        } else if (newerThan(currentVersion, latest.version)){
            if (notify){
                await sendNotify({
                    title: '没有可用的更新',
                    message: '你的版本已经是最新版本。'
                })
            }
            return
        }
        const msg: NotifyMessage = {
            title: `${extName} 有可用的更新`,
            message: `新版本 v${latest.version}`
        }
        if (canUseButton){
            msg.buttons = [
                {
                    title: '下载更新'
                },
                {
                    title: '查看更新日志'
                }
            ]
        }else{
            msg.message += '\n可到扩充管理手动更新或等待自动更新'
        }
        await sendNotifyId('bdi:update', msg)
    } catch (err) {
        console.error(err)
        await sendNotify({
            title: '检查更新失败',
            message: err.message
        })
    }
    return latest
}

//火狐可以自动更新
if (!isFirefox){
    checkUpdate()
}

function logLink(version: string){
    return `https://github.com/eric2788/bilibili-danmaku-inserter/releases/tag/${version}`
}

browser.notifications.onButtonClicked.addListener(async (nid, bi) => {
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
                await browser.tabs.create({ url: latest.update_link })
                break;
            case 1:
                //查看更新日志
                await browser.tabs.create({ url: logLink(latest.version) })
                break;
        }
    } else if (nid === 'bjf:updated'){
        await browser.tabs.create({url: logLink(currentVersion)})
    }
    
})