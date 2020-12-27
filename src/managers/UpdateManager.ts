import { browser } from "webextension-polyfill-ts"
import { NotifyMessage } from "../types/NotifyMessage"
import { VersionInfo } from "../types/infos/VersionInfo"
import { canUseButton, newerThan } from "../utils/misc"

export const extName = browser.runtime.getManifest().name
export const currentVersion = browser.runtime.getManifest().version
const updateApi = browser.runtime.getManifest().applications.gecko.update_url
const eid = browser.runtime.getManifest().applications.gecko.id


export default class UpdateManager {

    private webFetch: (url: string) => Promise<any>;
    private latest: VersionInfo = undefined

    get latestVersion(): VersionInfo {
        return this.latest
    }

    constructor(webFetch: (url: string) => Promise<any>){
        this.webFetch = webFetch;
    }

    async checkUpdate(notify: boolean = false): Promise<NotifyMessage | undefined>{
        try {
            const addons = (await this.webFetch(updateApi)).addons
            if (addons) {
                const verList = addons[eid]?.updates
                if (verList){
                    for (const update of verList) {
                        if (newerThan(update.version, this.latest?.version ?? "")){
                            this.latest = update
                        }
                    }
                }
            }
            if (!this.latest) {
                if (notify) {
                    return {
                        title: '检查版本失败',
                        message: '无法索取最新版本讯息。'
                    }
                } else {
                    return undefined
                }
            } else if (newerThan(currentVersion, this.latest.version)){
                if (notify){
                    return {
                        title: '没有可用的更新',
                        message: '你的版本已经是最新版本。'
                    }
                }else{
                    return undefined
                }
            }
            const msg: NotifyMessage = {
                title: `${extName} 有可用的更新`,
                message: `新版本 v${this.latest.version}`
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
            return msg
        } catch (err) {
            console.error(err)
            return {
                title: '检查更新失败',
                message: err.message
            }
        }
    }
}