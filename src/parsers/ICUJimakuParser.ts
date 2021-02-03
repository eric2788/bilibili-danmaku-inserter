import { Danmu } from "../types/danmu/Danmu";
import { ICUJimaku } from "../types/parsers/ICUJimaku";
import { sleep, throwError, toTimer } from "../utils/misc";
import { JimakuLoggableParser } from "../types/parsers/JimakuLoggableParser";
import { ParserSettings } from "../types/settings/ParserSettings";

export class ICUJimakuParser extends JimakuLoggableParser {

    name: string = 'matsuri.icu 网站 翻译man字幕JSON 转换'

    acceptedFormat: string[] = ['.json']

    link: string = 'https://matsuri.icu/'

    async parse(txt: string, settings: ParserSettings): Promise<Danmu[]> {
        const s = JSON.parse(txt)
        if (!('info' in s) || !('full_comments' in s)){
            throwError('档案格式无效')
        }
        const jimakus = s as ICUJimaku
        const { start_time } = jimakus.info
        const body: Danmu[] = []
        const comments = jimakus.full_comments
        let line = 1;
        while(comments.length > 0){
            try {
                const comment = comments.shift()
                const realTime = comment.time - start_time
                if (!comment.text || comment.text === null){
                    throwError('字幕文字为空或null')
                }
                const danmu = comment.text
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
                body.push({
                    timestamp: realTime,
                    msg
                }) 
                this.info(`文字转换成功: [时间=${realTime},讯息=\"${msg}\",时间参照=\"${toTimer(Math.round(realTime / 1000))}\"]`, line)
            }catch(err){
                this.error(err, line)
            }finally{
                line++
                await sleep(1)
            }
        }
        return body
    }
}