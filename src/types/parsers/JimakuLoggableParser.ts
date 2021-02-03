import { Danmu } from "../danmu/Danmu";
import { Loggable } from "../../loggers/Loggable";
import { JimakuParser } from "./JimakuParser";
import { ParserSettings } from "../settings/ParserSettings";

export abstract class JimakuLoggableParser extends Loggable implements JimakuParser {

    abstract name: string
    abstract acceptedFormat: string[]
    abstract link: string

    abstract parse(txt: string, setting: ParserSettings): Promise<Danmu[]>

}