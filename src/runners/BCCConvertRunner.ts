import { BccConvertSettings } from "../types/settings/BccConvertSettings";
import { BilibiliCommunityCaption } from "../types/BilibiliCommunityCaption";
import { MainStreamRunner } from "../types/runner/MainStreamRunner";
import { SubtitleInfo } from "../types/infos/SubtitleInfo";
import { keys } from "ts-transformer-keys";

export class BCCConvertRunner extends MainStreamRunner<BilibiliCommunityCaption, BccConvertSettings> {

    protected isInstance(sat: Satisfiable): boolean {
        return keys<BccConvertSettings>().every(s => s in sat)
    }

    async run(): Promise<BilibiliCommunityCaption> {
        const body: SubtitleInfo[] = []
        
        let lastInsert: SubtitleInfo = undefined
        let line = 1
        while (this.danmus.length > 0){
            try {
                const danmu = this.danmus.shift()
                const from = Math.max(0, parseFloat(((danmu.timestamp + this.delay) / 1000).toFixed(5))) // avoid < 0
                const currentInfo: SubtitleInfo = {
                    from,
                    to: from + 3,
                    location: 2,
                    content: danmu.msg
                }

                body.push(currentInfo)
                this.info(`成功插入字幕[从=${from},到=${currentInfo.to},字幕=${currentInfo.content}]`, line)

                if (lastInsert && from > 0 && lastInsert.to > from){
                    lastInsert.to = from
                }

                lastInsert = currentInfo

            }catch(err){
                this.error(err)
            }finally{
                line++
            }
        }

        return {
            ...this.setting,
            body
        }
    }
    
    terminate(): void {
    }
    
}