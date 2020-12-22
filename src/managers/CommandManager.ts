import { Runtime } from "webextension-polyfill-ts"

const commandMap = new Map<string, CommandHandle>()

const addCommand = (type: string, func: CommandHandle) => {
    if (commandMap.has(type)){
        console.warn(`map 内部已有名为 ${type} 的指令`)
        return
    }
    commandMap.set(type, func)
}

type CommandHandle = (data: any | undefined, sender: Runtime.MessageSender) => Promise<any>


function handleMessage(message: {type: string, data: any | undefined}, sender: Runtime.MessageSender): Promise<any>{
    const { type, data } = message
    console.log(`received command: ${type}, data: `)
    console.log(data)
    return commandMap?.get(type)?.call(window, data, sender)
}

export default {
    addCommand,
    handleMessage
}