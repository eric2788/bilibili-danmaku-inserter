export interface ICUJimaku {

    info: {
        bilibili_uid: string,
        start_time: number,
        title: string,
        live: boolean,
        end_time: number,
        total_danmu: number,
        total_gift: number,
        total_reward: number,
        total_superchat: number,
        views: number,
        name: string
    },

    full_comments: {
        time: number,
        text: string,
        user_id: number,
        username: string
    }[]
    
}