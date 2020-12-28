import { download, hexColorToDecmial, loadingPattern, nameOf, throwError } from "./utils/misc";
import $ from 'jquery';
import { checkUpdate, fetchUser, fetchVideo, sendNotify } from "./utils/messaging";
import $_ from "./utils/jquery-extend";
import ParseManager from './managers/ParseManager'
import { BilibilJimakuFilterParser } from "./parsers/BilibiliJimakuFilterParser";
import DanmakuManager from "./managers/DanmakuManager";
import { ConsoleLogger } from "./loggers/ConsoleLogger";
import { DomLogger } from "./loggers/DomLogger";
import { Position, Size } from "./types/danmu/DanmuSettings";
import { GlobalSettings } from "./types/settings/GlobalSettings";
import { Runnable } from "./types/Runnable";
import { DanmakuInserterRunner } from "./runners/DanmakuInserterRunner";
import { BCCConvertRunner } from "./runners/BCCConvertRunner";
import { Loggable } from "./loggers/Loggable";
import { BccConvertSettings } from "./types/settings/BccConvertSettings";
import { BilibiliInserterSettings } from "./types/settings/BilibiliInserterSettings";
import { BilibiliCommunityCaption } from "./types/BilibiliCommunityCaption";
import TabManager from "./managers/TabManager";

const storage: any = {}

DanmakuManager.registerRunner(() => new DanmakuInserterRunner())
DanmakuManager.registerRunner(() => new BCCConvertRunner())

ParseManager.addParser(new BilibilJimakuFilterParser())

$(`#check-update`).on('click', checkUpdate)

TabManager.addTab({
    id: 'bcc',
    name: '转换成BCC字幕'
}).then(() => {
    bccListener()
    bccLogListener()
})

const bccLogListener = () => clearLogLink('bcc')

const bccListener = () => runnerLoadingPattern<BilibiliCommunityCaption>({
    btn: 'bcc-btn',
    loading: 'bcc-loading',
    stopBtn: undefined,
    runner: 'BCCConvertRunner',
    tab: 'bcc',
    settings: () => {
        const bccInfo: BccConvertSettings = {
            font_size: $_.input('#bcc-font-size').valueAsNumber ?? 0.5,
            font_color: $_.input('#bcc-color').value ?? '#FFFFFF',
            background_alpha: $_.input('#bcc-bg-opacity').valueAsNumber ?? 0.4,
            background_color: $_.input('#bcc-bg-color').value ?? '#9C27B0',
            Stroke: 'none',
            isSatisfied: () => undefined
        }
        return bccInfo
    },
    run: async (runner) => {
        runner.addLogger(new ConsoleLogger(window.console))
        runner.addLogger(new DomLogger($('#main-output-bcc')[0]))
        const bcc = await runner.run()
        const json = JSON.stringify(bcc)
        await download({ file: 'converted.bcc', type: 'plain/text', content: json})
    }
})

clearLogLink('danmu')

runnerLoadingPattern<any>({
    btn: 'danmu-insert-btn',
    loading: 'danmu-insert-loading',
    stopBtn: 'stop-btn',
    runner: 'DanmakuInserterRunner',
    tab: 'danmaku-insertion',
    settings: () => {
        const biliInsertSettings: BilibiliInserterSettings = {
            currentVideo: storage.currentVideo,
            danmuStyle: {
                color: hexColorToDecmial($_.input('#danmu-color').value),
                fontSize: $_.select('#danmu-size').value as Size,
                position: $_.select('#danmu-position').value as Position
            },
            interval: $_.input('#interval-range').valueAsNumber ?? 5000,
            resendInterval: $_.input('#resend-interval').valueAsNumber ?? 20000,
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
    run: async (runner) => {
        runner.addLogger(new ConsoleLogger(window.console))
        runner.addLogger(new DomLogger($('#main-output-danmu')[0]))
        await runner.run()
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
        $_.toggleDisable('#user-fetch-btn', false)
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
        $_.toggleDisable('#danmu-insert-btn', false)
        return `弹幕发送者: ${username} (Lv${lvl})`
    }
})


function clearLogLink(id: string){
    $(`#clear-log-btn-${id}`).on('click', e => {
        $(`#main-output-${id} > p`).remove()
    })
}

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

function runnerLoadingPattern<T extends Object>(data: {
    btn: string,
    loading: string,
    stopBtn: string | undefined,
    tab: string,
    runner: string,
    settings: () => Satisfiable
    run: (runner: Runnable<T> & Loggable) => Promise<void>
}){
    const {btn, runner: key, loading, tab, stopBtn, settings, run} = data
    const btnEle = $(`#${btn}`)
    btnEle.on('click', async e => {
        const form = $(`#${tab} form`)
        if (form.length > 0 && !(<HTMLFormElement>form[0]).checkValidity()){
            return
        }
        e.preventDefault()
        $_.toggleShow(`#${tab} #${loading}`, true)
        $_.toggleDisable(`#${tab} button`, true)
        if (stopBtn){
            $_.toggleDisable(`#${tab} #${stopBtn}`, false)
        }
        try {
            const files = $_.input(`#danmaku-insert-file`).files
            if (files.length == 0) {
                throwError('你没有选择任何档案。')
            }
            const f = files[0]
            if (f.type !== 'application/json') {
                throwError(`请选择 JSON 档案`)
            }
            const delay = $_.input('#danmaku-delay').valueAsNumber ?? 0
            const globalSettings: GlobalSettings = {file: f, delay}
            const sat = settings()
            const runner = await DanmakuManager.getRunner<T>(key, globalSettings, sat)
            window.onbeforeunload = function() {
                return "inserter running";
            };
            if (stopBtn){
                $(`#${tab} #${stopBtn}`).one('click', e => {
                    e.preventDefault()
                    runner.terminate()
                    $_.toggleDisable(`#${tab} #${stopBtn}`, true)
                })
            }
            await run(runner)
            await sendNotify({
                title: '运行成功',
                message: '程序运行成功，详见输出日志。'
            })
        }catch(err){
            console.error(err)
            await sendNotify({
                title: '运行失败。',
                message: err?.message ?? err
            })
        }finally {
            $_.toggleShow(`#${tab} #${loading}`, false)
            $_.toggleDisable(`#${tab} button`, false)
            if (stopBtn) $_.toggleDisable(`#${stopBtn}`, true)
            window.onbeforeunload = function(e: BeforeUnloadEvent) {
                delete e.returnValue
            };
        }
    })
}