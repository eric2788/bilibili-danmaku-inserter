import { ConsoleLogger } from "../loggers/ConsoleLogger"
import { DomLogger } from "../loggers/DomLogger"
import { JimakuLoggableParser } from "../parsers/JimakuLoggableParser"
import { download, generateToken, loadingPattern, readAsText, throwError } from "../utils/misc"
import $ from 'jquery'
import $_ from '../utils/jquery-extend'

function addParser(parser: JimakuLoggableParser){
    const token = generateToken().split('').map(s => {
        if (!/\d/g.test(s)) return s
        return String.fromCharCode(97 + parseInt(s))
    }).join('')
    const file = `${token}-file`
    const btn = `${token}-convert`
    const loggerBox = `${token}-logger`
    const clearLog = `${token}-clear-log`
    const loading = `${token}-loading`
    const result = `${token}-result`
    const dom =  `
        <div class="card mb-3">
            <div class="card-header">
                <a href="#${token}" data-bs-toggle="collapse">➵ ${parser.name}</a>
            </div>
            <div class="form-group collapse" id="${token}">
                <div class="card-body">
                <div class="row">
                        <small><a href="${parser.link}" target="_blank" alt="${parser.name}">【${parser.name}】的相关网址</a></small>
                        <div class="col-sm">
                            <div class="mb-3">
                                <label for="${file}" class="form-label">导入档案</label>
                                <input class="form-control" type="file" id="${file}" accept="${parser.acceptedFormat.join(', ')}">
                            </div>
                            <button class="btn btn-primary" id="${btn}">
                                转换档案
                                <div id="${loading}" class="spinner-border spinner-border-sm" role="status" style="display: none;"></div>
                            </button>
                            <small id="${result}"></small>
                        </div>
                        <div class="col-sm">
                            <div class="border border-secondary logger-box" id="${loggerBox}">
                                <p class="log">(输出日志: 此处将进行日志输出)</p>
                            </div>
                            <button class="btn btn-danger btn-sm" style="float: right" id="${clearLog}">清空日志</button>
                        </div>
                </div>
                </div>
            </div>
        </div>
    `
    $('#danmaku-convert').append(dom)
    parser.addLogger(new DomLogger($(`#${loggerBox}`)[0]))
    parser.addLogger(new ConsoleLogger(window.console))
    loadingPattern({
        btn, loading, result,
        run: async () => {
            const files = $_.input(`#${file}`).files
            if (files.length == 0) {
                throwError('你没有选择任何档案。')
            }
            const f = files[0]
            if (!parser.acceptedFormat.some(s => f.name.endsWith(s))){
                throwError(`档案类型不支援: ${f.type}`)
            }
            const txt = await readAsText(f)
            const danmus = await parser.parse(txt)
            const content = JSON.stringify(danmus)
            await download({
                content,
                type: 'application/json',
                file: `${f.name}-converted`
            })
            return `转换成功`
        }
    })
    $(`#${clearLog}`).on('click', e => {
        $(`#${loggerBox} > p`).remove()
    })
}


export default {
    addParser
}