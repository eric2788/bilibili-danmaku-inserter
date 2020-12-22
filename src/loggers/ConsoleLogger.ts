import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {

    name: String;

    info(msg: String): void {
        console.info(`${this.name ?? ''}${msg}`)
    }

    error(e: Error): void {
        console.error(`${this.name}${e.message}: `)
        console.error(e)
    }

    warn(msg: String): void {
        console.warn(`${this.name ?? ''}${msg}`)
    }

}