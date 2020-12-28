import { Danmu } from "../types/danmu/Danmu"
import $ from 'jquery'
import $_ from './jquery-extend'

export function throwError(msg: string): never {
    throw new Error(msg)
}

export function timeToNanoSecs(time: string): number{
    const times = time.split(':').reverse()
    let nano = 0
    let unit = 0
    for(const t of times){
        const n = parseInt(t)
        if (isNaN(n)) {
            throwError(`${t} 不是有效的时间戳记文字。`)
        }
        nano += n * Math.pow(60, unit)
        unit++
    }

    return nano * 1000
}

export function nameOf(obj: any): string{
    return obj.constructor.name
}

export function generateToken(): string{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function readAsDanmus(file: File): Promise<Danmu[]> {
    const json = await readAsJson(file)
    if (json[0]?.timestamp && json[0]?.msg){
        return json as Array<Danmu>
    }else{
        throwError('无法转换该档案为弹幕')
    }
    
}

export async function readAsText(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            if (e.target.result instanceof ArrayBuffer) {
                rej(new Error('目标文件无法被读'))
                return
            }
            res(e.target.result)
        }
        reader.onerror = () => rej(reader.error)
        reader.readAsText(file)
    })
}

export async function readAsJson(file: File): Promise<any> {
    return JSON.parse(await readAsText(file))
}

export function loadingPattern(data: {
    btn: string,
    loading: string,
    result: string,
    run: () => Promise<string>
}){
    const {btn, loading, result, run} = data
    const btnEle = $(`#${btn}`)
    btnEle.on('click', async e => {
        const form = btnEle.parent('form')
        if (form.length > 0){
            if(!(form[0] as HTMLFormElement).checkValidity()) return
        }
        e.preventDefault()
        const resultEle = $(`#${result}`)
        resultEle[0].innerText = ''
        $_.toggleShow(`#${loading}`, true)
        $_.toggleDisable(`#${btn}`, true)
        try {
            const res = await run()
            resultEle.css('color', '')
            resultEle[0].innerText = res
        }catch(err){
            console.error(err)
            resultEle.css('color', 'red')
            resultEle[0].innerText = err?.message ?? err
        } finally {
            $_.toggleShow(`#${loading}`, false)
            $_.toggleDisable(`#${btn}`, false)
        }
    })
}

export async function download(data: {file: string, type: string, content: string}){
    const a = document.createElement("a");
    const file = new Blob([data.content], { type: data.type });
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = data.file
    a.click();
    URL.revokeObjectURL(url)
}

export async function sleep(ms: number){
    return new Promise((res,) => setTimeout(res, ms))
}

export function hexColorToDecmial(hex: string){
    if(!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        throwError(`unknown hex value: ${hex}`)
    }
    const convert: {[key: string]: number} = {
        'a': 10,
        'b': 11,
        'c': 12,
        'd': 13,
        'e': 14,
        'f': 15
    }
    let sum = 0
    let unit = 0
    for(const ch of hex.substr(1).split('').reverse()){
        let num = convert[ch.toLowerCase()] ?? parseInt(ch)
        sum += num * Math.pow(16, unit++)
    }
    return sum
}

export const isFirefox = navigator.userAgent.indexOf('Firefox') > -1

export const isChrome = navigator.userAgent.indexOf('Chrome') > -1

export const operaAgent = navigator.userAgent.indexOf("OP") > -1

export const canUseButton = isChrome

export const newerThan = function (str: string, version: string) {
    const current = str.split('.')
    const target = version.split('.')
    for (let i = 0; i < Math.max(current.length, target.length); i++) {
        const cv = i < current.length ? parseInt(current[i]) : 0
        const tv = i < target.length ? parseInt(target[i]) : 0
        if (cv > tv) {
            return true
        } else if (cv < tv) {
            return false
        }
    }
    return true
}
