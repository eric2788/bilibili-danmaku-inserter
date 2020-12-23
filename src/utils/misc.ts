import { Danmu } from "../types/Danmu"
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

export function generateToken(): string{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function readAsDanmus(file: File): Promise<Danmu[]> {
    return await readAsJson(file) as Danmu[]
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
    $(`#${btn}`).on('click', async e => {
        const resultEle = $(`#${result}`)
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