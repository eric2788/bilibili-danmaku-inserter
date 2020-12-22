export interface Logger {
    
    name: String

    info(msg: String): void

    error(e: Error): void

    warn(msg: String): void
    
}
