export interface Runnable {
    
    run(): Promise<any>
    
    terminate(): void
}