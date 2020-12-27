import { SubtitleInfo } from "./infos/SubtitleInfo";

export interface BilibiliCommunityCaption {
    font_size?: number,
    font_color?: string,
    background_alpha?: number,
    background_color?: string,
    Stroke?: string,
    body: SubtitleInfo[]
}