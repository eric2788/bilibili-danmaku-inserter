import { download, hexColorToDecmial, loadingPattern, nameOf, throwError } from "./utils/misc";
import $ from 'jquery';
import { checkUpdate, fetchUser, fetchVideo, sendNotify } from "./utils/messaging";
import $_ from "./utils/jquery-extend";
import ParseManager from './managers/ParseManager'
import { BilibilJimakuFilterParser } from "./parsers/BilibiliJimakuFilterParser";
import DanmakuManager from "./managers/DanmakuManager";
import { Position, Size } from "./types/danmu/DanmuSettings";
import { DanmakuInserterRunner } from "./runners/DanmakuInserterRunner";
import { BCCConvertRunner } from "./runners/BCCConvertRunner";
import { BccConvertSettings } from "./types/settings/BccConvertSettings";
import { BilibiliInserterSettings } from "./types/settings/BilibiliInserterSettings";
import { BilibiliCommunityCaption } from "./types/BilibiliCommunityCaption";
import TabManager from "./managers/TabManager";
import { ICUJimakuParser } from "./parsers/ICUJimakuParser";

const storage: any = {}

DanmakuManager.registerRunner(() => new DanmakuInserterRunner())
DanmakuManager.registerRunner(() => new BCCConvertRunner())

ParseManager.addParser(new BilibilJimakuFilterParser())
ParseManager.addParser(new ICUJimakuParser())

$(`#check-update`).on('click', checkUpdate)

TabManager.addTab<any>({
    id: 'danmu-insert',
    name: '插入彈幕',
    active: true,
    runner: {
        btn: 'danmu-insert-btn',
        loading: 'danmu-insert-loading',
        stopBtn: 'stop-btn',
        runner: 'DanmakuInserterRunner',
        settings: () => {
            const biliInsertSettings: BilibiliInserterSettings = {
                currentVideo: storage.currentVideo,
                danmuStyle: {
                    color: hexColorToDecmial($_.input('#danmu-color').value),
                    fontSize: $_.select('#danmu-size').value as Size,
                    position: $_.select('#danmu-position').value as Position
                },
                interval: $_.input('#interval-range').valueAsNumber ?? 20000,
                resendInterval: $_.input('#resend-interval').valueAsNumber ?? 60000,
                isSatisfied: () => {
                    if (!biliInsertSettings.currentVideo){
                        return '没有视频资讯'
                    }
                    if (!biliInsertSettings.danmuStyle){
                        return '没有弹幕设定'
                    }
                    return undefined
                }
            }
            return biliInsertSettings
        },
        run: async (runner) => await runner.run()
    }
})

TabManager.addTab<BilibiliCommunityCaption>({
    id: 'bcc',
    name: '转换成BCC字幕',
    runner: {
        btn: 'bcc-btn',
            loading: 'bcc-loading',
            stopBtn: undefined,
            runner: 'BCCConvertRunner',
            settings: () => {
                const bccInfo: BccConvertSettings = {
                    font_size: $_.input('#bcc-font-size').valueAsNumber ?? 0.5,
                    font_color: $_.input('#bcc-color').value ?? '#FFFFFF',
                    background_alpha: $_.input('#bcc-bg-opacity').valueAsNumber ?? 0.4,
                    background_color: $_.input('#bcc-bg-color').value ?? '#9C27B0',
                    Stroke: 'none',
                    duration: $_.input('#bcc-duration').valueAsNumber ?? 3,
                    isSatisfied: () => undefined
                }
                return bccInfo
            },
            run: async (runner) => {
                const bcc = await runner.run()
                const json = JSON.stringify(bcc)
                await download({ file: 'converted.bcc', type: 'plain/text', content: json})
            }
    }
})



loadingPattern({
    btn: 'fetch-video-btn',
    loading: 'fetch-video-loading',
    result: 'fetch-video-result',
    run: async () => {
        const bid = $_.input('#bvid').value
        const p = $_.input('#page').valueAsNumber
        const info = await fetchVideo(bid, p)
        $('#video-info-title')[0].innerText = info.title
        $('#video-info-page')[0].innerText = `${info.page}`
        $('#video-info-duration')[0].innerText = `${info.duration}`
        storage.currentVideo = info
        return '视频资讯请求成功'
    }
})

loadingPattern({
    btn: 'user-fetch-btn',
    loading: 'user-fetch-loading',
    result: 'user-fetch-result',
    run: async () => {
        const {username, lvl} = await fetchUser()
        verifyLevel(lvl)
        return `弹幕发送者: ${username} (Lv${lvl})`
    }
})

function verifyLevel(lvl: number){
    $_.toggleDisable('#danmu-position', false)
    $_.toggleDisable('#danmu-color', false)
    $_.toggleDisable('#danmu-size', false)
    switch(lvl){
        case 0:
            throwError('你的账号等级不足以发送弹幕')
        case 1:
            $_.toggleDisable('#danmu-position', true)
            $_.select('#danmu-position').value = 'normal'
            $_.toggleDisable('#danmu-color', true)
            $_.input('#danmu-color').value = '#FFFFFF'
            break;
        case 2:
            $_.toggleDisable('#danmu-position', true)
            $_.select('#danmu-position').value = 'normal'
            break;
        case 3:
        case 4:
        case 5:
        case 6:
            break;
        default:
            throwError(`未知等级: ${lvl}`)
    }
}