import { Logger } from "./Logger";

export abstract class Loggable {

    private loggers: Logger[] = []

    addLogger(logger: Logger): void{
        this.loggers.push(logger)
    }

    protected info(msg: string, line: number = undefined): void{
        if (line) msg = `[${line}] 讯息: ${msg}`
        this.loggers.forEach(l => l.info(msg))
    }

    protected error(e: Error, line: number = undefined): void{
        if (line) e.message = `[${line}]  错误: ${e.message}: `
        this.loggers.forEach(l => l.error(e))
    }

    protected warn(msg: string, line: number = undefined): void{
        if (line) msg = `[${line}]  警告: ${msg}`
        this.loggers.forEach(l => l.warn(msg))
    }
    
}