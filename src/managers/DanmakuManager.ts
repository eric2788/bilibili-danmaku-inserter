import { Loggable } from "../loggers/Loggable";
import { Runnable } from "../types/runner/Runnable";
import { nameOf, readAsDanmus, throwError } from "../utils/misc";
import { GlobalSettings } from "../types/settings/GlobalSettings";
import { MainStreamRunner } from "../types/runner/MainStreamRunner";


async function getRunner<T>(key: string, globalSetting: GlobalSettings, setting: Satisfiable): Promise<Loggable & Runnable<T>>{
    if (!globalSetting.file){
        throwError('无法解析档案')
    }
    if (isNaN(globalSetting.delay)){
        throwError('发送时间调整数值无效')
    }
    const danmus = await readAsDanmus(globalSetting.file)
    const errorMessage = setting.isSatisfied()
    if (errorMessage){
        throwError(errorMessage)
    }
    console.log(`getting runner: ${key}`)
    const runner = map[key]?.call(this)
    if (runner == null || !runner ) throwError(`Cannot get the runner: ${key}`)
    runner.assignSetting(danmus, globalSetting.delay, setting)
    return runner
}


const map: { [key: string]: () => MainStreamRunner<any, any> } = {}

function registerRunner(runner: () => MainStreamRunner<any, any>){
    const key = nameOf(runner.call(this))
    console.log(`registered runner: ${key}`)
    map[key] = runner
}


export default {
    getRunner,
    registerRunner
}