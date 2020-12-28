import { DanmuSettings } from "../danmu/DanmuSettings";
import { VideoInfo } from "../infos/VideoInfo";

export interface BilibiliInserterSettings extends Satisfiable{

    currentVideo: VideoInfo, 
    danmuStyle: DanmuSettings,
    interval: number,
    resendInterval: number

}