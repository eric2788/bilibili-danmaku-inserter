import { Danmu } from "../types/danmu/Danmu";
import { DanmuPayload, sendDanmu } from "../utils/messaging";
import { throwError } from "../utils/misc";
import { BilibiliInserterSettings } from "../types/settings/BilibiliInserterSettings";
import { MainStreamRunner } from "../types/runner/MainStreamRunner";
import { keys } from "ts-transformer-keys";

export class DanmakuInserterRunner extends MainStreamRunner<any, BilibiliInserterSettings> {
    
    protected isInstance(sat: Satisfiable): boolean {
        return keys<BilibiliInserterSettings>().every(s => s in sat)
    }
    
    private payload: DanmuPayload
    private _terminate: boolean = false

    
    assignSetting(danmus: Danmu[], delay: number, setting: Satisfiable){
        super.assignSetting(danmus, delay, setting)
        this.payload = { style: this.setting.danmuStyle, video: this.setting.currentVideo, interval: this.setting.interval};
    }

    terminate(): void {
        this._terminate = true
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((res, rej) => {
            let i = 0
            const j = setInterval(() => {
                i += 1000
                if (i >= ms || this._terminate){
                    clearInterval(j)
                    res()
                }
            }, 1000)
        })
    }

    async run(): Promise<any> {
        console.log(this.danmus)
        const maxTimeStamp = this.payload.video.duration * 1000
        let line = 1;
        let interval = this.payload.interval
        let retry = 1;
        while (this.danmus.length > 0){
            try {
                const danmu = this.danmus[0]

                if (this._terminate){
                    this.info(`运行已被手动中止。`, line)
                    this._terminate = false
                    return;
                }

                danmu.timestamp = Math.max(0, danmu.timestamp + this.delay) // avoid < 0

                if(danmu.timestamp > maxTimeStamp){
                    throwError('时间戳记超出视频总时长')
                }

                await this.sleep(interval)

                const res = await sendDanmu({
                    msg: danmu.msg,
                    nano: danmu.timestamp,
                    payload: this.payload
                })

                if (!res?.data){
                    if (res?.code !== 36703){
                        throwError(res?.message ?? '弹幕发送失败')
                    }else{
                        interval = this.setting.resendInterval * retry
                        this.warn(`发送频率过快, ${(interval / 1000).toFixed(1)}秒后重试`, line)
                        retry++
                        continue
                    }
                }else{
                    this.info(`成功插入弹幕。[讯息=${danmu.msg}, 时间戳记=${danmu.timestamp}]`, line)
                    interval = this.payload.interval
                    retry = 1
                }
                this.danmus.shift()
            }catch(err){
                this.danmus.shift()
                this.error(err, line)
            }finally{
                line++
            }
        }
    }
    
}