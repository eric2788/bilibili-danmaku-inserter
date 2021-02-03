import { Danmu } from "../types/danmu/Danmu";
import { JimakuLoggableParser } from "../types/parsers/JimakuLoggableParser";
import { ParserSettings } from "../types/settings/ParserSettings";
import { sleep, throwError, timeToNanoSecs } from "../utils/misc";
export class BilibilJimakuFilterParser extends JimakuLoggableParser{

    name: string = '同传字幕过滤插件转换'

    acceptedFormat: string[] = ['.log']

    link: string = 'https://ngabbs.com/read.php?tid=24434809'

    async parse(txt: String, settings: ParserSettings): Promise<Danmu[]> {
        const logs = txt.split('\n')
        const danmus: Danmu[] = []
        let line = 1;
        for (const log of logs){
            try {
                const [, time, danmu] = /\[(?<time>[\d+:]+)\]\s(?<msg>.*)/g.exec(log) ?? []

                if (!time){
                    throwError('时间戳记获取失败。')
                }

                if (!danmu){
                    throwError('字幕讯息获取失败')
                }

                let msg: string = danmu

                const { enable: filterEnable, regex } = settings.filter
                if (filterEnable){
                    const reg = new RegExp(regex)
                    const g = reg.exec(danmu)?.groups
                    const n = g?.n
                    const cc = g?.cc
                    if (!cc) {
                        this.warn(`文字转换失败，该弹幕不符合正则表达式。[danmu=${danmu}]`, line)
                        continue;
                    }
                    msg = n ? `${n}: ${cc}` : cc
                }             

                const timestamp = timeToNanoSecs(time)
                
                danmus.push({timestamp, msg})

                this.info(`文字转换成功: [时间=${timestamp},讯息=${msg}]`, line)
            }catch(err){
                this.error(err, line)
            }finally{
                line++
                await sleep(1)
            }
        }
        return danmus;
    }

}