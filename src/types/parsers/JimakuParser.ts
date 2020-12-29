import { Danmu } from '../danmu/Danmu'

export interface JimakuParser {

    name: string

    acceptedFormat: string[]

    link: string
    
    parse(txt: string): Promise<Danmu[]>

}