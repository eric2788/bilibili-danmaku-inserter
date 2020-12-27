import { BilibiliCommunityCaption } from "./BilibiliCommunityCaption";

export interface Runnable<T> {
    
    run(): Promise<T>
    
    terminate(): void

}