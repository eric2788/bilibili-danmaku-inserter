import { Danmu } from "../types/Danmu";
import { Loggable } from "../loggers/Loggable";
import { JimakuParser } from "./JimakuParser";

export abstract class JimakuLoggableParser extends Loggable implements JimakuParser {

    abstract name: string
    abstract acceptedFormat: string[]
    abstract link: string

    abstract parse(txt: string): Promise<Danmu[]>

    

    


}