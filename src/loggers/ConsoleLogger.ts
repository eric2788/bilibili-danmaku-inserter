import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {

    name: string;

    private console: Console

    constructor(console: Console){
        this.console = console
    }

    info(msg: String): void {
        this.console.info(`${this.name ?? ''}${msg}`)
    }

    error(e: Error): void {
        this.console.error(`${this.name ?? ''}${e.message}: `)
        this.console.error(e)
    }

    warn(msg: String): void {
        this.console.warn(`${this.name ?? ''}${msg}`)
    }

}