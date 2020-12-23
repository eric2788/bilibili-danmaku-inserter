export interface DanmuSettings {
    color: number, 
    position?: Position, 
    fontSize?: Size,
    isSub?: boolean
}

export type Size = 'normal' | 'large' | 'small'

export type Position = 'normal' | 'top' | 'botom'