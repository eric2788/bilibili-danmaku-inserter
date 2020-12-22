import { browser } from "webextension-polyfill-ts";
import { DanmuSettings } from "../types/DanmuSettings";
import { NotifyMessage } from "../types/NotifyMessage";
import { VideoInfo } from "../types/VideoInfo";

export type DanmuPayload = {
    video: VideoInfo,
    data: DanmuSettings
}

export async function fetchUser(bvid: string): Promise<string>{
    return sendData('fetch-user', {bvid})
}

export async function fetchVideo(bvid: string, p: number): Promise<VideoInfo>{
    return sendData('fetch-video', {bvid, p})
}

export async function sendNotify(data: NotifyMessage){
    return sendData('notify', data)
}

export async function getLocalData(){
    return sendData('get-local-data', {})
}

export async function webFetch(url: string){
    return sendData('fetch', {url})
}

export async function sendDanmu(data: DanmuPayload){
    return sendData('send-danmu', data)
}

async function sendData(type: string, data: any){
    return browser.runtime.sendMessage({type, data})
}