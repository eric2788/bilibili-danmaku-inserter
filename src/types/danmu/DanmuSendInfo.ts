import { DanmuPayload } from "../../utils/messaging";

export interface DanmuSendInfo {
    msg: string, 
    nano: number, 
    payload: DanmuPayload,
    datetime?: number
}