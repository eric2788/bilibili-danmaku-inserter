import { DanmuPayload } from "../utils/messaging";
import { DanmuSettings } from "./DanmuSettings";
import { VideoInfo } from "./VideoInfo";

export interface StorageSettings {

    currentVideo?: VideoInfo, 
    danmuStyle?: DanmuSettings

}