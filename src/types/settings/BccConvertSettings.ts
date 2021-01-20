

export interface BccConvertSettings extends Satisfiable{

    font_size: number,
    font_color: string,
    background_alpha: number,
    background_color: string,
    Stroke: string,
    extra: {
        duration: number,
        no_duplicated: boolean,
        min_dur: number
    }
}