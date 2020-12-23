import { Logger } from "./Logger";

import $ from 'jquery'
import { throwError } from "../utils/misc";

export class DomLogger implements Logger {

    private elemnt: HTMLElement

    constructor(element: HTMLElement){
        if (!element){
            throwError('HTMLElement is undefined')
        }
        if (!$(element).hasClass('logger-box')){
            throwError('HTMLElement should has logger-box class')
        }
        this.elemnt = element;
    }

    name: string

    info(msg: string): void {
        const ele = $(this.elemnt)
        ele.append(`<p class="log">${this.name ?? ''}${msg}</p>`)
        ele.scrollTop(ele[0].scrollHeight)
    }

    error(e: Error): void {
        const ele = $(this.elemnt)
        ele.append(`<p class="log" style="color: red">${this.name ?? ''}${e.message}</p>`)
        ele.scrollTop(ele[0].scrollHeight)
    }

    warn(msg: string): void {
        const ele = $(this.elemnt)
        ele.append(`<p class="log" style="color: orange">${this.name ?? ''}${msg}</p>`)
        ele.scrollTop(ele[0].scrollHeight)
    }


}