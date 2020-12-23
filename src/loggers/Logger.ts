export interface Logger {
    
    name: string

    info(msg: string): void

    error(e: Error): void

    warn(msg: string): void
    
}
