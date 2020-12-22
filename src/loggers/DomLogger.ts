import { Logger } from "./Logger";

import $ from 'jquery'

export class DomLogger implements Logger {

    private elemnt: HTMLElement

    constructor(element: HTMLElement){
        if (!$(element).hasClass('logger-box')){
            throw new Error('HTMLElement should has logger-box class')
        }
        this.elemnt = element;
    }

    name: String

    info(msg: String): void {
        $(this.elemnt).append(`
            <p class="log">${this.name ?? ''}${msg}</p>
        `)
    }

    error(e: Error): void {
        $(this.elemnt).append(`
            <p class="log" style="color: red">${this.name ?? ''}${e.message}</p>
        `)
    }

    warn(msg: String): void {
        $(this.elemnt).append(`
            <p class="log" style="color: yellow">${this.name ?? ''}${msg}</p>
        `)
    }


}