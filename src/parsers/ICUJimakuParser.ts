import { Danmu } from "../types/danmu/Danmu";
import { ICUJimaku } from "../types/parsers/ICUJimaku";
import { sleep, throwError } from "../utils/misc";
import { JimakuLoggableParser } from "../types/parsers/JimakuLoggableParser";

export class ICUJimakuParser extends JimakuLoggableParser {

    name: string = 'matsuri.icu 网站 翻译man字幕JSON 转换'

    acceptedFormat: string[] = ['.json']

    link: string = 'https://matsuri.icu/'

    async parse(txt: string): Promise<Danmu[]> {
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
                body.push({
                    timestamp: realTime,
                    msg: comment.text
                }) 
                this.info(`文字转换成功: [时间=${realTime},讯息=\"${comment.text}\",时间参照=\"${this.toTimer(Math.round(realTime / 1000))}\"]`, line)
            }catch(err){
                this.error(err, line)
            }finally{
                line++
                await sleep(1)
            }
        }
        return body
    }

    private toTimer(secs: number): string{
        let min = 0;
        let hr = 0;
        while(secs >= 60){
            secs -= 60
            min++
        }
        while (min >= 60){
            min -= 60
            hr++
        }
        const mu = min > 9 ? `${min}`: `0${min}`
        const ms = secs > 9 ? `${secs}` : `0${secs}`
        return `${hr}:${mu}:${ms}`
    }
}