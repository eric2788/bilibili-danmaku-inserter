import { Loggable } from "../loggers/Loggable";
import { throwError} from "../utils/misc";
import { Danmu } from "./danmu/Danmu";
import { Runnable } from "./Runnable";

export abstract class MainStreamRunner<T, Setting extends Satisfiable> extends Loggable implements Runnable<T> {

    protected danmus: Danmu[]
    protected delay: number
    protected setting: Setting

    assignSetting(danmus: Danmu[], delay: number, setting: Satisfiable){
        this.danmus = danmus
        this.delay = delay
        if(!this.isInstance) throwError(`casting failed for ${typeof setting}`)
        this.setting = setting as Setting
    }

    protected abstract isInstance(sat: Satisfiable): boolean

    abstract run(): Promise<T> 

    abstract terminate(): void

}