import { Logger } from "./Logger";

export interface Loggable {

    addLogger(logger: Logger): void
    
}