import { Loggable } from "../loggers/Loggable";
import { Runnable } from "../types/Runnable";
import { StorageSettings } from "../types/StorageSettings";
import { readAsDanmus, throwError } from "../utils/misc";
import { BilibiliDanmakuInserterRunner } from "./BilibiliDanmakuInserterParser";


async function getRunner(file: File, setting: StorageSettings): Promise<Loggable & Runnable>{
    const danmus = await readAsDanmus(file)
    const {currentVideo, danmuStyle, interval} = setting
    if (!currentVideo){
        throwError('没有视频资讯')
    }
    if (!danmuStyle){
        throwError('没有弹幕设定')
    }
    if (setting.interval < 1000 || setting.interval > 100000){
        throwError('发送请求间隔超出范围 (1000 ~ 10000) 毫秒')
    }
    const payload = { video: currentVideo, style: danmuStyle, interval: interval ?? 5000 }
    return new BilibiliDanmakuInserterRunner(danmus, payload)
}


export default {
    getRunner
}