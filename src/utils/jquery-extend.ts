import $ from 'jquery'

function input(id: string){
    const ele = $(id)[0]
    if(!(ele instanceof HTMLInputElement)) throw new Error(ele+' not HTMLInputElement')
    return (ele as HTMLInputElement)
}

function select(id: string){
    const ele = $(id)[0]
    if(!(ele instanceof HTMLSelectElement)) throw new Error(ele+' not HTMLInputElement')
    return (ele as HTMLSelectElement)
}

function toggleShow(id: string, show: boolean | undefined = undefined){
    const ele = $(id)
    const display = !show ?? ele.css('display') !== 'none'
    ele.css('display', display ? 'none': 'inline-block')
}

function toggleDisable(id: string, disabled: boolean | undefined = undefined){
    const ele = $(id)
    const d = disabled ?? ele.attr('disabled') !== 'true'
    if (d){
        ele.attr('disabled', 'true')
    }else{
        ele.removeAttr('disabled')
    }
}

export default {
    input,
    toggleShow,
    toggleDisable,
    select
}