import { Danmu } from "../types/Danmu";
import { JimakuLoggableParser } from "./JimakuLoggableParser";
import { throwError, timeToNanoSecs } from "../utils/misc";
export class BilibilJimakuFilterParser extends JimakuLoggableParser{

    name: string = '同传字幕过滤插件转换'

    acceptedFormat: string[] = ['.log']

    link: string = 'https://github.com/eric2788/bilibili-jimaku-filter'

    private logRegex: RegExp = /\[(?<time>[\d+:]+)\]\s(?<msg>.*)/g

    async parse(txt: String): Promise<Danmu[]> {
        const logs = txt.split('\n')
        const danmus: Danmu[] = []
        let line = 1;
        for (const log of logs){
            try {
                const [, time, msg] = this.logRegex.exec(log)

                if (!time){
                    throwError('时间戳记获取失败。')
                }

                if (!msg){
                    throwError('字幕讯息获取失败')
                }

                const timestamp = timeToNanoSecs(time)
                
                danmus.push({timestamp, msg})

                this.info(line, `文字转换成功[时间=${timestamp},讯息=${msg}]`)
            }catch(err){
                this.error(line, err)
            }finally{
                line++
            }
        }
        return danmus;
    }

}