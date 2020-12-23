import { Danmu } from "../types/Danmu";
import { Loggable } from "../loggers/Loggable";
import { Runnable } from "../types/Runnable";
import { DanmuPayload, sendDanmu } from "../utils/messaging";
import { sleep, throwError } from "../utils/misc";
import { DanmuSendInfo } from "../types/DanmuSendInfo";

export class BilibiliDanmakuInserterRunner extends Loggable implements Runnable {
    
    private danmus: Danmu[]
    private payload: DanmuPayload

    constructor(danmus: Danmu[], payload: DanmuPayload){
        super();
        this.danmus = danmus;
        this.payload = payload;
    }

    async run(): Promise<any> {
        const maxTimeStamp = this.payload.video.duration * 1000
        let line = 1;
        for (const danmu of this.danmus){
            try {
                if(danmu.timestamp > maxTimeStamp){
                    throwError('时间戳记超出视频总时长')
                }
                const res = await this.sendDanmuRepeat({
                    msg: danmu.msg,
                    nano: danmu.timestamp,
                    payload: this.payload
                }, line)
                
                await sleep(this.payload.interval)

                if (!res?.data){
                    throwError(res?.message ?? '弹幕插入失败')
                }

                this.info(`成功插入弹幕。[讯息=${danmu.msg}, 时间戳记=${danmu.timestamp}]`, line)
                
            }catch(err){
                this.error(err, line)
            }finally{
                line++
            }
        }
    }

    private async sendDanmuRepeat(data: DanmuSendInfo, line: number): Promise<any> {
        const res = await sendDanmu(data)
        console.debug(res)
        if (res?.code === 36703) {
            this.warn(`发送频率过快，5秒後重试发送弹幕: ${data.msg}`, line)
            await sleep(5000)
            return await this.sendDanmuRepeat(data, line)
        }
        return res
    }
    
}