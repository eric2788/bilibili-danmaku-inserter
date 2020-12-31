import { browser, Runtime } from "webextension-polyfill-ts"
import { NotifyMessage } from "../types/NotifyMessage"
import { VersionInfo } from "../types/infos/VersionInfo"
import { canUseButton, getUserAgent, isChrome, isEdge, newerThan } from "../utils/misc"

export const extName = browser.runtime.getManifest().name
export const currentVersion = browser.runtime.getManifest().version
const updateApi = browser.runtime.getManifest().applications.gecko.update_url
const eid = browser.runtime.getManifest().applications.gecko.id


export default class UpdateManager {

    private webFetch: (url: string) => Promise<any>;
    private latest: VersionInfo = undefined
    private auto_update_supported: {[key: string]: string} = {}

    get latestVersion(): VersionInfo {
        return this.latest
    }

    get latestLink(): string {
        if (isEdge && this.auto_update_supported['edge']){
            return this.auto_update_supported['edge']
        }else if (isChrome && this.auto_update_supported['chrome']){
            return this.auto_update_supported['chrome']
        } else {
            return this.latest.update_link
        }
    }

    constructor(webFetch: (url: string) => Promise<any>){
        this.webFetch = webFetch;
    }

    private async checkUpdateHandle(handle: UpdateHandle): Promise<VersionInfo>{
        return handle.checkUpdate(this.webFetch)
    }

    async checkUpdate(notify: boolean = false): Promise<NotifyMessage | undefined>{
        try {
            this.auto_update_supported = (await this.webFetch(updateApi))?.auto_update_supported ?? {}
            try {
                this.latest = await this.checkUpdateHandle(new CheckUpdateAPI(this.auto_update_supported))
            }catch(err){
                console.warn(err)
                console.warn(`use back the original checking way.`)
                this.latest = await this.checkUpdateHandle(new CheckUpdateOther())
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

interface UpdateHandle{

    checkUpdate(webFetch: (url: string) => Promise<any>): Promise<VersionInfo>

}


type UpdateCheck = { requestUpdateCheck: () => Promise<[status: string, update: {version: string}]>}

class CheckUpdateAPI implements UpdateHandle{

    private auto_update_supported: {[key: string]: string}

    constructor(autoUpdate:  {[key: string]: string}){
        this.auto_update_supported = autoUpdate
    }

    async checkUpdate(webFetch: (url: string) => Promise<any>): Promise<VersionInfo>{
        const agent = getUserAgent()
        const dlLink: string = this.auto_update_supported[agent]
        if (dlLink === undefined){
            throw new Error('your browser is not support auto updated.')
        }
        const forceCheckFunction: Runtime.Static & UpdateCheck = browser.runtime as any
        const [status, update] = await forceCheckFunction.requestUpdateCheck()
        
        if (status === 'update_available'){
            return {
                ...update,
                update_info_url: null,
                update_link: dlLink
            }
        }
        if (status === 'throttled'){
            throw new Error('update is throttled')
        }
        return {
            version: currentVersion,
            update_info_url: null,
            update_link: dlLink
        }
    }

}



class CheckUpdateOther implements UpdateHandle{
    
    async checkUpdate(webFetch: (url: string) => Promise<any>): Promise<VersionInfo>{
        let latest: VersionInfo = undefined
        const addons = (await webFetch(updateApi)).addons
        if (addons) {
            const verList = addons[eid]?.updates
            if (verList) {
                for (const update of verList) {
                    if (newerThan(update.version, latest?.version ?? "")) {
                        latest = update
                    }
                }
            }
        }
        return latest
    }
}