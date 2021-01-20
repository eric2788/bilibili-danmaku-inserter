import { TabInfo } from "../types/TabInfo";
import { loadHtml, sendNotify } from "../utils/messaging";
import $ from 'jquery'
import $_ from '../utils/jquery-extend'
import { throwError } from "../utils/misc";
import DanmakuManager from "./DanmakuManager";
import { GlobalSettings } from "../types/settings/GlobalSettings";
import { RunnerLoadingPattern } from "../types/runner/RunnerLoadingPattern";
import { DomLogger } from "../loggers/DomLogger";
import { ConsoleLogger } from "../loggers/ConsoleLogger";


const running: Set<string> = new Set()

async function addTab<T>(info: TabInfo<T>){
    try {
        const {id, render, name, active, runner} = info
        const extraCls = active ? 'show active' : ''
        const extraClsTab = active ? 'active' : ''
        const tabContent = $('#tab-content')
        const sectionTab = $('#section-tab')
        const templateTab = `
            <li class="nav-item" role="presentation">
                <a class="nav-link ${extraClsTab}" id="${id}-tab" data-bs-toggle="tab" href="#${id}" role="tab" aria-controls="profile">${name}</a>
            </li>
        `
        const template =  `
        <!-- ${id} -->
        <div class="tab-pane fade ${extraCls}" id="${id}" role="tabpanel">
            <div class="row">
                <div class="col-sm">
                    <form id="${id}-form"></form>
                </div>
                <div class="col-sm">
                    <div class="border border-secondary logger-box" id="main-output-${id}">
                        <p class="log">(输出日志: 此处将进行日志输出)</p>
                    </div>
                    <button class="btn btn-danger btn-sm" style="float: right" id="clear-log-btn-${id}">
                        清空日志
                    </button>
                </div>
            </div>
        </div>
        `
        const formContent = await loadHtml(render ?? `tabs/${id}.html`)
        sectionTab.append(templateTab)
        tabContent.append(template)
        $(`form#${id}-form`).append(formContent)
        clearLogLink(id)
        runnerLoadingPattern(runner, id)
        info.initialize?.apply(window)
    }catch(err){
        console.error(err)
        await sendNotify({
            title: '加载 Tab 失败',
            message: err?.message ?? err
        })
    }
}

function clearLogLink(id: string){
    $(`#clear-log-btn-${id}`).on('click', e => {
        $(`#main-output-${id} > p`).remove()
    })
}

function runnerLoadingPattern<T extends Object>(data: RunnerLoadingPattern<T>, tab: string){
    const {btn, runner: key, loading, stopBtn, settings, run} = data
    const btnEle = $(`#${btn}`)
    btnEle.on('click', async e => {
        const form = $(`#${tab} form`)
        if (form.length > 0 && !(<HTMLFormElement>form[0]).checkValidity()){
            return
        }
        e.preventDefault()
        $_.toggleShow(`#${tab} #${loading}`, true)
        $_.toggleDisable(`#${tab} button`, true)
        $_.toggleDisable(`#prepare-form button`, true)
        if (stopBtn){
            $_.toggleDisable(`#${tab} #${stopBtn}`, false)
        }
        try {
            if (running.has(tab)) {
                throwError('此程序正在运行中。')
            }
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
                return false;
            };
            if (stopBtn){
                $(`#${tab} #${stopBtn}`).one('click', e => {
                    e.preventDefault()
                    runner.terminate()
                    $_.toggleDisable(`#${tab} #${stopBtn}`, true)
                })
            }
            runner.addLogger(new ConsoleLogger(window.console))
            runner.addLogger(new DomLogger($(`#main-output-${tab}`)[0]))
            running.add(tab)
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
            running.delete(tab)
            $_.toggleShow(`#${tab} #${loading}`, false)
            $_.toggleDisable(`#${tab} button`, false)
            if (running.size === 0) $_.toggleDisable(`#prepare-form button`, false)
            if (stopBtn) $_.toggleDisable(`#${stopBtn}`, true)
            window.onbeforeunload = function(e: BeforeUnloadEvent) {
                delete e.returnValue
            };
        }
    })
}


export default {
    addTab
}