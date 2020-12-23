import { browser } from "webextension-polyfill-ts";
import { DanmuSendInfo } from "../types/DanmuSendInfo";
import { DanmuSettings } from "../types/DanmuSettings";
import { NotifyMessage } from "../types/NotifyMessage";
import { VideoInfo } from "../types/VideoInfo";

export type DanmuPayload = {
    video: VideoInfo,
    style: DanmuSettings,
    interval: number
}

export async function fetchUser(): Promise<{username: string, lvl: number}>{
    return sendData('fetch-user', {})
}

export async function fetchVideo(bvid: string, p: number): Promise<VideoInfo>{
    return sendData('fetch-video', {bvid, p})
}

export async function sendNotify(data: NotifyMessage){
    return sendData('notify', data)
}

export async function sendNotifyId(id: string, data: NotifyMessage){
    return sendData('notify-id', {id, data})
}


export async function getLocalData(){
    return sendData('get-local-data', {})
}

export async function webFetch(url: string){
    return sendData('fetch', {url})
}

export async function sendDanmu(data: DanmuSendInfo){
    return sendData('send-danmu', data)
}

async function sendData(type: string, data: any){
    return browser.runtime.sendMessage({type, data})
}