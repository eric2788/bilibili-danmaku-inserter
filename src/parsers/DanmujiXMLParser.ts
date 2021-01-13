import { DomLogger } from "../loggers/DomLogger";
import { Danmu } from "../types/danmu/Danmu";
import { JimakuLoggableParser } from "../types/parsers/JimakuLoggableParser";
import $ from 'jquery'
import { sleep, throwError, toTimer } from "../utils/misc";

export class DanmujiXMLParser extends JimakuLoggableParser{

    name: string = '弹幕姬XML格式'
    acceptedFormat: string[] = ['.xml']
    link: string = 'https://www.danmuji.org/'

    async parse(txt: string): Promise<Danmu[]> {
        const domParser: DOMParser = new DOMParser()
        const element = domParser.parseFromString(txt, 'text/xml')
        const danmu: Danmu[] = []
        const list = $(element).find('i').children('d')
        let line = 1
        for (const e of list) {
            try {
                const p = e.getAttribute('p')
                const [timeStr] = p.split(',')
                const time = parseFloat(timeStr)
                if (isNaN(time)) {
                    throwError('未知的时间戳记')
                }
                const timestamp = time * 1000
                const msg = e.textContent
                danmu.push({ timestamp, msg })
                this.info(`文字转换成功: [时间=${timestamp},讯息=${msg},时间参照=${toTimer(Math.round(time))}]`)
            } catch (err) {
                this.error(err, line)
            } finally {
                line++
                await sleep(1)
            }
        }
        return danmu
    }

}