import { TabInfo } from "../types/TabInfo";
import { loadHtml, sendNotify } from "../utils/messaging";

async function addTab(info: TabInfo){
    try {
        const {id, render, name} = info
        const tabContent = $('#tab-content')
        const sectionTab = $('#section-tab')
        const templateTab = `
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="${id}-tab" data-bs-toggle="tab" href="#${id}" role="tab" aria-controls="profile">${name}</a>
            </li>
        `
        const template =  `
        <!-- ${id} -->
        <div class="tab-pane fade" id="${id}" role="tabpanel">
            <div class="row">
                <div class="col-sm">
                    <form id="${id}-form"></form>
                </div>
                <div class="col-sm">
                    <div class="border border-secondary logger-box" id="main-output-${id}">
                        <p class="log">(输出日志: 此处将进行日志输出)</p>
                    </div>
                    <button class="btn btn-danger btn-sm" style="float: right" id="clear-log-btn-${id}">清空日志</button>
                </div>
            </div>
        </div>
        `
        const formContent = await loadHtml(render ?? `tabs/${id}.html`)
        sectionTab.append(templateTab)
        tabContent.append(template)
        $(`form#${id}-form`).append(formContent)
    }catch(err){
        console.error(err)
        await sendNotify({
            title: '加载 Tab 失败',
            message: err?.message ?? err
        })
    }
}

export default {
    addTab
}