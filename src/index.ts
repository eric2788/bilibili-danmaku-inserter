import { hexColorToDecmial, loadingPattern, throwError } from "./utils/misc";
import $ from 'jquery';
import { fetchUser, fetchVideo, sendNotify } from "./utils/messaging";
import $_ from "./utils/jquery-extend";
import { StorageSettings } from "./types/StorageSettings";
import ParseManager from './managers/ParseManager'
import { BilibilJimakuFilterParser } from "./parsers/BilibiliJimakuFilterParser";
import DanmakuManager from "./managers/DanmakuManager";
import { ConsoleLogger } from "./loggers/ConsoleLogger";
import { DomLogger } from "./loggers/DomLogger";
import { Position, Size } from "./types/DanmuSettings";

console.log('web page activated!')

const storage: StorageSettings = {}

$('#clear-log-btn').on('click', e => {
    $('#main-output > p').remove()
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

$(`#danmu-insert-btn`).on('click', async e => {
    $_.toggleShow(`#danmu-insert-loading`, true)
    $_.toggleDisable(`button`, true)
    try {
        const files = $_.input(`#danmaku-insert-file`).files
        if (files.length == 0) {
            throwError('你没有选择任何档案。')
        }
        const f = files[0]
        if (f.type !== 'application/json') {
            throwError(`请选择 JSON 档案`)
        }
        storage.danmuStyle = {
            color: hexColorToDecmial($_.input('#danmu-color').value),
            fontSize: $_.select('#danmu-size').value as Size,
            position: $_.select('#danmu-position').value as Position
        }
        storage.interval = $_.input('#interval-range').valueAsNumber ?? 5000
        window.onbeforeunload = function() {
            return "inserter running";
        };
        const runner = await DanmakuManager.getRunner(f, storage)
        runner.addLogger(new ConsoleLogger(window.console))
        runner.addLogger(new DomLogger($('#main-output')[0]))
        await runner.run()
        await sendNotify({
            title: '运行成功',
            message: '所有弹幕已成功插入。'
        })
    }catch(err){
        console.error(err)
        await sendNotify({
            title: '插入失败。',
            message: err?.message ?? err
        })
    } finally {
        $_.toggleShow(`#danmu-insert-loading`, false)
        $_.toggleDisable(`button`, false)
        window.onbeforeunload = function(e: BeforeUnloadEvent) {
            delete e.returnValue
        };
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

ParseManager.addParser(new BilibilJimakuFilterParser())