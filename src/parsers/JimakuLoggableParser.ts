import { Danmu } from "../types/Danmu";
import { Loggable } from "../loggers/Loggable";
import { Logger } from "../loggers/Logger";
import { JimakuParser } from "./JimakuParser";

export abstract class JimakuLoggableParser implements Loggable, JimakuParser {

    abstract name: string
    abstract acceptedFormat: string[]
    abstract link: string

    private loggers: Logger[] = []

    addLogger(logger: Logger): void {
        this.loggers.push(logger)
    }

    abstract parse(txt: string): Promise<Danmu[]>

    protected info(line: number, msg: string): void{
        msg = `行数: ${line}, 讯息: ${msg}`
        this.loggers.forEach(l => l.info(msg))
    }

    protected error(line: number, e: Error): void{
        e.message = `行数: ${line}, 错误: ${e.message}: `
        this.loggers.forEach(l => l.error(e))
    }

    protected warn(line: number, msg: string): void{
        msg = `行数: ${line}, 警告: ${msg}`
        this.loggers.forEach(l => l.warn(msg))
    }

    


}