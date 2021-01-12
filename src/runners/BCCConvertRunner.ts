import { BccConvertSettings } from "../types/settings/BccConvertSettings";
import { BilibiliCommunityCaption } from "../types/BilibiliCommunityCaption";
import { MainStreamRunner } from "../types/runner/MainStreamRunner";
import { SubtitleInfo } from "../types/infos/SubtitleInfo";
import { keys } from "ts-transformer-keys";
import { sleep } from "../utils/misc";

export class BCCConvertRunner extends MainStreamRunner<BilibiliCommunityCaption, BccConvertSettings> {

    protected isInstance(sat: Satisfiable): boolean {
        return keys<BccConvertSettings>().every(s => s in sat)
    }

    async run(): Promise<BilibiliCommunityCaption> {
        const body: SubtitleInfo[] = []
        
        let lastInsert: SubtitleInfo = undefined
        let line = 1
        const extra = this.setting.extra
        while (this.danmus.length > 0){
            try {
                const danmu = this.danmus.shift()
                const from = Math.max(0, parseFloat(((danmu.timestamp + this.delay) / 1000).toFixed(10))) // avoid < 0
                const currentInfo: SubtitleInfo = {
                    from,
                    to: from + extra.duration, // default duration is 3
                    location: 2,
                    content: danmu.msg
                }

                body.push(currentInfo)
                this.info(`成功插入字幕[从=${from},到=${currentInfo.to},字幕=${currentInfo.content}]`, line)

                if (extra.no_duplicated){

                    if (lastInsert && from > 0 && lastInsert.to > from){
                        lastInsert.to = from
                    }
    
                    lastInsert = currentInfo

                }

            }catch(err){
                this.error(err)
            }finally{
                line++
                await sleep(1)
            }
        }

        delete this.setting.extra // delete extra property

        return {
            ...this.setting,
            body
        }
    }
    
    terminate(): void {
    }
    
}