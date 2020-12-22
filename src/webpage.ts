import { DomLogger } from "./loggers/DomLogger";
import { JimakuLoggableParser } from "./parsers/JimakuLoggableParser";
import { generateToken } from "./utils/misc";
import $ from 'jquery';
import { DanmuPayload, fetchVideo } from "./utils/messaging";
import $_ from "./utils/jquery-extend";
import { StorageSettings } from "./types/StorageSettings";

console.log('web page activated!')

const storage: StorageSettings = {}

$('#fetch-video-btn').on('click', async e => {
    $_.toggleShow('#fetch-video-loading', true)
    $_.toggleDisable('#fetch-video-btn', true)
    const resultEle = $('#fetch-video-result')
    try {
        const bid = $_.input('#bvid').value
        const p = $_.input('#page').valueAsNumber
        const info = await fetchVideo(bid, p)
        $('#video-info-title')[0].innerText = info.title
        $('#video-info-page')[0].innerText = `${info.page}`
        $('#video-info-duration')[0].innerText = `${info.duration - 1}`
        storage.currentVideo = info
        resultEle.css('color', '')
        resultEle[0].innerText = '视频资讯请求成功'
    }catch(err){
        console.error(err)
        resultEle.css('color', 'red')
        resultEle[0].innerText = err.message

    }finally {
        $_.toggleShow('#fetch-video-loading', false)
        $_.toggleDisable('#fetch-video-btn', false)
    }
})


function addParser(parser: JimakuLoggableParser){
    const token = generateToken()
    const file = `${token}-file`
    const btn = `${token}-convert`
    const dom =  `
        <div class="card mb-3">
        <div class="card-header">
            <a href="#${token}" data-toggle="collapse">➵ ${parser.name}</a>
        </div>
        <div class="form-group collapse" id="${token}">
            <div class="card-body">
                <small><a href="${parser.link}">${parser.name}的相关网址</a></small>
                <div class="mb-3">
                    <label for="${file}" class="form-label">导入档案</label>
                    <input class="form-control" type="file" id="${file}" accept="${parser.acceptedFormat.join(', ')}">
                </div>
                <button class="btn btn-primary" id="${btn}">转换档案</button>
            </div>
        </div>
        </div>
    `
    $('#danmaku-convert').append(dom)
    $(`#${btn}`).on('click',async e => {
        parser.addLogger(new DomLogger($()[0]))
        try {

        }catch(err){

        }
    })

}