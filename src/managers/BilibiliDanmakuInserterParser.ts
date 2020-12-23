import { Danmu } from "../types/Danmu";
import { Loggable } from "../loggers/Loggable";
import { Runnable } from "../types/Runnable";
import { DanmuPayload, sendDanmu } from "../utils/messaging";
import { throwError } from "../utils/misc";
import { DanmuSendInfo } from "../types/DanmuSendInfo";

export class BilibiliDanmakuInserterRunner extends Loggable implements Runnable {
    
    private danmus: Danmu[]
    private payload: DanmuPayload
    private _terminate: boolean = false

    constructor(danmus: Danmu[], payload: DanmuPayload){
        super();
        this.danmus = danmus;
        this.payload = payload;
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
        const maxTimeStamp = this.payload.video.duration * 1000
        let line = 1;
        let interval = this.payload.interval
        while (this.danmus.length > 0){
            try {
                const danmu = this.danmus.shift()

                if (this._terminate){
                    this.info(`运行已被手动中止。`, line)
                    return;
                }

                if(danmu.timestamp > maxTimeStamp){
                    throwError('时间戳记超出视频总时长')
                }

                await this.sleep(interval)

                const res = await sendDanmu({
                    msg: danmu.msg,
                    nano: danmu.timestamp,
                    payload: this.payload
                })

                console.debug(res)

                if (!res?.data){
                    if (res?.code !== 36703){
                        throwError(res?.message ?? '弹幕发送失败')
                    }else{
                        interval += 10000
                        this.warn(`发送频率过快, ${(interval / 1000).toFixed(1)}秒后重试`, line)
                        this.danmus.push(danmu)
                    }
                }else{
                    this.info(`成功插入弹幕。[讯息=${danmu.msg}, 时间戳记=${danmu.timestamp}]`, line)
                    interval = this.payload.interval
                }
            }catch(err){
                this.error(err, line)
            }finally{
                line++
            }
        }
    }
    
}