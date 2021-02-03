import { Danmu } from '../danmu/Danmu'
import { ParserSettings } from '../settings/ParserSettings';

export interface JimakuParser {

    name: string

    acceptedFormat: string[]

    link: string
    
    parse(txt: string, setting: ParserSettings): Promise<Danmu[]>

}