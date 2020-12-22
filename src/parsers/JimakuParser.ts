import { Danmu } from '../types/Danmu'

export interface JimakuParser {

    name: string

    acceptedFormat: string[]

    link: string
    
    parse(txt: string): Promise<Danmu[]>

}