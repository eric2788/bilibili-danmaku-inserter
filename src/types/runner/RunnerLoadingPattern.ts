import { Loggable } from "../../loggers/Loggable";
import { Runnable } from "./Runnable";

export interface RunnerLoadingPattern<T> {

    btn: string,
    loading: string,
    stopBtn: string | undefined,
    runner: string,
    settings: () => Satisfiable
    run: (runner: Runnable<T> & Loggable) => Promise<void>
    
}